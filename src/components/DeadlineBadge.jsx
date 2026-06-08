export default function DeadlineBadge({ label, th }) {
  if (!label) return null;
  const lc = th.labelColors[label.level];
  return <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: lc.bg, color: lc.color, border: `1px solid ${lc.border}`, whiteSpace: "nowrap" }}>{label.text}</span>;
}
