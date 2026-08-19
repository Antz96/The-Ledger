"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import { monthlyTotals } from "@/lib/financialCalculations";
import NetWorthSummary from "@/components/tabs/NetWorthSummary";
import DashboardTab from "@/components/tabs/DashboardTab";
import RecommendedForYou from "@/components/tabs/RecommendedForYou";
import KeyChanges from "@/components/tabs/KeyChanges";

export default function DashboardPage() {
  const {
    assets, liabilities, transactions, netWorthSnapshots, financialGoals,
    goal, handleGoalSave, activeMonth, setActiveMonth, profile, articles,
  } = useLedgerData();
  const totalSaved = monthlyTotals(transactions).savings;
  const goalPct = goal > 0 ? Math.min(100, (totalSaved / goal) * 100) : 0;
  return (
    <>
      <RecommendedForYou tags={profile?.tags} articles={articles} />
      <KeyChanges transactions={transactions} financialGoals={financialGoals} netWorthSnapshots={netWorthSnapshots} />
      <NetWorthSummary
        assets={assets}
        liabilities={liabilities}
        transactions={transactions}
        netWorthSnapshots={netWorthSnapshots}
        goalPct={goalPct}
      />
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
