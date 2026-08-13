"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import NetWorthSummary from "@/components/tabs/NetWorthSummary";
import DashboardTab from "@/components/tabs/DashboardTab";

export default function DashboardPage() {
  const { assets, liabilities, transactions, goal, handleGoalSave, activeMonth, setActiveMonth } = useLedgerData();
  return (
    <>
      <NetWorthSummary assets={assets} liabilities={liabilities} />
      <DashboardTab
        transactions={transactions}
        goal={goal}
        onGoalSave={handleGoalSave}
        activeMonth={activeMonth}
        setActiveMonth={setActiveMonth}
      />
    </>
  );
}
