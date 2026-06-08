import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { apiGet, apiPost } from "../lib/api";
import { EMPTY_FORM } from "../lib/constants";
import { today, enrichTask, advanceDeadline, isPurgeReady } from "../lib/taskLogic";

// 앱의 모든 상태·동기화·CRUD 로직. 렌더 없음.
export function useTaskManager() {
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState({ q: "ALL", search: "" });
  const [tab, setTab] = useState("active");
  const [sideRight, setSideRight] = useState(false);
  const [themeKey, setThemeKey] = useState("dark");
  const [appName, setAppName] = useState("우선순위 매트릭스");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("idle");
  const nextId = useRef(Date.now());

  // 콜백이 stale 없이 최신값을 읽도록 ref 미러링
  const refs = useRef({});
  refs.current = { tasks, completed, deleted, form, editId, selected };

  // 파생 데이터 — tasks 변경 시에만 재계산
  const enriched = useMemo(() => tasks.map(enrichTask), [tasks]);
  const filtered = useMemo(() => enriched
    .filter(t => {
      if (filter.q !== "ALL" && t.q !== filter.q) return false;
      if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => { const ha = a.hours === null ? 1e9 : a.hours, hb = b.hours === null ? 1e9 : b.hours; return ha - hb || b.importance - a.importance; }),
    [enriched, filter]);
  const enrichedRef = useRef(enriched);
  enrichedRef.current = enriched;

  // 설정 변경 시 DB 저장 (로드 완료 후에만)
  useEffect(() => {
    if (!settingsLoaded) return;
    apiPost({ action: "saveSettings", settings: { sideRight, themeKey, appName } }).catch(() => {});
  }, [sideRight, themeKey, appName, settingsLoaded]);

  useEffect(() => { document.title = appName; }, [appName]);

  // 초기 로드
  useEffect(() => {
    Promise.all([apiGet("getTasks"), apiGet("getCompleted"), apiGet("getSettings")])
      .then(([t, c, s]) => {
        if (t.ok) {
          const all = t.data || [];
          setTasks(all.filter(x => !x.deletedAt || x.deletedAt === ""));
          setDeleted(all.filter(x => x.deletedAt && x.deletedAt !== ""));
        }
        if (c.ok) setCompleted(c.data || []);
        if (s.ok && s.data) {
          const cfg = s.data;
          if (cfg.sideRight !== undefined) setSideRight(cfg.sideRight === "true" || cfg.sideRight === true);
          if (cfg.themeKey) setThemeKey(cfg.themeKey);
          if (cfg.appName) setAppName(cfg.appName);
        }
        setSettingsLoaded(true);
        setLoading(false);
      })
      .catch(() => { setSettingsLoaded(true); setLoading(false); });
  }, []);

  // 24h 경과 soft-delete 자동 영구 삭제
  useEffect(() => {
    const id = setInterval(() => {
      setDeleted(prev => {
        prev.filter(isPurgeReady).forEach(t => apiPost({ action: "deleteTask", id: t.id }));
        return prev.filter(t => !isPurgeReady(t));
      });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const syncOp = useCallback((fn) => {
    setSyncStatus("syncing");
    return fn()
      .then(r => {
        if (r && r.ok) { setSyncStatus("ok"); setTimeout(() => setSyncStatus("idle"), 2000); return true; }
        setSyncStatus("error"); setTimeout(() => setSyncStatus("idle"), 3000); return false;
      })
      .catch(() => { setSyncStatus("error"); setTimeout(() => setSyncStatus("idle"), 3000); return false; });
  }, []);

  const saveTask = useCallback(async () => {
    const { form, editId, tasks } = refs.current;
    if (!form.title.trim()) return;
    const deadline = form.deadline || today();
    const data = { ...form, deadline, importance: Number(form.importance), repeatInterval: Number(form.repeatInterval) || 2 };
    if (editId !== null) {
      const prev = tasks.find(t => t.id === editId);
      const updated = { ...prev, ...data };
      setTasks(ts => ts.map(t => t.id === editId ? updated : t));
      setEditId(null); setForm(EMPTY_FORM); setShowForm(false);
      const ok = await syncOp(() => apiPost({ action: "updateTask", task: updated }));
      if (!ok) { setTasks(ts => ts.map(t => t.id === editId ? prev : t)); setEditId(editId); setForm(data); setShowForm(true); }
    } else {
      const t = { id: String(nextId.current++), ...data, memos: [], createdAt: new Date().toISOString() };
      setTasks(ts => [...ts, t]);
      const ok = await syncOp(() => apiPost({ action: "addTask", task: t }));
      if (ok) { setForm(EMPTY_FORM); setShowForm(false); }
      else { setTasks(ts => ts.filter(x => x.id !== t.id)); nextId.current--; }
    }
  }, [syncOp]);

  const startEdit = useCallback((t) => {
    setForm({ title: t.title, deadline: t.deadline, deadlineTime: t.deadlineTime || "", importance: t.importance, note: t.note || "", repeat: t.repeat || "", repeatInterval: t.repeatInterval || 2, repeatWeekdays: t.repeatWeekdays || [], autoRepeat: t.autoRepeat !== false });
    setEditId(t.id); setShowForm(true);
  }, []);

  const cancelForm = useCallback(() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(false); }, []);

  const deleteTask = useCallback(async (id) => {
    const { tasks, selected } = refs.current;
    const t = tasks.find(x => x.id === id); if (!t) return;
    const softDel = { ...t, deletedAt: new Date().toISOString() };
    setTasks(ts => ts.filter(x => x.id !== id));
    setDeleted(ds => [softDel, ...ds]);
    if (selected === id) setSelected(null);
    const ok = await syncOp(() => apiPost({ action: "updateTask", task: softDel }));
    if (!ok) { setTasks(ts => [...ts, t]); setDeleted(ds => ds.filter(x => x.id !== id)); }
  }, [syncOp]);

  const restoreDeleted = useCallback((id) => {
    const { deleted } = refs.current;
    const t = deleted.find(x => x.id === id); if (!t) return;
    const { deletedAt, ...rest } = t;
    setDeleted(ds => ds.filter(x => x.id !== id));
    setTasks(ts => [...ts, rest]);
    syncOp(() => apiPost({ action: "updateTask", task: rest }));
  }, [syncOp]);

  const purgeDeleted = useCallback((id) => {
    setDeleted(ds => ds.filter(x => x.id !== id));
    syncOp(() => apiPost({ action: "deleteTask", id }));
  }, [syncOp]);

  const completeTask = useCallback(async (id) => {
    const { selected } = refs.current;
    const t = enrichedRef.current.find(x => x.id === id); if (!t) return;
    const ct = { ...t, completedAt: new Date().toISOString() };
    setCompleted(cs => [ct, ...cs]);
    setTasks(ts => ts.filter(x => x.id !== id));
    if (selected === id) setSelected(null);
    if (t.repeat && t.autoRepeat !== false) {
      const next = advanceDeadline({ ...t, memos: [], createdAt: new Date().toISOString(), id: String(Date.now()) });
      setTasks(ts => [...ts, next]);
      await syncOp(() => apiPost({ action: "completeTask", id, completedTask: ct }));
      syncOp(() => apiPost({ action: "addTask", task: next }));
    } else {
      syncOp(() => apiPost({ action: "completeTask", id, completedTask: ct }));
    }
  }, [syncOp]);

  const undoComplete = useCallback((id) => {
    const { completed } = refs.current;
    const t = completed.find(x => x.id === id); if (!t) return;
    const { completedAt, hours, urgency, q, label, ...rest } = t;
    setTasks(ts => [...ts, rest]); setCompleted(cs => cs.filter(x => x.id !== id)); setDetailTask(null);
    syncOp(() => apiPost({ action: "undoComplete", id, task: rest }));
  }, [syncOp]);

  const snoozeRepeat = useCallback((id) => { setTasks(ts => ts.map(t => t.id === id ? advanceDeadline(t) : t)); }, []);

  const toggleWeekday = useCallback((d) => {
    setForm(f => ({ ...f, repeatWeekdays: f.repeatWeekdays.includes(d) ? f.repeatWeekdays.filter(x => x !== d) : [...f.repeatWeekdays, d] }));
  }, []);

  const updateTaskMemos = useCallback((tid, memos) => {
    setTasks(ts => ts.map(t => t.id === tid ? { ...t, memos } : t));
    syncOp(() => apiPost({ action: "updateMemos", id: tid, memos, sheet: "tasks" }));
  }, [syncOp]);

  const updateCompletedMemos = useCallback((tid, memos) => {
    setCompleted(cs => cs.map(t => t.id === tid ? { ...t, memos } : t));
    setDetailTask(dt => dt && dt.id === tid ? { ...dt, memos } : dt);
    syncOp(() => apiPost({ action: "updateMemos", id: tid, memos, sheet: "completed" }));
  }, [syncOp]);

  const activeAddMemo = useCallback((tid, text) => { const t = refs.current.tasks.find(x => x.id === tid); updateTaskMemos(tid, [...(t?.memos || []), { text, createdAt: new Date().toISOString() }]); }, [updateTaskMemos]);
  const activeEditMemo = useCallback((tid, idx, text) => { const t = refs.current.tasks.find(x => x.id === tid); updateTaskMemos(tid, (t?.memos || []).map((x, i) => i === idx ? { ...x, text } : x)); }, [updateTaskMemos]);
  const activeDeleteMemo = useCallback((tid, idx) => { const t = refs.current.tasks.find(x => x.id === tid); updateTaskMemos(tid, (t?.memos || []).filter((_, i) => i !== idx)); }, [updateTaskMemos]);
  const completedAddMemo = useCallback((tid, text) => { const t = refs.current.completed.find(x => x.id === tid); updateCompletedMemos(tid, [...(t?.memos || []), { text, createdAt: new Date().toISOString() }]); }, [updateCompletedMemos]);
  const completedEditMemo = useCallback((tid, idx, text) => { const t = refs.current.completed.find(x => x.id === tid); updateCompletedMemos(tid, (t?.memos || []).map((x, i) => i === idx ? { ...x, text } : x)); }, [updateCompletedMemos]);
  const completedDeleteMemo = useCallback((tid, idx) => { const t = refs.current.completed.find(x => x.id === tid); updateCompletedMemos(tid, (t?.memos || []).filter((_, i) => i !== idx)); }, [updateCompletedMemos]);

  return {
    tasks, completed, deleted, form, editId, showForm, selected, filter, tab,
    sideRight, themeKey, appName, showSettings, detailTask, loading, syncStatus,
    enriched, filtered,
    setForm, setEditId, setShowForm, setSelected, setFilter, setTab,
    setSideRight, setThemeKey, setAppName, setShowSettings, setDetailTask,
    saveTask, startEdit, cancelForm, deleteTask, restoreDeleted, purgeDeleted,
    completeTask, undoComplete, snoozeRepeat, toggleWeekday,
    activeAddMemo, activeEditMemo, activeDeleteMemo,
    completedAddMemo, completedEditMemo, completedDeleteMemo,
  };
}
