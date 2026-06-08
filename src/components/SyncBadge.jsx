export default function SyncBadge({ status, th }) {
  const map = {
    idle: { c: th.textFaint, t: "", spin: false },
    syncing: { c: "#FFB800", t: "동기화 중...", spin: true },
    ok: { c: "#00D4AA", t: "✓ 저장됨", spin: false },
    error: { c: "#FF4444", t: "⚠ 저장 실패", spin: false },
  };
  const s = map[status] || map.idle;
  if (!s.t) return null;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: s.c, transition: "color 0.3s" }}>
      {s.spin && <span style={{ display: "inline-block", width: 8, height: 8, border: "1.5px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
      {s.t}
    </span>
  );
}
