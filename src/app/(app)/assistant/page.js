"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import AssistantTab from "@/components/tabs/AssistantTab";

export default function AssistantPage() {
  const { profile } = useLedgerData();
  return <AssistantTab displayName={profile?.display_name} />;
}
