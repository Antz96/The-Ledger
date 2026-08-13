"use client";

import { fmt } from "@/lib/ledgerConstants";
import { useCountUp } from "@/lib/useCountUp";

export default function CountUp({ value }) {
  return <>{fmt(useCountUp(Number(value) || 0))}</>;
}
