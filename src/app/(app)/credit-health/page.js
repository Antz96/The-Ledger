"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import CreditHealthTab from "@/components/tabs/CreditHealthTab";

export default function CreditHealthPage() {
  const {
    creditActionProgress,
    handleToggleCreditAction,
    creditProfile,
    handleSaveCreditProfile,
    creditGoalSelections,
    handleToggleCreditGoal,
  } = useLedgerData();

  return (
    <CreditHealthTab
      completedActionIds={creditActionProgress.map((row) => row.action_id)}
      onToggleAction={handleToggleCreditAction}
      profile={creditProfile}
      onSaveProfile={handleSaveCreditProfile}
      selectedGoalIds={creditGoalSelections.map((row) => row.goal_id)}
      onToggleGoal={handleToggleCreditGoal}
    />
  );
}
