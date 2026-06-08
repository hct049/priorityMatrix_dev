// 여러 컴포넌트가 공유하는 인라인 스타일 빌더 (단일 사용 아님).
export function sm(th) {
  return { background: "transparent", border: `1px solid ${th.border2}`, color: "#00D4AA", borderRadius: 3, padding: "3px 6px", fontSize: 10, cursor: "pointer", fontFamily: "inherit", lineHeight: 1 };
}

export const IB = { background: "transparent", border: "none", cursor: "pointer", padding: "2px 3px", lineHeight: 1 };

export function inputStyle(th) {
  return { width: "100%", background: th.inputBg, border: `1px solid ${th.border2}`, borderRadius: 6, padding: "8px 10px", color: th.inputColor, fontSize: 12, transition: "border-color 0.13s" };
}

export function labelStyle(th) {
  return { fontSize: 10, color: th.textMuted, display: "block", marginBottom: 4 };
}
