"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import AllocateTab from "@/components/tabs/AllocateTab";

export default function AllocatePage() {
  const { alloc, handleAllocUpdate, transactions } = useLedgerData();

  return <AllocateTab alloc={alloc} onUpdateAlloc={handleAllocUpdate} transactions={transactions} />;
}
