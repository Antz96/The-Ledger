export default function TierCard({ title, color, points }) {
  return (
    <div className="ledger-card p-4 sm:p-5">
      <p className="serif text-sm mb-3" style={{ color }}>{title}</p>
      <ul className="text-xs space-y-1.5 opacity-80 leading-relaxed list-disc pl-4">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
