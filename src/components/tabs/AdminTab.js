"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, Activity, UserPlus, NotebookPen, KeyRound, Trash2, Check, Minus } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import SummaryCard from "@/components/ui/SummaryCard";

// Shows counts only, never money amounts — fmt() renders in the *admin's*
// currency, so don't use it for other users' figures if amounts get added.
export default function AdminTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [confirmingId, setConfirmingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    adminFetch("/api/admin/users")
      .then((data) => {
        if (cancelled) return;
        setStats(data.stats);
        setUsers(data.users);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  async function handleReset(u) {
    setBusyId(u.id);
    setError(null);
    setNotice(null);
    try {
      const res = await adminFetch(`/api/admin/users/${u.id}/reset`, { method: "POST" });
      setNotice(`Reset email sent to ${res.email}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(u) {
    setBusyId(u.id);
    setError(null);
    setNotice(null);
    try {
      await adminFetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((row) => row.id !== u.id));
      setStats((s) => s && {
        ...s,
        totalUsers: s.totalUsers - 1,
        confirmedUsers: s.confirmedUsers - (u.emailConfirmed ? 1 : 0),
        totalTransactions: s.totalTransactions - u.txCount,
      });
      setNotice(`Deleted ${u.email} and all their data.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
      setConfirmingId(null);
    }
  }

  function fmtDate(iso) {
    if (!iso) return "never";
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] text-[#5B5541]">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading accounts…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-xs px-3 py-2 rounded" style={{ background: "#FBEAEA", color: "var(--rust)", border: "1px solid #E8C7C7" }}>
          {error}
        </div>
      )}
      {notice && (
        <div className="text-xs px-3 py-2 rounded" style={{ background: "#EAF2EC", color: "var(--ledger-green)", border: "1px solid #C7DCCB" }}>
          {notice}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard icon={<Users size={16} />} label="Total users" value={stats.totalUsers} color="var(--ledger-green-soft)" />
          <SummaryCard icon={<Activity size={16} />} label="Active last 7d" value={stats.activeLast7d} color="var(--ledger-green-soft)" />
          <SummaryCard icon={<UserPlus size={16} />} label="New this month" value={stats.newThisMonth} color="var(--gold)" />
          <SummaryCard icon={<NotebookPen size={16} />} label="Total entries" value={stats.totalTransactions} color="var(--gold)" />
        </div>
      )}

      <div className="ledger-card overflow-hidden">
        <div className="px-4 sm:px-5 pt-4 pb-2">
          <p className="serif text-sm tracking-wide opacity-80">Live accounts</p>
          <p className="text-[11px] mono opacity-50 mt-1">
            {stats ? `${stats.confirmedUsers} of ${stats.totalUsers} confirmed` : ""} — deleting an account permanently removes the user and all their entries.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-1">
            <thead>
              <tr className="text-[10px] mono opacity-50 border-t border-b" style={{ borderColor: "var(--line)" }}>
                <th className="text-left px-5 py-2 font-normal">NAME</th>
                <th className="text-left px-3 py-2 font-normal">EMAIL</th>
                <th className="text-left px-3 py-2 font-normal">JOINED</th>
                <th className="text-left px-3 py-2 font-normal">LAST SIGN-IN</th>
                <th className="text-left px-3 py-2 font-normal">CONFIRMED</th>
                <th className="text-right px-3 py-2 font-normal">ENTRIES</th>
                <th className="text-right px-5 py-2 font-normal">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                  <td className="px-5 py-2.5">
                    {u.displayName}
                    {u.isAdmin && (
                      <span className="ml-2 text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: "#F3ECD8", color: "var(--gold)" }}>
                        admin
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs mono opacity-70">{u.email}</td>
                  <td className="px-3 py-2.5 text-xs mono opacity-70">{fmtDate(u.createdAt)}</td>
                  <td className="px-3 py-2.5 text-xs mono opacity-70">{fmtDate(u.lastSignInAt)}</td>
                  <td className="px-3 py-2.5">
                    {u.emailConfirmed
                      ? <Check size={14} style={{ color: "var(--ledger-green-soft)" }} />
                      : <Minus size={14} className="opacity-40" />}
                  </td>
                  <td className="px-3 py-2.5 mono text-right">{u.txCount}</td>
                  <td className="px-5 py-2.5 text-right whitespace-nowrap">
                    {confirmingId === u.id ? (
                      <span className="text-[11px] mono" style={{ color: "var(--rust)" }}>
                        Delete permanently?
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={busyId === u.id}
                          className="ml-2 underline disabled:opacity-50"
                        >
                          {busyId === u.id ? "Deleting…" : "Confirm"}
                        </button>
                        <button onClick={() => setConfirmingId(null)} className="ml-2 underline opacity-60">
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleReset(u)}
                          disabled={busyId === u.id}
                          title="Send password reset email"
                          className="p-1.5 rounded hover:bg-[#EAE4D2] disabled:opacity-50 align-middle"
                        >
                          {busyId === u.id ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                        </button>
                        {!u.isAdmin && (
                          <button
                            onClick={() => setConfirmingId(u.id)}
                            title="Delete account"
                            className="p-1.5 rounded hover:bg-[#F3E0E0] align-middle ml-1"
                            style={{ color: "var(--rust)" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
