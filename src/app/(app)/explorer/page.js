"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import ExplorerTab from "@/components/tabs/ExplorerTab";

export default function ExplorerPage() {
  const { opportunities, isAdmin, handleAddOpportunity, handleUpdateOpportunity, handleDeleteOpportunity } = useLedgerData();
  return (
    <ExplorerTab
      opportunities={opportunities}
      isAdmin={isAdmin}
      onAddOpportunity={handleAddOpportunity}
      onUpdateOpportunity={handleUpdateOpportunity}
      onDeleteOpportunity={handleDeleteOpportunity}
    />
  );
}
