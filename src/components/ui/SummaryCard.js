export default function SummaryCard({ icon, label, value, color, caption }) {
  return (
    <div className="ledger-card p-4">
      <div className="flex items-center gap-1.5 mb-2 text-[11px] mono" style={{ color: color || "var(--muted)" }}>
        {icon} {label.toUpperCase()}
      </div>
      <p className="mono font-semibold text-xl sm:text-2xl text-[var(--text)]">{value}</p>
      {caption && <p className="text-[10px] text-[var(--faint)] mt-1">{caption}</p>}
    </div>
  );
}
