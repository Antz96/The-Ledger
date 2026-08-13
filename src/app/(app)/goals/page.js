"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import GoalsTab from "@/components/tabs/GoalsTab";

export default function GoalsPage() {
  const { financialGoals, handleAddFinancialGoal, handleUpdateFinancialGoal, handleDeleteFinancialGoal } = useLedgerData();
  return (
    <GoalsTab
      goals={financialGoals}
      onAdd={handleAddFinancialGoal}
      onUpdate={handleUpdateFinancialGoal}
      onDelete={handleDeleteFinancialGoal}
    />
  );
}
