"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import CheckInTab from "@/components/tabs/CheckInTab";

export default function CheckInPage() {
  const { assets, liabilities, netWorthSnapshots } = useLedgerData();

  return <CheckInTab assets={assets} liabilities={liabilities} netWorthSnapshots={netWorthSnapshots} />;
}
