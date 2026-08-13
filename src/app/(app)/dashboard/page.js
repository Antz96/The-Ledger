"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import NetWorthSummary from "@/components/tabs/NetWorthSummary";
import DashboardTab from "@/components/tabs/DashboardTab";
import RecommendedForYou from "@/components/tabs/RecommendedForYou";

export default function DashboardPage() {
  const { assets, liabilities, transactions, goal, handleGoalSave, activeMonth, setActiveMonth, profile, articles } = useLedgerData();
  return (
    <>
      <RecommendedForYou tags={profile?.tags} articles={articles} />
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
