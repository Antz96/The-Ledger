import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend,
} from "recharts";
import {
  Plus, Trash2, TrendingUp, TrendingDown, PiggyBank, Wallet, ChevronLeft, ChevronRight,
  Loader2, LogOut, LayoutDashboard, NotebookPen, SlidersHorizontal, GraduationCap, Landmark,
  ShieldAlert, ExternalLink,
} from "lucide-react";

const FONT_LINK_ID = "ledger-fonts";
const EXPENSE_CATS = ["Housing", "Food & Groceries", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other"];
const INCOME_CATS = ["Salary", "Freelance", "Investment", "Gift", "Other"];
const SAVINGS_CATS = ["Emergency Fund", "Retirement", "Goal Fund", "Other"];
const TYPE_META = {
  income: { label: "Income", color: "#2F6B4F", cats: INCOME_CATS },
  expense: { label: "Expense", color: "#A63D40", cats: EXPENSE_CATS },
  savings: { label: "Savings", color: "#B8860B", cats: SAVINGS_CATS },
};
const PIE_COLORS = ["#2F6B4F", "#A63D40", "#B8860B", "#5B7A99", "#8C6A9C", "#C97B4A", "#6B8E6B", "#9A8C78"];

const RATE_DATA = [
  { bank: "Elevault", apy: "4.34%", min: "Varies", note: "Top rate on YieldFinder's daily comparison" },
  { bank: "Axos Bank", apy: "4.21%", min: "$1,500 avg. balance", note: "Requires linked checking + monthly direct deposit to hit top rate" },
  { bank: "Newtek Bank Personal HYS", apy: "4.20%", min: "$0", note: "Currently waitlist-only — paused new applications" },
  { bank: "Primis Business Savings", apy: "4.00%", min: "$1", note: "Business account" },
  { bank: "TIMBR High Yield Savings", apy: "3.95%", min: "$1,000", note: "No monthly fee" },
  { bank: "Bask Bank Interest Savings", apy: "3.75%", min: "$0", note: "No monthly fees or minimums" },
  { bank: "Laurel Road HYS", apy: "3.50%", min: "Varies", note: "" },
  { bank: "Ally Bank Savings", apy: "3.00%", min: "$0", note: "Round-ups and auto-transfer tools" },
];

function monthKey(d) { return d.slice(0, 7); }
function monthLabel(k) { const [y, m] = k.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }); }
function fmt(n) { return (Number(n) || 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }); }
function todayKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function slug(s) { return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "guest"; }

export default function SavingsHub() {
  const [booting, setBooting] = useState(true);
  const [profile, setProfile] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [goal, setGoal] = useState(5000);
  const [goalDraft, setGoalDraft] = useState("5000");
  const [activeMonth, setActiveMonth] = useState(todayKey());
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), type: "expense", category: EXPENSE_CATS[0], amount: "", note: "" });
  const [formError, setFormError] = useState("");

  const [alloc, setAlloc] = useState({ monthly: 500, low: 60, medium: 30, high: 10 });

  useEffect(() => {
    if (!document.getElementById(FONT_LINK_ID)) {
      const link = document.createElement("link");
      link.id = FONT_LINK_ID;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // boot: load profile only
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("profile", false);
        if (r && r.value) setProfile(JSON.parse(r.value));
      } catch (e) { /* no profile yet */ }
      setBooting(false);
    })();
  }, []);

  // once signed in, load that profile's data namespaced by username
  useEffect(() => {
    if (!profile) return;
    (async () => {
      try {
        const ns = slug(profile.username);
        let tx = []; let g = 5000; let a = { monthly: 500, low: 60, medium: 30, high: 10 };
        try { const r = await window.storage.get(`transactions:${ns}`, false); if (r?.value) tx = JSON.parse(r.value); } catch (e) {}
        try { const r = await window.storage.get(`goal:${ns}`, false); if (r?.value) g = JSON.parse(r.value); } catch (e) {}
        try { const r = await window.storage.get(`alloc:${ns}`, false); if (r?.value) a = JSON.parse(r.value); } catch (e) {}
        setTransactions(tx); setGoal(g); setGoalDraft(String(g)); setAlloc(a);
      } catch (e) {
        setError("Couldn't load your saved data for this profile.");
      }
    })();
  }, [profile]);

  const ns = profile ? slug(profile.username) : null;

  const persist = useCallback(async (key, value) => {
    if (!ns) return;
    setSaving(true);
    try { await window.storage.set(`${key}:${ns}`, JSON.stringify(value), false); }
    catch (e) { setError(`Couldn't save changes (${key}).`); }
    finally { setSaving(false); }
  }, [ns]);

  function handleSignIn(e) {
    e.preventDefault();
    const username = nameInput.trim();
    if (!username) return;
    const p = { username, createdAt: new Date().toISOString() };
    setProfile(p);
    window.storage.set("profile", JSON.stringify(p), false).catch(() => setError("Couldn't save your sign-in."));
  }

  function handleSignOut() {
    setProfile(null);
    setTab("dashboard");
    window.storage.delete("profile", false).catch(() => {});
  }

  const months = useMemo(() => {
    const set = new Set(transactions.map((t) => monthKey(t.date)));
    set.add(activeMonth); set.add(todayKey());
    return Array.from(set).sort();
  }, [transactions, activeMonth]);
  const monthIndex = months.indexOf(activeMonth);
  const monthTx = useMemo(() => transactions.filter((t) => monthKey(t.date) === activeMonth).sort((a, b) => (a.date < b.date ? 1 : -1)), [transactions, activeMonth]);
  const totals = useMemo(() => { const t = { income: 0, expense: 0, savings: 0 }; monthTx.forEach((tx) => { t[tx.type] += Number(tx.amount) || 0; }); return t; }, [monthTx]);
  const net = totals.income - totals.expense - totals.savings;
  const totalSaved = useMemo(() => transactions.filter((t) => t.type === "savings").reduce((s, t) => s + (Number(t.amount) || 0), 0), [transactions]);
  const goalPct = goal > 0 ? Math.min(100, (totalSaved / goal) * 100) : 0;
  const expenseByCategory = useMemo(() => {
    const map = {};
    monthTx.filter((t) => t.type === "expense").forEach((t) => { map[t.category] = (map[t.category] || 0) + (Number(t.amount) || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthTx]);
  const trend = useMemo(() => {
    const last6 = months.slice(-6);
    return last6.map((mk) => {
      const t = { income: 0, expense: 0, savings: 0 };
      transactions.filter((tx) => monthKey(tx.date) === mk).forEach((tx) => { t[tx.type] += Number(tx.amount) || 0; });
      return { month: new Date(mk + "-01").toLocaleDateString("en-US", { month: "short" }), Income: t.income, Expense: t.expense, Saved: t.savings };
    });
  }, [months, transactions]);

  function handleAdd(e) {
    e.preventDefault(); setFormError("");
    const amt = parseFloat(form.amount);
    if (!form.date) return setFormError("Pick a date.");
    if (!amt || amt <= 0) return setFormError("Enter an amount greater than zero.");
    const entry = { id: uid(), date: form.date, type: form.type, category: form.category, amount: amt, note: form.note.trim() };
    const next = [...transactions, entry];
    setTransactions(next); persist("transactions", next);
    setActiveMonth(monthKey(form.date));
    setForm((f) => ({ ...f, amount: "", note: "" }));
  }
  function handleDelete(id) { const next = transactions.filter((t) => t.id !== id); setTransactions(next); persist("transactions", next); }
  function handleGoalSave() { const g = parseFloat(goalDraft); if (!g || g <= 0) return; setGoal(g); persist("goal", g); }
  function shiftMonth(d) { const dt = new Date(activeMonth + "-01"); dt.setMonth(dt.getMonth() + d); setActiveMonth(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`); }

  function updateAlloc(field, value) {
    const next = { ...alloc, [field]: value };
    setAlloc(next); persist("alloc", next);
  }
  const allocSum = alloc.low + alloc.medium + alloc.high;
  const allocDollars = {
    low: (alloc.monthly * alloc.low) / 100,
    medium: (alloc.monthly * alloc.medium) / 100,
    high: (alloc.monthly * alloc.high) / 100,
  };

  if (booting) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif" }} className="flex items-center justify-center h-full min-h-[400px] text-[#5B5541]">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading…
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", background: "#1F3D2E", minHeight: "500px" }} className="flex items-center justify-center p-6">
        <style>{`.serif{font-family:'Fraunces',serif} .mono{font-family:'IBM Plex Mono',monospace}`}</style>
        <form onSubmit={handleSignIn} className="w-full max-w-sm bg-[#F7F3E8] rounded-lg p-7 shadow-xl">
          <p className="serif text-2xl text-[#1F3D2E] mb-1">The Ledger</p>
          <p className="text-xs mono text-[#5B5541] mb-6">the hub for saving, growing, and allocating your money</p>
          <label className="block text-[10px] mono opacity-60 mb-1">YOUR NAME</label>
          <input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="e.g. Jordan"
            className="w-full border border-[#D8CFB8] rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:border-[#2F6B4F] bg-white" />
          <p className="text-[11px] mono opacity-50 mb-5 leading-relaxed">
            Demo sign-in only — this stores a name to keep your data separate, it isn't a secure account system. Don't enter real passwords or account numbers here or anywhere in this prototype.
          </p>
          <button type="submit" className="w-full py-2.5 rounded text-sm font-medium text-[#F7F3E8]" style={{ background: "#2F6B4F" }}>
            Enter your dashboard
          </button>
        </form>
      </div>
    );
  }

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "ledger", label: "Ledger", icon: NotebookPen },
    { id: "allocate", label: "Allocate", icon: SlidersHorizontal },
    { id: "learn", label: "Learn", icon: GraduationCap },
    { id: "rates", label: "Rates", icon: Landmark },
  ];

  return (
    <div style={{ "--paper": "#F7F3E8", "--ink": "#23324D", "--ledger-green": "#1F3D2E", "--ledger-green-soft": "#2F6B4F", "--gold": "#B8860B", "--rust": "#A63D40", "--line": "#D8CFB8", "--card": "#FFFDF7", fontFamily: "Inter, sans-serif", background: "var(--paper)", color: "var(--ink)", minHeight: "100%" }}>
      <style>{`
        .serif{font-family:'Fraunces',serif} .mono{font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums}
        .ledger-card{background:var(--card);border:1px solid var(--line);border-radius:4px}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.3)}
        input[type="range"]{accent-color:var(--ledger-green-soft)}
      `}</style>

      {/* Header */}
      <div style={{ background: "var(--ledger-green)" }} className="px-6 py-4 sm:px-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="serif text-[#E8E2CE] text-xl sm:text-2xl">The Ledger</p>
            <p className="text-[#B9C9BB] text-[11px] mono">signed in as {profile.username}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] mono text-[#B9C9BB]">{saving ? "saving…" : "autosaved"}</span>
            <button onClick={handleSignOut} className="flex items-center gap-1 text-xs text-[#E8E2CE] hover:text-white">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
        <div className="flex gap-1 mt-4 overflow-x-auto">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs whitespace-nowrap ${tab === n.id ? "bg-[var(--paper)] text-[var(--ink)]" : "text-[#B9C9BB] hover:text-white"}`}>
              <n.icon size={13} /> {n.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mx-6 sm:mx-10 mt-4 text-xs px-3 py-2 rounded" style={{ background: "#FBEAEA", color: "var(--rust)", border: "1px solid #E8C7C7" }}>{error}</div>}

      <div className="px-4 sm:px-10 py-6 max-w-6xl mx-auto">
        {tab === "dashboard" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => shiftMonth(-1)} className="p-2 rounded hover:bg-[#EAE4D2]"><ChevronLeft size={18} /></button>
              <div className="text-center"><p className="serif text-xl sm:text-2xl">{monthLabel(activeMonth)}</p><p className="text-[11px] mono opacity-50">page {monthIndex + 1} of {months.length}</p></div>
              <button onClick={() => shiftMonth(1)} className="p-2 rounded hover:bg-[#EAE4D2]"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <SummaryCard icon={<TrendingUp size={16} />} label="Income" value={fmt(totals.income)} color="var(--ledger-green-soft)" />
              <SummaryCard icon={<TrendingDown size={16} />} label="Expenses" value={fmt(totals.expense)} color="var(--rust)" />
              <SummaryCard icon={<PiggyBank size={16} />} label="Saved" value={fmt(totals.savings)} color="var(--gold)" />
              <SummaryCard icon={<Wallet size={16} />} label="Left over" value={fmt(net)} color={net >= 0 ? "var(--ledger-green-soft)" : "var(--rust)"} />
            </div>
            <div className="ledger-card p-4 sm:p-5 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <p className="serif text-sm tracking-wide opacity-80">Savings goal — all-time</p>
                <div className="flex items-center gap-2 text-xs mono">
                  <span className="opacity-60">target</span><span>$</span>
                  <input value={goalDraft} onChange={(e) => setGoalDraft(e.target.value.replace(/[^0-9.]/g, ""))} onBlur={handleGoalSave} onKeyDown={(e) => e.key === "Enter" && handleGoalSave()}
                    className="w-20 bg-transparent border-b border-[var(--line)] focus:outline-none focus:border-[var(--gold)] px-1" />
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-[#EDE7D6] overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${goalPct}%`, background: "var(--gold)" }} /></div>
              <div className="flex justify-between mt-1.5 text-xs mono opacity-70"><span>{fmt(totalSaved)} saved</span><span>{goalPct.toFixed(0)}% of {fmt(goal)}</span></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="ledger-card p-4 sm:p-5">
                <p className="serif text-sm tracking-wide opacity-80 mb-3">Spending by category — this month</p>
                {expenseByCategory.length === 0 ? <p className="text-xs opacity-50 mono py-10 text-center">No expenses logged yet.</p> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                        {expenseByCategory.map((e, i) => <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "IBM Plex Mono", fontSize: 12, borderRadius: 4 }} />
                      <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="ledger-card p-4 sm:p-5">
                <p className="serif text-sm tracking-wide opacity-80 mb-3">Trend — last {trend.length} months</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "IBM Plex Mono", fontSize: 12, borderRadius: 4 }} />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter" }} />
                    <Bar dataKey="Income" fill="var(--ledger-green-soft)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Expense" fill="var(--rust)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Saved" fill="var(--gold)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {tab === "ledger" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => shiftMonth(-1)} className="p-2 rounded hover:bg-[#EAE4D2]"><ChevronLeft size={18} /></button>
              <p className="serif text-xl">{monthLabel(activeMonth)}</p>
              <button onClick={() => shiftMonth(1)} className="p-2 rounded hover:bg-[#EAE4D2]"><ChevronRight size={18} /></button>
            </div>
            <div className="ledger-card p-4 sm:p-5 mb-6">
              <p className="serif text-sm tracking-wide opacity-80 mb-3">Add an entry</p>
              <form onSubmit={handleAdd} className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
                <div><label className="block text-[10px] mono opacity-60 mb-1">DATE</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]" /></div>
                <div><label className="block text-[10px] mono opacity-60 mb-1">TYPE</label>
                  <select value={form.type} onChange={(e) => { const type = e.target.value; setForm((f) => ({ ...f, type, category: TYPE_META[type].cats[0] })); }} className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]">
                    {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select></div>
                <div><label className="block text-[10px] mono opacity-60 mb-1">CATEGORY</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]">
                    {TYPE_META[form.type].cats.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select></div>
                <div><label className="block text-[10px] mono opacity-60 mb-1">AMOUNT ($)</label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]" /></div>
                <div><label className="block text-[10px] mono opacity-60 mb-1">NOTE</label>
                  <input type="text" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="optional" className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]" /></div>
                <button type="submit" className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded text-[#F7F3E8]" style={{ background: "var(--ledger-green)" }}><Plus size={15} /> Add</button>
              </form>
              {formError && <p className="text-xs mt-2" style={{ color: "var(--rust)" }}>{formError}</p>}
            </div>
            <div className="ledger-card overflow-hidden">
              <p className="serif text-sm tracking-wide opacity-80 px-4 sm:px-5 pt-4">Entries — {monthLabel(activeMonth)}</p>
              {monthTx.length === 0 ? <p className="text-xs opacity-50 mono px-5 py-8 text-center">Nothing logged yet.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm mt-2">
                    <thead><tr className="text-[10px] mono opacity-50 border-t border-b" style={{ borderColor: "var(--line)" }}>
                      <th className="text-left px-5 py-2 font-normal">DATE</th><th className="text-left px-3 py-2 font-normal">TYPE</th><th className="text-left px-3 py-2 font-normal">CATEGORY</th><th className="text-left px-3 py-2 font-normal">NOTE</th><th className="text-right px-3 py-2 font-normal">AMOUNT</th><th className="px-3 py-2"></th>
                    </tr></thead>
                    <tbody>
                      {monthTx.map((t) => (
                        <tr key={t.id} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                          <td className="px-5 py-2 mono text-xs opacity-70">{t.date}</td>
                          <td className="px-3 py-2"><span className="text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: `${TYPE_META[t.type].color}1A`, color: TYPE_META[t.type].color }}>{TYPE_META[t.type].label}</span></td>
                          <td className="px-3 py-2 text-xs">{t.category}</td>
                          <td className="px-3 py-2 text-xs opacity-60">{t.note || "—"}</td>
                          <td className="px-3 py-2 mono text-right" style={{ color: TYPE_META[t.type].color }}>{fmt(t.amount)}</td>
                          <td className="px-3 py-2 text-right"><button onClick={() => handleDelete(t.id)} className="opacity-40 hover:opacity-100"><Trash2 size={14} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "allocate" && (
          <div className="space-y-6">
            <div className="ledger-card p-4 sm:p-5">
              <p className="serif text-sm tracking-wide opacity-80 mb-1">Monthly savings to allocate</p>
              <p className="text-xs mono opacity-50 mb-3">How much do you set aside each month, and how should it split across risk tiers?</p>
              <div className="flex items-center gap-2 mb-5">
                <span className="mono text-sm">$</span>
                <input type="number" min="0" value={alloc.monthly} onChange={(e) => updateAlloc("monthly", Math.max(0, parseFloat(e.target.value) || 0))} className="w-32 border border-[var(--line)] rounded px-2 py-1.5 text-sm mono bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]" />
                <span className="text-xs opacity-50">/ month</span>
              </div>
              {[
                { key: "low", label: "Low risk", desc: "Savings accounts, CDs, money market", color: "var(--ledger-green-soft)" },
                { key: "medium", label: "Medium risk", desc: "Index funds (e.g. S&P 500), diversified ETFs", color: "var(--gold)" },
                { key: "high", label: "High risk", desc: "Individual stocks, crypto", color: "var(--rust)" },
              ].map((row) => (
                <div key={row.key} className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <div><span className="text-sm font-medium">{row.label}</span><span className="text-xs opacity-50 mono ml-2">{row.desc}</span></div>
                    <span className="mono text-sm" style={{ color: row.color }}>{alloc[row.key]}% · {fmt(allocDollars[row.key])}</span>
                  </div>
                  <input type="range" min="0" max="100" value={alloc[row.key]} onChange={(e) => updateAlloc(row.key, parseInt(e.target.value))} className="w-full" />
                </div>
              ))}
              <div className={`text-xs mono mt-2 ${allocSum === 100 ? "opacity-50" : ""}`} style={{ color: allocSum === 100 ? undefined : "var(--rust)" }}>
                {allocSum === 100 ? `Totals 100% — ${fmt(alloc.monthly)}/month allocated.` : `Totals ${allocSum}% — adjust sliders so they add to 100%.`}
              </div>
            </div>
            <div className="ledger-card p-4 sm:p-5" style={{ borderColor: "#E8C7C7" }}>
              <div className="flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
                <p className="text-xs leading-relaxed opacity-80">
                  This planner just does the arithmetic on percentages you choose — it isn't investment advice, and I'm not a licensed financial advisor.
                  How you split money across risk tiers depends on your age, timeline, debt, and risk tolerance. Consider talking to a fee-only fiduciary advisor
                  for guidance specific to your situation.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "learn" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TierCard title="Low risk" color="var(--ledger-green-soft)" points={[
                "High-yield savings accounts, money market accounts, and CDs.",
                "FDIC/NCUA insured up to $250,000 per depositor, per bank.",
                "Best for emergency funds and money you'll need within 1–3 years.",
                "Returns are modest and roughly track the Fed's benchmark rate.",
              ]} />
              <TierCard title="Medium risk" color="var(--gold)" points={[
                "Broad index funds (e.g. S&P 500) and diversified ETFs.",
                "Not insured — value moves with the market, up and down.",
                "Historically grows faster than savings accounts over 5–10+ year horizons.",
                "Lower fees and less single-company risk than picking individual stocks.",
              ]} />
              <TierCard title="High risk" color="var(--rust)" points={[
                "Individual stocks and cryptocurrency.",
                "Can swing sharply in value, including to zero for individual assets.",
                "Only invest money you could afford to lose entirely.",
                "Position size and diversification matter more as risk goes up.",
              ]} />
            </div>
            <div className="ledger-card p-4 sm:p-5">
              <p className="serif text-sm tracking-wide opacity-80 mb-3 flex items-center gap-2"><ShieldAlert size={15} style={{ color: "var(--rust)" }} /> Buying crypto without getting scammed</p>
              <ul className="text-xs space-y-2 opacity-80 leading-relaxed list-disc pl-4">
                <li>Use a well-known, regulated exchange rather than a link from a text, DM, or social media ad.</li>
                <li>Turn on two-factor authentication, and never share your seed phrase or private key with anyone — no legitimate support agent will ever ask for it.</li>
                <li>Be skeptical of anyone (including a "romantic" contact) urging you to move money into crypto quickly, or promising guaranteed returns — that's a hallmark of scams.</li>
                <li>Double-check wallet addresses before sending; crypto transfers can't be reversed.</li>
                <li>Start small while you learn how transfers, gas fees, and custody work.</li>
              </ul>
            </div>
            <p className="text-[11px] mono opacity-40 text-center">General education, not personalized financial advice.</p>
          </div>
        )}

        {tab === "rates" && (
          <div className="ledger-card overflow-hidden">
            <div className="px-4 sm:px-5 pt-4 pb-2">
              <p className="serif text-sm tracking-wide opacity-80">High-yield savings rates — August 2026</p>
              <p className="text-[11px] mono opacity-50 mt-1">Rates change often and usually require meeting specific conditions — verify directly with the bank before opening an account.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mt-1">
                <thead><tr className="text-[10px] mono opacity-50 border-t border-b" style={{ borderColor: "var(--line)" }}>
                  <th className="text-left px-5 py-2 font-normal">BANK</th><th className="text-left px-3 py-2 font-normal">APY</th><th className="text-left px-3 py-2 font-normal">MINIMUM</th><th className="text-left px-3 py-2 font-normal">NOTES</th>
                </tr></thead>
                <tbody>
                  {RATE_DATA.map((r) => (
                    <tr key={r.bank} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                      <td className="px-5 py-2.5 text-sm">{r.bank}</td>
                      <td className="px-3 py-2.5 mono" style={{ color: "var(--ledger-green-soft)" }}>{r.apy}</td>
                      <td className="px-3 py-2.5 text-xs mono opacity-70">{r.min}</td>
                      <td className="px-3 py-2.5 text-xs opacity-60">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 text-[11px] mono opacity-40 flex items-center gap-1">
              <ExternalLink size={11} /> Compiled from NerdWallet, Kiplinger, Yahoo Finance, WalletHub, and YieldFinder, Aug 2026.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }) {
  return (
    <div className="ledger-card p-4">
      <div className="flex items-center gap-1.5 mb-2 text-[11px] mono opacity-60" style={{ color }}>{icon} {label.toUpperCase()}</div>
      <p className="serif text-xl sm:text-2xl">{value}</p>
    </div>
  );
}

function TierCard({ title, color, points }) {
  return (
    <div className="ledger-card p-4 sm:p-5">
      <p className="serif text-sm mb-3" style={{ color }}>{title}</p>
      <ul className="text-xs space-y-1.5 opacity-80 leading-relaxed list-disc pl-4">
        {points.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
    </div>
  );
}
