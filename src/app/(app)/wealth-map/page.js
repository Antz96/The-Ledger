"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import WealthMapTab from "@/components/tabs/WealthMapTab";

export default function WealthMapPage() {
  const { assets } = useLedgerData();
  return <WealthMapTab assets={assets} />;
}
