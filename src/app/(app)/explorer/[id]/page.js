"use client";

import { useParams } from "next/navigation";
import { useLedgerData } from "@/lib/LedgerDataContext";
import OpportunityDetailTab from "@/components/tabs/OpportunityDetailTab";

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const { opportunities, isAdmin, handleUpdateOpportunity, handleDeleteOpportunity } = useLedgerData();
  const opportunity = opportunities.find((o) => o.id === id);

  return (
    <OpportunityDetailTab
      opportunity={opportunity}
      isAdmin={isAdmin}
      onUpdate={handleUpdateOpportunity}
      onDelete={handleDeleteOpportunity}
    />
  );
}
