"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert, ExternalLink } from "lucide-react";
import { EXPLORER_CATEGORIES, RISK_COLOR } from "@/lib/explorerCategories";
import { PURPOSE_COLOR } from "@/lib/ledgerConstants";

function bullets(text) {
  if (!text) return [];
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}

function BulletCell({ text }) {
  const items = bullets(text);
  if (items.length === 0) return <span className="opacity-30">—</span>;
  return (
    <ul className="text-xs space-y-1 list-disc pl-3.5">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function TextCell({ value }) {
  return value ? <span className="text-xs">{value}</span> : <span className="opacity-30">—</span>;
}

const ROWS = [
  { label: "TYPICAL PURPOSE", render: (o) => o.typical_purpose ? (
    <span className="text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: `${PURPOSE_COLOR[o.typical_purpose]}1A`, color: PURPOSE_COLOR[o.typical_purpose] }}>
      {o.typical_purpose}
    </span>
  ) : <span className="opacity-30">—</span> },
  { label: "LIQUIDITY", render: (o) => <TextCell value={o.liquidity} /> },
  { label: "TIME HORIZON", render: (o) => <TextCell value={o.time_horizon} /> },
  { label: "FEES", render: (o) => <TextCell value={o.fees} /> },
  { label: "TAX CONSIDERATIONS", render: (o) => <TextCell value={o.tax_considerations} /> },
  { label: "COMMON ACCESS ROUTES", render: (o) => <TextCell value={o.common_access_routes} /> },
  { label: "HOW IT WORKS", render: (o) => <TextCell value={o.how_it_works} /> },
  { label: "PROS", render: (o) => <BulletCell text={o.pros} /> },
  { label: "CONS", render: (o) => <BulletCell text={o.cons} /> },
  { label: "KEY RISKS", render: (o) => <BulletCell text={o.key_risks} /> },
];

export default function CompareTab({ opportunities }) {
  if (opportunities.length === 0) {
    return (
      <div className="space-y-4">
        <Link href="/explorer" className="inline-flex items-center gap-1 text-xs opacity-60 hover:opacity-100">
          <ArrowLeft size={13} /> Back to Explorer
        </Link>
        <div className="ledger-card p-4 sm:p-5 text-center">
          <p className="text-sm opacity-70">None of the selected opportunities could be found — they may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/explorer" className="inline-flex items-center gap-1 text-xs opacity-60 hover:opacity-100">
        <ArrowLeft size={13} /> Back to Explorer
      </Link>

      <div className="ledger-card p-0 overflow-x-auto">
        <table className="w-full border-collapse text-left" style={{ minWidth: `${140 + opportunities.length * 220}px` }}>
          <thead>
            <tr>
              <th className="p-3 sm:p-4 align-bottom" style={{ minWidth: 140 }} />
              {opportunities.map((o) => {
                const category = EXPLORER_CATEGORIES.find((c) => c.id === o.category_id);
                return (
                  <th key={o.id} className="p-3 sm:p-4 align-bottom border-l" style={{ borderColor: "var(--line)", minWidth: 220 }}>
                    <p className="serif text-sm">{o.name}</p>
                    <p className="text-[10px] mono opacity-50 mt-0.5">{category?.title}</p>
                    <span
                      className="inline-block text-[10px] mono mt-1.5 px-1.5 py-0.5 rounded"
                      style={{ background: `${RISK_COLOR[o.risk_level]}1A`, color: RISK_COLOR[o.risk_level] }}
                    >
                      {o.risk_level} risk
                    </span>
                    {o.source_url && (
                      <a
                        href={o.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 mt-2 text-[10px] font-medium"
                        style={{ color: "var(--ledger-green-soft)" }}
                      >
                        <ExternalLink size={10} /> Source
                      </a>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t" style={{ borderColor: "var(--line)" }}>
                <td className="p-3 sm:p-4 text-[10px] mono opacity-50 align-top">{row.label}</td>
                {opportunities.map((o) => (
                  <td key={o.id} className="p-3 sm:p-4 align-top border-l" style={{ borderColor: "var(--line)" }}>
                    {row.render(o)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ledger-card p-4 sm:p-5" style={{ borderColor: "rgba(242,99,122,0.25)" }}>
        <div className="flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
          <p className="text-xs leading-relaxed opacity-80">
            A side-by-side view of the facts already on each opportunity&apos;s page — not a ranking or a
            recommendation. What fits depends on your own age, timeline, debt, and risk tolerance. Consider talking
            to a fee-only fiduciary advisor for guidance specific to your situation.
          </p>
        </div>
      </div>
    </div>
  );
}
