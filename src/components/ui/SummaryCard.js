export default function SummaryCard({ icon, label, value, color }) {
  return (
    <div className="ledger-card p-4">
      <div className="flex items-center gap-1.5 mb-2 text-[11px] mono opacity-60" style={{ color }}>
        {icon} {label.toUpperCase()}
      </div>
      <p className="serif text-xl sm:text-2xl">{value}</p>
    </div>
  );
}
