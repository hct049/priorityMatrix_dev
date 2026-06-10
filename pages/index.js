import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { THEMES, EMPTY_FORM, APP_VERSION } from '../lib/constants';
import { useTaskManager } from '../hooks/useTaskManager';
import { useIsMobile } from '../hooks/useIsMobile';
import SidePanel from '../components/SidePanel';
import MatrixGrid from '../components/MatrixGrid';
import SyncBadge from '../components/SyncBadge';

const TaskForm = dynamic(() => import('../components/TaskForm'), { ssr: false });
const SettingsModal = dynamic(() => import('../components/SettingsModal'), { ssr: false });
const CompletedDetail = dynamic(() => import('../components/CompletedDetail'), { ssr: false });
const UpdateModal = dynamic(() => import('../components/UpdateModal'), { ssr: false });

function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      });
      const data = await r.json();
      if (data.ok) {
        window.location.reload();
      } else {
        setError(data.error || '로그인에 실패했습니다.');
        setLoading(false);
      }
    } catch {
      setError('서버에 연결할 수 없습니다.');
      setLoading(false);
    }
  }

  return (
    <div style={{ height: '100vh', background: '#0d0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans KR',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');*{box-sizing:border-box;}input{outline:none;font-family:inherit;}input:focus{border-color:#00D4AA!important;}`}</style>
      <form onSubmit={handleLogin} style={{ background: '#161625', border: '1px solid #2a2a3e', borderRadius: 16, padding: 36, width: 340, maxWidth: '92vw' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>우선순위 매트릭스</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>로그인이 필요합니다</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="text" value={id} onChange={e => setId(e.target.value)}
            placeholder="아이디" autoComplete="username" required disabled={loading}
            style={{ background: '#0d0d1a', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 12px', color: '#e0e0e0', fontSize: 13 }}
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호" autoComplete="current-password" required disabled={loading}
            style={{ background: '#0d0d1a', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 12px', color: '#e0e0e0', fontSize: 13 }}
          />
          {error && <div style={{ fontSize: 11, color: '#ff6b6b', textAlign: 'center' }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ background: loading ? '#006655' : '#00D4AA', color: '#000', border: 'none', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>
      </form>
    </div>
  );
}

function AppContent() {
  const [mounted, setMounted] = useState(false);
  const tm = useTaskManager();
  const isMobile = useIsMobile();
  const [showMobileList, setShowMobileList] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const th = THEMES[tm.themeKey];

  if (tm.loading) {
    return (
      <div style={{ height: '100vh', background: th.appBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans KR',sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${th.border2}`, borderTopColor: '#00D4AA', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 13, color: th.textMuted }}>Google Sheets 연결 중...</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: tm.sideRight ? 'row-reverse' : 'row', height: '100vh', background: th.appBg, fontFamily: "'Noto Sans KR',sans-serif", color: th.text, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${th.scrollThumb};border-radius:2px;}
        .row:hover{background:${th.rowHover}!important;}.act{opacity:0;transition:opacity 0.12s;}.row:hover .act{opacity:1;}
        input,textarea,select{outline:none;font-family:inherit;color-scheme:${th.colorScheme};}
        input:focus,textarea:focus,select:focus{border-color:#00D4AA!important;}
        .slider-t{-webkit-appearance:none;appearance:none;height:3px;border-radius:2px;
          background:linear-gradient(to right,#00D4AA 0%,#00D4AA calc(var(--v)*10%),${th.border2} calc(var(--v)*10%));cursor:pointer;width:100%;}
        .slider-t::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#00D4AA;border:2px solid ${th.inputBg};}
        .matrix-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px;}
        @media(max-width:600px){.matrix-grid{grid-template-columns:1fr!important;}}
        .burger{display:flex;flex-direction:column;gap:4px;cursor:pointer;padding:5px;border-radius:4px;background:transparent;border:none;}
        .burger span{display:block;width:17px;height:2px;background:${th.textMuted};border-radius:1px;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      {!isMobile && (
        <div style={{ width: 268, flexShrink: 0, borderRight: tm.sideRight ? 'none' : `1px solid ${th.border}`, borderLeft: tm.sideRight ? `1px solid ${th.border}` : 'none', background: th.panelBg, display: 'flex', flexDirection: 'column' }}>
          <SidePanel tm={tm} th={th} />
        </div>
      )}

      {isMobile && showMobileList && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setShowMobileList(false); }}>
          <div style={{ background: th.panelBg, border: `1px solid ${th.border}`, borderRadius: 14, width: '100%', maxWidth: 440, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <SidePanel tm={tm} th={th} onClose={() => setShowMobileList(false)} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && <button className="burger" onClick={() => setShowMobileList(true)}><span /><span /><span /></button>}
            <div>
              <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: th.text, letterSpacing: '-0.4px' }}>{tm.appName}</h1>
              <p style={{ margin: '2px 0 0', fontSize: 10, color: th.textMuted }}>마감일 × 중요도 기반 자동 분류</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SyncBadge status={tm.syncStatus} th={th} />
            <span style={{ fontSize: 10, color: th.textFaint }}>진행 {tm.tasks.length} · 완료 {tm.completed.length}</span>
            {!isMobile && (
              <button onClick={() => { tm.setShowForm(true); tm.setEditId(null); tm.setForm(EMPTY_FORM); }}
                style={{ background: 'transparent', border: '1px solid #00D4AA55', color: '#00D4AA', padding: '4px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                + 추가
              </button>
            )}
            <button onClick={() => tm.setShowSettings(true)}
              style={{ background: 'transparent', border: `1px solid ${th.border2}`, color: th.textMuted, fontSize: 13, cursor: 'pointer', padding: '5px 9px', borderRadius: 5, lineHeight: 1, fontFamily: 'inherit' }}>
              ⚙ 설정
            </button>
          </div>
        </div>

        {tm.updateCompletedNotice && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: '#00D4AA18', border: '1px solid #00D4AA44', borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: '#00D4AA', fontWeight: 600 }}>
              ✅ v{tm.updateCompletedNotice.version} {tm.updateCompletedNotice.type === 'web' ? '웹' : 'DB 스키마'} 업데이트가 완료되었습니다!
            </span>
            <button onClick={tm.dismissUpdateNotice} style={{ background: 'transparent', border: 'none', color: '#00D4AA', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px' }}>✕</button>
          </div>
        )}

        {tm.webPendingNotice && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: '#FFB80015', border: '1px solid #FFB80055', borderRadius: 8 }}>
            <div>
              <span style={{ fontSize: 12, color: '#FFB800', fontWeight: 600 }}>⏳ 웹 v{tm.webPendingNotice} 재배포 대기 중</span>
              <span style={{ fontSize: 11, color: '#FFB80099', marginLeft: 8 }}>Vercel 재배포 완료 후 새로 고침하거나 Vercel에서 직접 확인하세요.</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 10 }}>
              <button onClick={() => window.location.reload()} style={{ background: '#FFB800', color: '#000', border: 'none', padding: '4px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>새로 고침</button>
              <button onClick={tm.dismissWebPendingNotice} style={{ background: 'transparent', border: 'none', color: '#FFB800', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px' }}>✕</button>
            </div>
          </div>
        )}

        <MatrixGrid tm={tm} th={th} />

        <div style={{ padding: '9px 12px', background: th.legendBg, borderRadius: 6, border: `1px solid ${th.legendBorder}` }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 10, color: th.textFaint }}>
            <span>Google Sheets 실시간 동기화</span>
            <span>날짜 미입력 시 오늘 마감으로 등록</span>
            <span>삭제 후 24h → 자동 영구 삭제</span>
          </div>
        </div>
      </div>

      {tm.showForm && (
        <TaskForm form={tm.form} setForm={tm.setForm} editId={tm.editId} onSave={tm.saveTask} onCancel={tm.cancelForm} onToggleWeekday={tm.toggleWeekday} th={th} />
      )}
      {tm.detailTask && (
        <CompletedDetail task={tm.detailTask} onClose={() => tm.setDetailTask(null)} onUndo={() => tm.undoComplete(tm.detailTask.id)}
          onAddMemo={text => tm.completedAddMemo(tm.detailTask.id, text)}
          onEditMemo={(idx, text) => tm.completedEditMemo(tm.detailTask.id, idx, text)}
          onDeleteMemo={idx => tm.completedDeleteMemo(tm.detailTask.id, idx)} th={th} />
      )}
      {tm.showSettings && (
        <SettingsModal
          sideRight={tm.sideRight} themeKey={tm.themeKey} appName={tm.appName}
          onSave={tm.saveSettingsRemote} onClose={() => tm.setShowSettings(false)} th={th}
          versionInfo={tm.versionInfo} needsGasUpdate={tm.needsGasUpdate} needsWebUpdate={tm.needsWebUpdate}
          appliedGasVersion={tm.appliedGasVersion} onShowUpdateModal={() => tm.setShowUpdateModal(true)} />
      )}
      {tm.showUpdateModal && (
        <UpdateModal
          versionInfo={tm.versionInfo}
          needsGasUpdate={tm.needsGasUpdate}
          needsWebUpdate={tm.needsWebUpdate}
          appliedGasVersion={tm.appliedGasVersion}
          currentWebVersion={APP_VERSION}
          onUpdateGas={tm.applyGasUpdate}
          onTriggerWebUpdate={tm.triggerWebUpdate}
          onDismiss={tm.dismissUpdate}
          th={th} />
      )}

      {tm.syncStatus === 'syncing' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, cursor: 'wait' }}
          onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()} />
      )}
    </div>
  );
}

export default function Home({ authenticated }) {
  if (!authenticated) return <LoginPage />;
  return <AppContent />;
}

export async function getServerSideProps(context) {
  const { isAuthenticated } = await import('./api/_auth');
  const authenticated = isAuthenticated({ headers: context.req.headers });
  return { props: { authenticated } };
}
