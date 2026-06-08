import { useState } from "react";

export default function SettingsModal({ sideRight, setSideRight, themeKey, setThemeKey, appName, setAppName, onClose, th }) {
  const [nameVal, setNameVal] = useState(appName);
  function apply() { setSideRight(sideRight); setAppName(nameVal || "우선순위 매트릭스"); onClose(); }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: th.settingsBg, border: `1px solid ${th.settingsBorder}`, borderRadius: 14, padding: 28, width: 360, maxWidth: "92vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: th.text }}>설정</span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: th.textMuted, fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 2 }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: th.textMuted, marginBottom: 8, fontWeight: 500 }}>앱 이름</div>
            <input value={nameVal} onChange={e => setNameVal(e.target.value)} placeholder="우선순위 매트릭스"
              style={{ width: "100%", background: th.inputBg, border: `1px solid ${th.border2}`, borderRadius: 6, padding: "8px 10px", color: th.inputColor, fontSize: 12, fontFamily: "inherit" }} />
          </div>

          <div>
            <div style={{ fontSize: 11, color: th.textMuted, marginBottom: 8, fontWeight: 500 }}>업무 목록 위치</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["좌측", false], ["우측", true]].map(([l, v]) => (
                <button key={l} onClick={() => setSideRight(v)}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1.5px solid ${sideRight === v ? "#00D4AA" : th.border2}`, background: sideRight === v ? "#00D4AA" : th.inputBg, color: sideRight === v ? "#000" : th.textMuted, fontSize: 13, fontWeight: sideRight === v ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: th.textMuted, marginBottom: 8, fontWeight: 500 }}>테마</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["dark", "🌙 다크"], ["light", "☀️ 라이트"]].map(([k, l]) => (
                <button key={k} onClick={() => setThemeKey(k)}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1.5px solid ${themeKey === k ? "#00D4AA" : th.border2}`, background: themeKey === k ? "#00D4AA" : th.inputBg, color: themeKey === k ? "#000" : th.textMuted, fontSize: 13, fontWeight: themeKey === k ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={apply} style={{ marginTop: 24, width: "100%", background: "#00D4AA", color: "#000", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>저장</button>
      </div>
    </div>
  );
}
