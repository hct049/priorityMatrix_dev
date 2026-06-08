import { useState } from "react";
import { fmtTs } from "../lib/taskLogic";
import { sm } from "../lib/uiStyles";

export default function MemoSection({ memos = [], onAddMemo, onEditMemo, onDeleteMemo, th }) {
  const [showInput, setShowInput] = useState(false);
  const [draft, setDraft] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState("");
  const IS = { background: th.inputBg, border: `1px solid ${th.border2}`, borderRadius: 4, padding: "5px 7px", color: th.inputColor, fontSize: 11, fontFamily: "inherit", width: "100%" };

  function submitAdd(e) { e.stopPropagation(); if (!draft.trim()) return; onAddMemo(draft.trim()); setDraft(""); setShowInput(false); }
  function cancelAdd(e) { e.stopPropagation(); setDraft(""); setShowInput(false); }
  function submitEdit(e, i) { e.stopPropagation(); onEditMemo(i, editVal.trim()); setEditIdx(null); }

  return (
    <div style={{ marginTop: 8 }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 10, color: th.textMuted }}>메모</span>
        {!showInput && (
          <button onClick={e => { e.stopPropagation(); setShowInput(true); }} style={{ ...sm(th), color: "#00D4AA", borderColor: "#00D4AA44", fontSize: 10 }}>
            + 메모 추가
          </button>
        )}
      </div>

      {memos.map((m, i) => (
        <div key={i} style={{ marginBottom: 5 }}>
          {editIdx === i ? (
            <div style={{ display: "flex", gap: 4 }}>
              <textarea value={editVal} onChange={e => setEditVal(e.target.value)} rows={2} autoFocus style={{ ...IS, flex: 1, resize: "vertical" }} onKeyDown={e => e.stopPropagation()} />
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <button onClick={e => submitEdit(e, i)} style={sm(th)}>✓</button>
                <button onClick={e => { e.stopPropagation(); setEditIdx(null); }} style={{ ...sm(th), color: th.textMuted }}>✕</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
              <div style={{ flex: 1, fontSize: 11, color: th.memoTxt, background: th.memoBg, padding: "5px 8px", borderRadius: 4, borderLeft: `2px solid ${th.memoBorder}`, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {m.text}{m.createdAt && <span style={{ display: "block", fontSize: 9, color: th.memoTs, marginTop: 3 }}>{fmtTs(m.createdAt)}</span>}
              </div>
              <button onClick={e => { e.stopPropagation(); setEditIdx(i); setEditVal(m.text); }} style={{ ...sm(th), color: th.textMuted, marginTop: 2 }}>✎</button>
              <button onClick={e => { e.stopPropagation(); onDeleteMemo(i); }} style={{ ...sm(th), color: "#FF4444", marginTop: 2 }}>×</button>
            </div>
          )}
        </div>
      ))}

      {showInput && (
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="메모 내용 입력..."
            rows={2}
            autoFocus
            onClick={e => e.stopPropagation()}
            onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitAdd(e); if (e.key === "Escape") cancelAdd(e); }}
            style={{ ...IS, flex: 1, resize: "vertical" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <button onClick={submitAdd} style={{ ...sm(th), color: "#00D4AA", borderColor: "#00D4AA44" }}>✓</button>
            <button onClick={cancelAdd} style={{ ...sm(th), color: th.textMuted }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
