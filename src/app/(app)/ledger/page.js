"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import LedgerTab from "@/components/tabs/LedgerTab";

export default function LedgerPage() {
  const { transactions, activeMonth, setActiveMonth, handleAddTransaction, handleDeleteTransaction } = useLedgerData();
  return (
    <LedgerTab
      transactions={transactions}
      activeMonth={activeMonth}
      setActiveMonth={setActiveMonth}
      onAdd={handleAddTransaction}
      onDelete={handleDeleteTransaction}
    />
  );
}
