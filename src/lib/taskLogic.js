// 순수 계산/가공 함수. React·DOM 의존 없음.
import { WEEKDAY_KO, DELETE_GRACE_MS } from "./constants";

export function today() { return new Date().toISOString().split("T")[0]; }

export function hoursUntil(deadline, deadlineTime) {
  if (!deadline) return null;
  return (new Date(`${deadline}T${deadlineTime || "23:59"}`) - Date.now()) / 3600000;
}

export function urgencyFromHours(h) {
  if (h === null) return 5; if (h <= 0) return 10; if (h <= 6) return 10; if (h <= 24) return 9;
  if (h <= 72) return 8; if (h <= 168) return 6; if (h <= 336) return 4; if (h <= 720) return 2; return 1;
}

export function getQuadrant(u, i) {
  if (u >= 5 && i >= 5) return "Q1"; if (u < 5 && i >= 5) return "Q2"; if (u >= 5 && i < 5) return "Q3"; return "Q4";
}

export function deadlineLabel(hours) {
  if (hours === null) return null;
  if (hours <= 0) { const o = Math.abs(hours); if (o < 1) return { text: `+${Math.round(o * 60)}분`, level: "overdue" }; if (o < 24) return { text: `+${Math.round(o)}시간`, level: "overdue" }; return { text: `+${Math.floor(o / 24)}일`, level: "overdue" }; }
  if (hours < 1) return { text: `${Math.round(hours * 60)}분 남음`, level: "critical" };
  if (hours < 24) return { text: `${Math.round(hours)}시간 남음`, level: "critical" };
  const d = Math.floor(hours / 24); if (d <= 3) return { text: `D-${d}`, level: "urgent" }; if (d <= 7) return { text: `D-${d}`, level: "warn" }; return { text: `D-${d}`, level: "normal" };
}

export function fmtDateTime(deadline, deadlineTime) {
  if (!deadline) return null; const d = new Date(`${deadline}T${deadlineTime || "23:59"}`);
  if (!deadlineTime) return d.toLocaleString("ko-KR", { month: "short", day: "numeric" });
  return d.toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function fmtTs(iso) { return new Date(iso).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }

export function repeatLabel(t) {
  if (!t.repeat) return null; if (t.repeat === "daily") return "매일 반복"; if (t.repeat === "weekly") return "매주 반복";
  if (t.repeat === "biweekly") return "격주 반복"; if (t.repeat === "custom") return `${t.repeatInterval || 2}일마다`;
  if (t.repeat === "weekdays" && t.repeatWeekdays?.length) return t.repeatWeekdays.map(d => WEEKDAY_KO[d]).join("·") + " 반복"; return null;
}

export function advanceDeadline(task) {
  if (!task.deadline) return task;
  const base = new Date(`${task.deadline}T${task.deadlineTime || "00:00"}`); let next = new Date(base);
  if (task.repeat === "daily") next.setDate(next.getDate() + 1);
  else if (task.repeat === "weekly") next.setDate(next.getDate() + 7);
  else if (task.repeat === "biweekly") next.setDate(next.getDate() + 14);
  else if (task.repeat === "custom") next.setDate(next.getDate() + (task.repeatInterval || 2));
  else if (task.repeat === "weekdays" && task.repeatWeekdays?.length) {
    const s = [...task.repeatWeekdays].sort((a, b) => a - b); let d = new Date(base); d.setDate(d.getDate() + 1);
    for (let i = 0; i < 14; i++) { if (s.includes(d.getDay())) { next = d; break; } d.setDate(d.getDate() + 1); }
  }
  return { ...task, deadline: next.toISOString().split("T")[0], deadlineTime: next.toTimeString().slice(0, 5) };
}

export function enrichTask(t) {
  const hours = hoursUntil(t.deadline, t.deadlineTime); const urgency = urgencyFromHours(hours);
  return { ...t, hours, urgency, q: getQuadrant(urgency, t.importance), label: deadlineLabel(hours) };
}

export function isPurgeReady(t) { return t.deletedAt && (Date.now() - new Date(t.deletedAt).getTime()) > DELETE_GRACE_MS; }

export function deletedTimeLeft(t) {
  if (!t.deletedAt) return "";
  const ms = DELETE_GRACE_MS - (Date.now() - new Date(t.deletedAt).getTime());
  if (ms <= 0) return "곧 삭제";
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}시간 후 삭제` : `${m}분 후 삭제`;
}
