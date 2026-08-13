"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import DashboardTab from "@/components/tabs/DashboardTab";

export default function DashboardPage() {
  const { transactions, goal, handleGoalSave, activeMonth, setActiveMonth } = useLedgerData();
  return (
    <DashboardTab
      transactions={transactions}
      goal={goal}
      onGoalSave={handleGoalSave}
      activeMonth={activeMonth}
      setActiveMonth={setActiveMonth}
    />
  );
}
