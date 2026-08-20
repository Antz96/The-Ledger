"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import ExplorerTab from "@/components/tabs/ExplorerTab";

export default function ExplorerPage() {
  const {
    alloc, opportunities, financialGoals, isAdmin, handleAddOpportunity, handleUpdateOpportunity, handleDeleteOpportunity,
  } = useLedgerData();

  return (
    <ExplorerTab
      alloc={alloc}
      opportunities={opportunities}
      financialGoals={financialGoals}
      isAdmin={isAdmin}
      onAddOpportunity={handleAddOpportunity}
      onUpdateOpportunity={handleUpdateOpportunity}
      onDeleteOpportunity={handleDeleteOpportunity}
    />
  );
}
