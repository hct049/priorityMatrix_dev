import { QUADRANTS, qColor, EMPTY_FORM } from '../lib/constants';
import { repeatLabel, fmtDateTime, fmtTs, deletedTimeLeft } from '../lib/taskLogic';
import { inputStyle, IB } from '../lib/uiStyles';
import DeadlineBadge from './DeadlineBadge';
import MemoSection from './MemoSection';

export default function SidePanel({ tm, th, onClose }) {
  const {
    tab, setTab, tasks, completed, deleted, filtered, filter, setFilter,
    selected, setSelected, setShowForm, setEditId, setForm, setDetailTask,
    completeTask, startEdit, deleteTask, snoozeRepeat,
    activeAddMemo, activeEditMemo, activeDeleteMemo,
    restoreDeleted, purgeDeleted,
  } = tm;
  const IS = inputStyle(th);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${th.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: th.text }}>업무 목록</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); if (onClose) onClose(); }}
              style={{ background: 'transparent', border: '1px solid #00D4AA55', color: '#00D4AA', padding: '3px 9px', borderRadius: 4, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
              + 추가
            </button>
            {onClose && <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: th.textMuted, fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>✕</button>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {[['active', `진행 (${tasks.length})`], ['done', `완료 (${completed.length})`], ['deleted', `삭제됨 (${deleted.length})`]].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)}
              style={{ flex: 1, padding: '5px 0', borderRadius: 4, border: 'none', fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', background: tab === v ? th.tabActive : th.tabInact, color: tab === v ? th.tabActiveTxt : th.tabInactTxt, fontWeight: tab === v ? 700 : 400 }}>
              {l}
            </button>
          ))}
        </div>
        {tab === 'active' && <>
          <input placeholder="🔍 검색" value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} style={{ ...IS, fontSize: 10, padding: '5px 9px', marginBottom: 6 }} />
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {[['ALL', '전체'], ...QUADRANTS.map(q => [q.id, q.label])].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(f => ({ ...f, q: v }))}
                style={{ padding: '2px 7px', borderRadius: 3, border: 'none', fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', background: filter.q === v ? th.filterActive : th.filterInact, color: filter.q === v ? th.filterActiveTxt : th.filterInactTxt, outline: filter.q === v ? `1px solid ${th.filterActiveOutline}` : 'none' }}>
                {l}
              </button>
            ))}
          </div>
        </>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {tab === 'active' && filtered.map(t => {
          const rLabel = repeatLabel(t); const isSel = selected === t.id;
          return (
            <div key={t.id} style={{ background: isSel ? th.rowSelected : 'transparent', borderLeft: `2px solid ${isSel ? qColor(t.q) : 'transparent'}` }}>
              <div className="row" onClick={() => setSelected(isSel ? null : t.id)} style={{ padding: '9px 12px', display: 'flex', gap: 7, alignItems: 'flex-start', transition: 'background 0.12s' }}>
                <button onClick={e => { e.stopPropagation(); completeTask(t.id); }}
                  style={{ width: 15, height: 15, borderRadius: 3, border: `1.5px solid ${th.chkBorder}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2, transition: 'all 0.13s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#00D4AA'; e.currentTarget.style.background = '#00D4AA22'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = th.chkBorder; e.currentTarget.style.background = 'transparent'; }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: th.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: qColor(t.q) + '22', color: qColor(t.q) }}>{t.q}</span>
                    {t.label && <DeadlineBadge label={t.label} th={th} />}
                    {t.deadline && <span style={{ fontSize: 9, color: th.textFaint }}>{fmtDateTime(t.deadline, t.deadlineTime)}</span>}
                    {rLabel && <span style={{ fontSize: 9, color: th.textMuted }}>↻</span>}
                  </div>
                  {isSel && (
                    <div style={{ marginTop: 8, paddingTop: 7, borderTop: `1px solid ${th.border}` }}>
                      {t.note && <div style={{ fontSize: 11, color: th.textMuted, marginBottom: 6 }}>{t.note}</div>}
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
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <button className="act" onClick={e => { e.stopPropagation(); startEdit(t); }} style={{ ...IB, color: th.textMuted, fontSize: 11 }}>✎</button>
                  <button className="act" onClick={e => { e.stopPropagation(); deleteTask(t.id); }} style={{ ...IB, color: '#FF4444', fontSize: 13 }}>×</button>
                </div>
              </div>
            </div>
          );
        })}
        {tab === 'active' && filtered.length === 0 && <div style={{ textAlign: 'center', color: th.textFaint, fontSize: 11, paddingTop: 28 }}>{tasks.length === 0 ? '업무가 없습니다' : '검색 결과 없음'}</div>}

        {tab === 'done' && completed.map(t => (
          <div key={t.id + '_done'} className="row" onClick={() => setDetailTask(t)}
            style={{ padding: '9px 12px', display: 'flex', gap: 7, alignItems: 'flex-start', cursor: 'pointer', borderLeft: '2px solid transparent', transition: 'background 0.12s' }}>
            <div style={{ width: 15, height: 15, borderRadius: 3, background: '#00D4AA', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: '#000', fontWeight: 700 }}>✓</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: th.completedStrike, textDecoration: 'line-through', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
              <div style={{ fontSize: 9, color: th.completedTs, marginTop: 3 }}>완료 {fmtTs(t.completedAt)}</div>
              {(t.memos || []).length > 0 && <div style={{ fontSize: 9, color: th.textMuted, marginTop: 2 }}>메모 {t.memos.length}개</div>}
            </div>
            <span style={{ fontSize: 11, color: th.textFaint, marginTop: 2, flexShrink: 0 }}>›</span>
          </div>
        ))}
        {tab === 'done' && completed.length === 0 && <div style={{ textAlign: 'center', color: th.textFaint, fontSize: 11, paddingTop: 28 }}>완료된 업무 없음</div>}

        {tab === 'deleted' && deleted.map(t => {
          const left = deletedTimeLeft(t);
          return (
            <div key={t.id + '_del'} style={{ padding: '9px 12px', background: th.deletedBg, borderLeft: `2px solid ${th.deletedBorder}`, marginBottom: 2 }}>
              <div style={{ fontSize: 12, color: th.deletedTxt, textDecoration: 'line-through', marginBottom: 3 }}>{t.title}</div>
              <div style={{ fontSize: 9, color: '#FF444488', marginBottom: 5 }}>{left}</div>
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={() => restoreDeleted(t.id)} style={{ fontSize: 10, background: 'transparent', border: `1px solid ${th.border2}`, color: th.textMuted, borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit' }}>↩ 복구</button>
                <button onClick={() => purgeDeleted(t.id)} style={{ fontSize: 10, background: 'transparent', border: '1px solid #FF444444', color: '#FF4444', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit' }}>즉시 삭제</button>
              </div>
            </div>
          );
        })}
        {tab === 'deleted' && deleted.length === 0 && <div style={{ textAlign: 'center', color: th.textFaint, fontSize: 11, paddingTop: 28 }}>삭제된 항목 없음</div>}
      </div>
    </div>
  );
}
