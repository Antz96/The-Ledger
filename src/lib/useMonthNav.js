"use client";

import { useMemo } from "react";
import { monthKey, todayKey } from "@/lib/ledgerConstants";

export function useMonthNav(transactions, activeMonth, setActiveMonth) {
  const months = useMemo(() => {
    const set = new Set(transactions.map((t) => monthKey(t.date)));
    set.add(activeMonth);
    set.add(todayKey());
    return Array.from(set).sort();
  }, [transactions, activeMonth]);

  const monthIndex = months.indexOf(activeMonth);
  const monthTx = useMemo(
    () => transactions.filter((t) => monthKey(t.date) === activeMonth).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [transactions, activeMonth]
  );

  function shiftMonth(d) {
    const dt = new Date(activeMonth + "-01");
    dt.setMonth(dt.getMonth() + d);
    setActiveMonth(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`);
  }

  return { months, monthIndex, monthTx, shiftMonth };
}
