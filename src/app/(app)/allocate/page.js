"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import AllocateTab from "@/components/tabs/AllocateTab";

export default function AllocatePage() {
  const {
    alloc,
    handleAllocUpdate,
    opportunities,
    isAdmin,
    handleAddOpportunity,
    handleUpdateOpportunity,
    handleDeleteOpportunity,
  } = useLedgerData();

  return (
    <AllocateTab
      alloc={alloc}
      onUpdateAlloc={handleAllocUpdate}
      opportunities={opportunities}
      isAdmin={isAdmin}
      onAddOpportunity={handleAddOpportunity}
      onUpdateOpportunity={handleUpdateOpportunity}
      onDeleteOpportunity={handleDeleteOpportunity}
    />
  );
}
