"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import WelcomeGuide from "@/components/WelcomeGuide";

export default function WelcomePage() {
  const { profile } = useLedgerData();
  return <WelcomeGuide displayName={profile?.display_name} />;
}
