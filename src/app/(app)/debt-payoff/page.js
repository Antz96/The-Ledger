"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import DebtPayoffTab from "@/components/tabs/DebtPayoffTab";

export default function DebtPayoffPage() {
  const { liabilities, handleAddLiability, handleUpdateLiability, handleDeleteLiability } = useLedgerData();

  return (
    <DebtPayoffTab
      liabilities={liabilities}
      onAdd={handleAddLiability}
      onUpdate={handleUpdateLiability}
      onDelete={handleDeleteLiability}
    />
  );
}
