"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import RatesTab from "@/components/tabs/RatesTab";

export default function RatesPage() {
  const { rates, isAdmin, handleAddRate, handleUpdateRate, handleDeleteRate } = useLedgerData();
  return (
    <RatesTab rates={rates} isAdmin={isAdmin} onAdd={handleAddRate} onUpdate={handleUpdateRate} onDelete={handleDeleteRate} />
  );
}
