"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLedgerData } from "@/lib/LedgerDataContext";
import CompareTab from "@/components/tabs/CompareTab";

function ComparePageInner() {
  const searchParams = useSearchParams();
  const { opportunities } = useLedgerData();
  const ids = (searchParams.get("ids") || "").split(",").filter(Boolean);
  const selected = ids.map((id) => opportunities.find((o) => o.id === id)).filter(Boolean);

  return <CompareTab opportunities={selected} />;
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <ComparePageInner />
    </Suspense>
  );
}
