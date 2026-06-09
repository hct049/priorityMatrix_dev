export default function RowInfo({ label, children, th }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <span style={{ fontSize: 10, color: th.textMuted, width: 60, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, color: th.textSub }}>{children}</span>
    </div>
  );
}
