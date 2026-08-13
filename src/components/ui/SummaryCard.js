export default function SummaryCard({ icon, label, value, color, sub }) {
  return (
    <div className="ledger-card p-4">
      <div className="flex items-center gap-1.5 mb-2 text-[11px] mono opacity-60" style={{ color }}>
        {icon} {label.toUpperCase()}
      </div>
      <p className="serif text-xl sm:text-2xl">{value}</p>
      {sub && <p className="text-[11px] mono opacity-50 mt-1">{sub}</p>}
    </div>
  );
}
