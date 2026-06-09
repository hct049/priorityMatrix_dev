import { REPEAT_OPTIONS, WEEKDAY_KO } from '../lib/constants';
import { inputStyle, labelStyle } from '../lib/uiStyles';

export default function TaskForm({ form, setForm, editId, onSave, onCancel, onToggleWeekday, th }) {
  const IS = inputStyle(th);
  const LS = labelStyle(th);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{ background: th.cardBg, border: `1px solid ${th.border2}`, borderRadius: 12, padding: 24, width: 420, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: th.text }}>{editId !== null ? '업무 수정' : '새 업무'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="업무명 *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={IS} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={LS}>마감일 <span style={{ color: th.textFaint, fontSize: 9 }}>(미입력 시 오늘)</span></label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={IS} />
            </div>
            <div><label style={LS}>마감시간</label><input type="time" value={form.deadlineTime} onChange={e => setForm(f => ({ ...f, deadlineTime: e.target.value }))} style={IS} /></div>
          </div>
          <div>
            <label style={LS}>중요도 <span style={{ color: '#00D4AA', fontWeight: 700 }}>{form.importance}</span> / 10</label>
            <input type="range" min={1} max={10} value={form.importance} className="slider-t" style={{ '--v': form.importance }} onChange={e => setForm(f => ({ ...f, importance: Number(e.target.value) }))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: th.textMuted, marginTop: 2 }}><span>낮음</span><span>높음</span></div>
          </div>
          <div>
            <label style={LS}>반복</label>
            <select value={form.repeat} onChange={e => setForm(f => ({ ...f, repeat: e.target.value }))} style={{ ...IS, appearance: 'none' }}>
              {REPEAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {form.repeat === 'custom' && <div><label style={LS}>간격 (일)</label><input type="number" min={1} max={365} value={form.repeatInterval} onChange={e => setForm(f => ({ ...f, repeatInterval: Number(e.target.value) }))} style={IS} /></div>}
          {form.repeat && (
            <div onClick={() => setForm(f => ({ ...f, autoRepeat: !f.autoRepeat }))}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 10px', borderRadius: 6, background: form.autoRepeat ? '#00D4AA18' : 'transparent', border: `1px solid ${form.autoRepeat ? '#00D4AA44' : th.border}`, transition: 'all 0.15s', userSelect: 'none' }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${form.autoRepeat ? '#00D4AA' : th.border2}`, background: form.autoRepeat ? '#00D4AA' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                {form.autoRepeat && <span style={{ color: '#000', fontSize: 10, fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </div>
              <div>
                <div style={{ fontSize: 12, color: th.text, fontWeight: 500 }}>완료 시 다음 주기 자동 생성</div>
                <div style={{ fontSize: 10, color: th.textMuted, marginTop: 1 }}>체크 해제 시 완료 목록으로만 이동</div>
              </div>
            </div>
          )}
          {form.repeat === 'weekdays' && (
            <div>
              <label style={LS}>요일 선택</label>
              <div style={{ display: 'flex', gap: 5 }}>
                {WEEKDAY_KO.map((d, i) => (
                  <button key={i} onClick={() => onToggleWeekday(i)}
                    style={{ width: 30, height: 30, borderRadius: 5, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, background: form.repeatWeekdays.includes(i) ? '#00D4AA' : th.inputBg, color: form.repeatWeekdays.includes(i) ? '#000' : th.textMuted, fontWeight: form.repeatWeekdays.includes(i) ? 700 : 400 }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
          <textarea placeholder="메모 (선택)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} style={{ ...IS, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 7, marginTop: 3 }}>
            <button onClick={onSave} style={{ flex: 1, background: '#00D4AA', color: '#000', border: 'none', padding: 9, borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {editId !== null ? '저장' : '추가'}
            </button>
            <button onClick={onCancel} style={{ background: 'transparent', color: th.textMuted, border: `1px solid ${th.border2}`, padding: '9px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>취소</button>
          </div>
        </div>
      </div>
    </div>
  );
}
