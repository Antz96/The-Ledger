"use client";

import { ShieldAlert } from "lucide-react";
import TierCard from "@/components/ui/TierCard";

export default function LearnTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TierCard title="Low risk" color="var(--ledger-green-soft)" points={[
          "Easy-access savings accounts, Cash ISAs, and fixed-term savings.",
          "FSCS protected up to £85,000 per person, per authorised bank or building society.",
          "Typically used for emergency funds and money you'll need within 1–3 years.",
          "Returns are modest and roughly track the Bank of England base rate.",
        ]} />
        <TierCard title="Medium risk" color="var(--gold)" points={[
          "Broad index funds (e.g. S&P 500) and diversified ETFs.",
          "Not insured — value moves with the market, up and down.",
          "Historically grows faster than savings accounts over 5–10+ year horizons.",
          "Lower fees and less single-company risk than picking individual stocks.",
        ]} />
        <TierCard title="High risk" color="var(--rust)" points={[
          "Individual stocks and cryptocurrency.",
          "Can swing sharply in value, including to zero for individual assets.",
          "Only invest money you could afford to lose entirely.",
          "Position size and diversification matter more as risk goes up.",
        ]} />
      </div>
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-3 flex items-center gap-2">
          <ShieldAlert size={15} style={{ color: "var(--rust)" }} /> Buying crypto without getting scammed
        </p>
        <ul className="text-xs space-y-2 opacity-80 leading-relaxed list-disc pl-4">
          <li>Use a well-known, regulated exchange rather than a link from a text, DM, or social media ad.</li>
          <li>Turn on two-factor authentication, and never share your seed phrase or private key with anyone — no legitimate support agent will ever ask for it.</li>
          <li>Be skeptical of anyone (including a &quot;romantic&quot; contact) urging you to move money into crypto quickly, or promising guaranteed returns — that&apos;s a hallmark of scams.</li>
          <li>Double-check wallet addresses before sending; crypto transfers can&apos;t be reversed.</li>
          <li>Start small while you learn how transfers, gas fees, and custody work.</li>
        </ul>
      </div>
      <p className="text-[11px] mono opacity-40 text-center">General education, not personalized financial advice.</p>
    </div>
  );
}
