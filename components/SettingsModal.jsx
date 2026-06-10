import { useState } from 'react';

export default function SettingsModal({ sideRight, themeKey, appName, onSave, onClose, th }) {
  const [localSideRight, setLocalSideRight] = useState(sideRight);
  const [localThemeKey, setLocalThemeKey] = useState(themeKey);
  const [localAppName, setLocalAppName] = useState(appName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const ok = await onSave({
      sideRight: localSideRight,
      themeKey: localThemeKey,
      appName: localAppName || '우선순위 매트릭스',
    });
    if (ok) {
      onClose();
    } else {
      setSaving(false);
      setError('저장에 실패했습니다. 다시 시도해주세요.');
    }
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.reload();
  }

  const disabled = saving;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (!disabled && e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: th.settingsBg, border: `1px solid ${th.settingsBorder}`, borderRadius: 14, padding: 28, width: 360, maxWidth: '92vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: th.text }}>설정</span>
          <button onClick={onClose} disabled={disabled}
            style={{ background: 'transparent', border: 'none', color: th.textMuted, fontSize: 18, cursor: disabled ? 'not-allowed' : 'pointer', lineHeight: 1, padding: 2, opacity: disabled ? 0.4 : 1 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: th.textMuted, marginBottom: 8, fontWeight: 500 }}>앱 이름</div>
            <input value={localAppName} onChange={e => setLocalAppName(e.target.value)}
              placeholder="우선순위 매트릭스" disabled={disabled}
              style={{ width: '100%', background: th.inputBg, border: `1px solid ${th.border2}`, borderRadius: 6, padding: '8px 10px', color: th.inputColor, fontSize: 12, fontFamily: 'inherit', opacity: disabled ? 0.6 : 1 }} />
          </div>

          <div>
            <div style={{ fontSize: 11, color: th.textMuted, marginBottom: 8, fontWeight: 500 }}>업무 목록 위치</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['좌측', false], ['우측', true]].map(([l, v]) => (
                <button key={l} onClick={() => !disabled && setLocalSideRight(v)} disabled={disabled}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1.5px solid ${localSideRight === v ? '#00D4AA' : th.border2}`, background: localSideRight === v ? '#00D4AA' : th.inputBg, color: localSideRight === v ? '#000' : th.textMuted, fontSize: 13, fontWeight: localSideRight === v ? 700 : 400, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: disabled ? 0.6 : 1 }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: th.textMuted, marginBottom: 8, fontWeight: 500 }}>테마</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['dark', '🌙 다크'], ['light', '☀️ 라이트']].map(([k, l]) => (
                <button key={k} onClick={() => !disabled && setLocalThemeKey(k)} disabled={disabled}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1.5px solid ${localThemeKey === k ? '#00D4AA' : th.border2}`, background: localThemeKey === k ? '#00D4AA' : th.inputBg, color: localThemeKey === k ? '#000' : th.textMuted, fontSize: 13, fontWeight: localThemeKey === k ? 700 : 400, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: disabled ? 0.6 : 1 }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {error && <div style={{ fontSize: 11, color: '#ff6b6b', textAlign: 'center' }}>{error}</div>}
        </div>

        <button onClick={handleSave} disabled={disabled}
          style={{ marginTop: 24, width: '100%', background: disabled ? '#006655' : '#00D4AA', color: '#000', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
          {saving ? '저장 중...' : '저장'}
        </button>

        <button onClick={handleLogout} disabled={disabled}
          style={{ marginTop: 10, width: '100%', background: 'transparent', color: th.textMuted, border: `1px solid ${th.border2}`, padding: '8px', borderRadius: 8, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: disabled ? 0.4 : 1 }}>
          로그아웃
        </button>
      </div>
    </div>
  );
}
