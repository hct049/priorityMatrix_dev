import RowInfo from './RowInfo';
import MemoSection from './MemoSection';
import { fmtTs, fmtDateTime, repeatLabel } from '../lib/taskLogic';
import { sm } from '../lib/uiStyles';

export default function CompletedDetail({ task, onClose, onUndo, onAddMemo, onEditMemo, onDeleteMemo, th }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: th.cardBg, border: `1px solid ${th.border2}`, borderRadius: 12, padding: 24, width: 420, maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: th.textMuted, textDecoration: 'line-through', marginBottom: 4 }}>{task.title}</div>
            <div style={{ fontSize: 10, color: '#00D4AA' }}>완료 {fmtTs(task.completedAt)}</div>
          </div>
          <button onClick={onClose} style={{ ...sm(th), color: th.textMuted, fontSize: 14 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, padding: '12px', background: th.memoBg, borderRadius: 8, border: `1px solid ${th.border}` }}>
          {task.deadline && <RowInfo label="마감일" th={th}>{fmtDateTime(task.deadline, task.deadlineTime)}</RowInfo>}
          <RowInfo label="중요도" th={th}>{task.importance} / 10</RowInfo>
          {task.note && <RowInfo label="기본 메모" th={th}>{task.note}</RowInfo>}
          {repeatLabel(task) && <RowInfo label="반복" th={th}>{repeatLabel(task)}</RowInfo>}
        </div>
        <MemoSection memos={task.memos || []} onAddMemo={onAddMemo} onEditMemo={onEditMemo} onDeleteMemo={onDeleteMemo} th={th} />
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${th.border3}`, display: 'flex', gap: 8 }}>
          <button onClick={onUndo} style={{ flex: 1, background: 'transparent', border: `1px solid ${th.border2}`, color: th.textMuted, padding: '9px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            ↩ 업무 목록으로 복귀
          </button>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${th.border}`, color: th.textFaint, padding: '9px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>닫기</button>
        </div>
      </div>
    </div>
  );
}
