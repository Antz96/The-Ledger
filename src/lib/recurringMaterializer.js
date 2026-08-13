import { monthKey, todayKey } from "@/lib/ledgerConstants";

// "2026-02" + due day 31 → "2026-02-28" (clamped to the month's last day).
export function dueDateFor(month, dueDay) {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return `${month}-${String(Math.min(dueDay, lastDay)).padStart(2, "0")}`;
}

// Inclusive list of 'YYYY-MM' keys from startKey to endKey.
export function monthsBetween(startKey, endKey) {
  const out = [];
  let [y, m] = startKey.split("-").map(Number);
  const [ey, em] = endKey.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}

// 1 → "1st", 22 → "22nd", 31 → "31st"
export function ordinalDay(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

const claimKey = (recurringId, month) => `${recurringId}|${month}`;

// Pure planner: which (item, month) pairs still need materializing.
// Never before the item's creation month, never beyond the current month.
export function planPending(items, claims, todayMonth = todayKey()) {
  const claimed = new Set(claims.map((c) => claimKey(c.recurring_id, c.month)));
  const pending = [];
  for (const item of items) {
    if (!item.active) continue;
    const startMonth = monthKey(item.created_at);
    for (const month of monthsBetween(startMonth, todayMonth)) {
      if (claimed.has(claimKey(item.id, month))) continue;
      pending.push({ item, month, date: dueDateFor(month, item.due_day) });
    }
  }
  return pending;
}

// Claims pending months via upsert (ignoreDuplicates → races across tabs and
// devices are safe: only the winning client gets its rows back), then inserts
// the matching ledger transactions. Returns { txs, claims } actually created.
export async function materializeRecurring(supabase, userId, items, claims, todayMonth = todayKey()) {
  const pending = planPending(items, claims, todayMonth);
  if (pending.length === 0) return { txs: [], claims: [] };

  const { data: won, error: claimError } = await supabase
    .from("recurring_materializations")
    .upsert(
      pending.map((p) => ({ recurring_id: p.item.id, user_id: userId, month: p.month })),
      { onConflict: "recurring_id,month", ignoreDuplicates: true }
    )
    .select();
  if (claimError) throw claimError;
  if (!won || won.length === 0) return { txs: [], claims: [] };

  const wonSet = new Set(won.map((c) => claimKey(c.recurring_id, c.month)));
  const rows = pending
    .filter((p) => wonSet.has(claimKey(p.item.id, p.month)))
    .map((p) => ({
      user_id: userId,
      date: p.date,
      type: p.item.type,
      category: p.item.category,
      amount: p.item.amount,
      note: p.item.name,
      recurring_id: p.item.id,
    }));

  const { data: txs, error: txError } = await supabase.from("transactions").insert(rows).select();
  if (txError) {
    // Release the claims we couldn't fulfil so the next load can retry.
    for (const c of won) {
      await supabase
        .from("recurring_materializations")
        .delete()
        .eq("recurring_id", c.recurring_id)
        .eq("month", c.month);
    }
    throw txError;
  }
  return { txs: txs || [], claims: won };
}

// Unpause path: mark months as handled WITHOUT creating transactions, so a
// paused gap doesn't backfill when the item is switched back on.
export async function claimWithoutMaterializing(supabase, userId, itemId, months) {
  if (months.length === 0) return;
  const { error } = await supabase
    .from("recurring_materializations")
    .upsert(
      months.map((month) => ({ recurring_id: itemId, user_id: userId, month })),
      { onConflict: "recurring_id,month", ignoreDuplicates: true }
    );
  if (error) throw error;
}
