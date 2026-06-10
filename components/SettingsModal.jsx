import { useState } from 'react';
import { APP_VERSION } from '../lib/constants';
import { useIsMobile } from '../hooks/useIsMobile';

export default function SettingsModal({ sideRight, themeKey, appName, onSave, onClose, th, versionInfo, needsGasUpdate, needsWebUpdate, appliedGasVersion, onShowUpdateModal }) {
  const isMobile = useIsMobile();
  const [localSideRight, setLocalSideRight] = useState(sideRight);
  const [localThemeKey, setLocalThemeKey] = useState(themeKey);
  const [localAppName, setLocalAppName] = useState(appName);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
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

  async function handleResetDB() {
    if (!window.confirm('⚠️ DB를 초기화하면 모든 작업과 완료 데이터가 영구 삭제됩니다.\n\n정말 초기화하시겠습니까?')) return;
    setResetting(true);
    setError(null);
    try {
      const r = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetDB' }),
      });
      const data = await r.json();
      if (data.ok) {
        window.location.reload();
      } else {
        setError('DB 초기화 실패: ' + (data.error || '알 수 없는 오류'));
        setResetting(false);
      }
    } catch {
      setError('DB 초기화 중 오류가 발생했습니다.');
      setResetting(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.reload();
  }

  const disabled = saving || resetting;

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

          {!isMobile && (
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
          )}

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

          {(needsGasUpdate || needsWebUpdate) && (
            <div style={{ background: '#FFB80015', border: '1px solid #FFB80055', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#FFB800' }}>🔔 업데이트 가능</div>
                <div style={{ fontSize: 10, color: th.textMuted, marginTop: 2 }}>
                  {needsGasUpdate && `DB: ${appliedGasVersion || '미적용'} → ${versionInfo?.gasVersion}`}
                  {needsGasUpdate && needsWebUpdate && ' · '}
                  {needsWebUpdate && `웹: → ${versionInfo?.webVersion}`}
                </div>
              </div>
              <button onClick={() => { onClose(); onShowUpdateModal(); }} disabled={disabled}
                style={{ background: '#FFB800', color: '#000', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0, marginLeft: 10 }}>
                업데이트
              </button>
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={disabled}
          style={{ marginTop: 24, width: '100%', background: disabled ? '#006655' : '#00D4AA', color: '#000', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
          {saving ? '저장 중...' : '저장'}
        </button>

        <button onClick={handleResetDB} disabled={disabled}
          style={{ marginTop: 10, width: '100%', background: 'transparent', color: '#ff6b6b', border: '1px solid #ff6b6b55', padding: '8px', borderRadius: 8, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: disabled ? 0.4 : 1 }}>
          {resetting ? 'DB 초기화 중...' : '🗄️ DB 초기화'}
        </button>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handleLogout} disabled={disabled}
            style={{ background: 'transparent', color: th.textMuted, border: 'none', padding: 0, fontSize: 11, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: disabled ? 0.4 : 0.7 }}>
            로그아웃
          </button>
          <span style={{ fontSize: 10, color: th.textFaint }}>WEB {APP_VERSION} / GAS {versionInfo?.gasVersion || 'v0.0'}</span>
        </div>
      </div>
    </div>
  );
}
