import { useState } from 'react';

export default function UpdateModal({
  versionInfo,
  needsGasUpdate,
  needsWebUpdate,
  appliedGasVersion,
  currentWebVersion,
  onUpdateGas,
  onTriggerWebUpdate,
  onDismiss,
  th,
}) {
  const [skipGas, setSkipGas] = useState(false);
  const [skipWeb, setSkipWeb] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [gasUpdated, setGasUpdated] = useState(false);
  const [webTriggered, setWebTriggered] = useState(false);
  const [error, setError] = useState(null);

  const isUpdating = phase === 'updating';
  const isDone = phase === 'done';

  async function handleUpdate() {
    setPhase('updating');
    setError(null);

    if (needsGasUpdate) {
      const ok = await onUpdateGas();
      if (!ok) { setPhase('error'); setError('DB 스키마 업데이트에 실패했습니다.'); return; }
      setGasUpdated(true);
    }

    if (needsWebUpdate) {
      const ok = await onTriggerWebUpdate();
      if (!ok) { setPhase('error'); setError('웹 업데이트 요청에 실패했습니다.\nGH_PAT 환경변수가 설정되어 있는지 확인하세요.'); return; }
      setWebTriggered(true);
    }

    setPhase('done');
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans KR',sans-serif" }}>
      <div style={{ background: th.settingsBg, border: `1px solid ${th.settingsBorder}`, borderRadius: 14, padding: 28, width: 390, maxWidth: '92vw' }}>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: th.text, marginBottom: 4 }}>
            {isDone ? '✅ 업데이트 완료' : '🔔 업데이트 가능'}
          </div>
          <div style={{ fontSize: 11, color: th.textMuted }}>
            {isDone ? '변경사항이 적용되었습니다.' : '적용 가능한 새로운 업데이트가 있습니다.'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {needsGasUpdate && (
            <div style={{ background: th.inputBg, border: `1px solid ${th.border2}`, borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: th.text }}>📦 DB 스키마 업데이트</div>
                <div style={{ fontSize: 10, color: th.textMuted, marginTop: 3 }}>
                  {appliedGasVersion || '미적용'} → {versionInfo?.gasVersion}
                </div>
                <div style={{ fontSize: 10, color: th.textFaint, marginTop: 2 }}>데이터 유지 · 시트/헤더만 변경</div>
              </div>
              {gasUpdated
                ? <span style={{ fontSize: 18, color: '#00D4AA' }}>✅</span>
                : isUpdating ? <span style={{ fontSize: 11, color: th.textMuted }}>⏳</span>
                : null}
            </div>
          )}

          {needsWebUpdate && (
            <div style={{ background: th.inputBg, border: `1px solid ${th.border2}`, borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: th.text }}>🌐 웹 업데이트</div>
                <div style={{ fontSize: 10, color: th.textMuted, marginTop: 3 }}>
                  {currentWebVersion} → {versionInfo?.webVersion}
                </div>
                {webTriggered
                  ? <div style={{ fontSize: 10, color: '#FFB800', marginTop: 2 }}>재배포 요청됨 · Vercel 완료 후 새로 고침 필요</div>
                  : <div style={{ fontSize: 10, color: th.textFaint, marginTop: 2 }}>GitHub Action으로 자동 업데이트 후 Vercel 재배포</div>}
              </div>
              {webTriggered
                ? <span style={{ fontSize: 18, color: '#FFB800' }}>⏳</span>
                : isUpdating ? <span style={{ fontSize: 11, color: th.textMuted }}>⏳</span>
                : null}
            </div>
          )}
        </div>

        {phase === 'error' && (
          <div style={{ fontSize: 11, color: '#ff6b6b', textAlign: 'center', marginBottom: 14, whiteSpace: 'pre-line' }}>{error}</div>
        )}

        {isDone ? (
          <button onClick={() => window.location.reload()}
            style={{ width: '100%', background: '#00D4AA', color: '#000', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            🔄 새로 고침
          </button>
        ) : (
          <>
            <button onClick={handleUpdate} disabled={isUpdating}
              style={{ width: '100%', background: isUpdating ? '#006655' : '#00D4AA', color: '#000', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: isUpdating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: 12 }}>
              {isUpdating ? '업데이트 중...' : '업데이트하기'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {needsGasUpdate && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: th.textMuted, cursor: 'pointer' }}>
                    <input type="checkbox" checked={skipGas} onChange={e => setSkipGas(e.target.checked)} disabled={isUpdating} style={{ cursor: 'pointer' }} />
                    DB 업데이트 더 보지 않기
                  </label>
                )}
                {needsWebUpdate && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: th.textMuted, cursor: 'pointer' }}>
                    <input type="checkbox" checked={skipWeb} onChange={e => setSkipWeb(e.target.checked)} disabled={isUpdating} style={{ cursor: 'pointer' }} />
                    웹 업데이트 더 보지 않기
                  </label>
                )}
              </div>
              <button onClick={() => onDismiss(skipGas, skipWeb)} disabled={isUpdating}
                style={{ background: 'transparent', border: 'none', color: th.textMuted, fontSize: 12, cursor: isUpdating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: isUpdating ? 0.4 : 1, flexShrink: 0, marginLeft: 12 }}>
                나중에
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
