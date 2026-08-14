"use client";

import Link from "next/link";
import { Landmark, ArrowRight } from "lucide-react";
import { useLedgerData } from "@/lib/LedgerDataContext";
import LedgerTab from "@/components/tabs/LedgerTab";

export default function LedgerPage() {
  const { transactions, activeMonth, setActiveMonth, handleAddTransaction, handleDeleteTransaction } = useLedgerData();
  return (
    <>
      <Link
        href="/connections"
        className="inline-flex items-center gap-1.5 text-xs mb-4 hover:opacity-80"
        style={{ color: "var(--muted)" }}
      >
        <Landmark size={13} /> Connect a bank to skip manual entry (experimental) <ArrowRight size={11} />
      </Link>
      <LedgerTab
        transactions={transactions}
        activeMonth={activeMonth}
        setActiveMonth={setActiveMonth}
        onAdd={handleAddTransaction}
        onDelete={handleDeleteTransaction}
      />
    </>
  );
}
