import { useMemo } from 'react';
import { QUADRANTS } from '../lib/constants';
import { repeatLabel, fmtDateTime } from '../lib/taskLogic';
import { IB } from '../lib/uiStyles';
import DeadlineBadge from './DeadlineBadge';
import MemoSection from './MemoSection';

const byUrgency = (a, b) => { const ha = a.hours === null ? 1e9 : a.hours, hb = b.hours === null ? 1e9 : b.hours; return ha - hb || b.importance - a.importance; };

export default function MatrixGrid({ tm, th }) {
  const { enriched, selected, setSelected, completeTask, startEdit, deleteTask, snoozeRepeat, activeAddMemo, activeEditMemo, activeDeleteMemo } = tm;
  const grouped = useMemo(() => {
    const g = {};
    QUADRANTS.forEach(q => { g[q.id] = enriched.filter(t => t.q === q.id).sort(byUrgency); });
    return g;
  }, [enriched]);

  return (
    <div className="matrix-grid">
      {QUADRANTS.map(q => {
        const qTasks = grouped[q.id];
        return (
          <div key={q.id} style={{ background: th.qCardBg[q.id], border: `1px solid ${th.qCardBorder[q.id]}`, borderRadius: 9, padding: 14, minHeight: 160 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: q.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: q.color }}>{q.label}</span>
              <span style={{ fontSize: 10, color: th.textFaint }}>{q.sub}</span>
              <span style={{ marginLeft: 'auto', fontSize: 9, color: th.textFaint, background: th.rowHover, padding: '1px 6px', borderRadius: 7 }}>{qTasks.length}</span>
            </div>
            {qTasks.length === 0 && <div style={{ fontSize: 10, color: th.emptyTxt, textAlign: 'center', paddingTop: 20 }}>없음</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {qTasks.map(t => {
                const isSel = selected === t.id; const rLabel = repeatLabel(t);
                return (
                  <div key={t.id} className="row" onClick={() => setSelected(isSel ? null : t.id)}
                    style={{ background: isSel ? th.rowSelected : th.memoBg, border: `1px solid ${isSel ? q.color + '55' : th.border}`, borderRadius: 6, padding: '9px 10px', cursor: 'pointer', transition: 'background 0.12s' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <button onClick={e => { e.stopPropagation(); completeTask(t.id); }}
                        style={{ width: 13, height: 13, borderRadius: 3, border: `1.5px solid ${th.chkBorder}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2, transition: 'all 0.13s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = q.color; e.currentTarget.style.background = q.color + '22'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = th.chkBorder; e.currentTarget.style.background = 'transparent'; }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: th.text, marginBottom: 4, wordBreak: 'break-word' }}>{t.title}</div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                          {t.label && <DeadlineBadge label={t.label} th={th} />}
                          {t.deadline && <span style={{ fontSize: 10, color: th.textFaint }}>{fmtDateTime(t.deadline, t.deadlineTime)}</span>}
                          <span style={{ fontSize: 10, color: th.textFaint }}>중요도 {t.importance}</span>
                          {rLabel && <span style={{ fontSize: 9, color: th.textMuted, background: th.rowHover, padding: '1px 5px', borderRadius: 3 }}>↻</span>}
                          {(t.memos || []).length > 0 && <span style={{ fontSize: 9, color: th.textMuted, background: th.rowHover, padding: '1px 5px', borderRadius: 3 }}>💬{t.memos.length}</span>}
                        </div>
                        {isSel && (
                          <div style={{ marginTop: 8, paddingTop: 7, borderTop: `1px solid ${th.border}` }}>
                            {t.note && <div style={{ fontSize: 11, color: th.textMuted, marginBottom: 5 }}>{t.note}</div>}
                            {rLabel && <div style={{ fontSize: 10, color: th.textMuted, marginBottom: 4 }}>↻ {rLabel}</div>}
                            {t.label?.level === 'overdue' && t.repeat && (
                              <button onClick={e => { e.stopPropagation(); snoozeRepeat(t.id); }}
                                style={{ fontSize: 10, color: '#FFB800', background: '#FFB80015', border: '1px solid #FFB80030', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 6 }}>
                                다음 주기로 미루기
                              </button>
                            )}
                            <MemoSection memos={t.memos || []} onAddMemo={text => activeAddMemo(t.id, text)} onEditMemo={(idx, text) => activeEditMemo(t.id, idx, text)} onDeleteMemo={idx => activeDeleteMemo(t.id, idx)} th={th} />
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} className="act">
                        <button onClick={e => { e.stopPropagation(); startEdit(t); }} style={{ ...IB, color: th.textMuted, fontSize: 11 }}>✎</button>
                        <button onClick={e => { e.stopPropagation(); deleteTask(t.id); }} style={{ ...IB, color: '#FF4444', fontSize: 12 }}>×</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
