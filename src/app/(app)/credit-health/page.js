"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import CreditHealthTab from "@/components/tabs/CreditHealthTab";

export default function CreditHealthPage() {
  const { creditActionProgress, handleToggleCreditAction } = useLedgerData();
  return (
    <CreditHealthTab
      completedActionIds={creditActionProgress.map((row) => row.action_id)}
      onToggleAction={handleToggleCreditAction}
    />
  );
}
