"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Landmark, ChevronDown, Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { fmt } from "@/lib/ledgerConstants";
import { fetchInstitutions, startConnection, fetchConnections, fetchTransactions, revokeConnection } from "@/lib/bankingApi";

function StatusBanner({ searchParams }) {
  const connected = searchParams.get("connected");
  const error = searchParams.get("error");
  if (!connected && !error) return null;
  return (
    <div
      role="alert"
      className="text-xs px-3 py-2 rounded-lg mb-4"
      style={
        connected
          ? { background: "rgba(15,185,129,0.1)", color: "var(--emerald)", border: "1px solid rgba(15,185,129,0.25)" }
          : { background: "rgba(242,99,122,0.1)", color: "var(--rust)", border: "1px solid rgba(242,99,122,0.25)" }
      }
    >
      {connected ? "Bank connected." : `Couldn't connect: ${error}`}
    </div>
  );
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState(null);
  const [loadError, setLoadError] = useState("");

  async function reload() {
    setLoadError("");
    try {
      const { connections: rows } = await fetchConnections();
      setConnections(rows);
    } catch (err) {
      setLoadError(err.message || "Couldn't load your connections.");
      setConnections([]);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <StatusBannerWrapper />
      </Suspense>

      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide text-[var(--muted)] mb-1 flex items-center gap-1.5">
          <Landmark size={15} /> Bank connections
        </p>
        <p className="text-xs text-[var(--faint)]">
          Experimental. Connects to your bank via Enable Banking, a regulated open banking provider — we never see
          your bank login. You choose which accounts to share and can revoke access at any time, here or at your
          bank. Nothing here is imported into your Ledger entries automatically.
        </p>
      </div>

      <ConnectBankForm onConnected={reload} />

      <div className="ledger-card overflow-hidden">
        <p className="serif text-sm tracking-wide text-[var(--muted)] px-4 sm:px-5 pt-4 pb-2">Connected banks</p>
        {loadError && (
          <p className="text-xs px-5 pb-3" style={{ color: "var(--rust)" }}>{loadError}</p>
        )}
        {connections === null ? (
          <p className="text-xs text-[var(--faint)] mono px-5 py-8 text-center flex items-center justify-center gap-2">
            <Loader2 size={13} className="animate-spin" /> Loading…
          </p>
        ) : connections.length === 0 ? (
          <p className="text-xs text-[var(--faint)] mono px-5 py-8 text-center">No banks connected yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
            {connections.map((c) => (
              <ConnectionRow key={c.id} connection={c} onRevoked={reload} />
            ))}
          </ul>
        )}
      </div>

      <div className="ledger-card p-4 sm:p-5" style={{ borderColor: "rgba(242,99,122,0.25)" }}>
        <div className="flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            This is a prototype feature, not a finished product. Transaction data is fetched live from your bank each
            time you view it and isn&apos;t stored — but treat this as something to try, not something to rely on yet.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBannerWrapper() {
  const searchParams = useSearchParams();
  return <StatusBanner searchParams={searchParams} />;
}

function ConnectBankForm({ onConnected }) {
  const [institutions, setInstitutions] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");

  useEffect(() => {
    fetchInstitutions("GB")
      .then((data) => setInstitutions(data.institutions || []))
      .catch((err) => setLoadError(err.message || "Couldn't load the list of banks."));
  }, []);

  async function handleConnect(e) {
    e.preventDefault();
    setConnectError("");
    const aspsp = institutions?.find((i) => `${i.name}|${i.country}` === selected);
    if (!aspsp) return setConnectError("Pick a bank first.");
    setConnecting(true);
    try {
      const { redirect_url } = await startConnection(aspsp);
      window.location.href = redirect_url;
    } catch (err) {
      setConnectError(err.message || "Couldn't start the connection.");
      setConnecting(false);
    }
  }

  return (
    <div className="ledger-card p-4 sm:p-5">
      <p className="serif text-sm tracking-wide text-[var(--muted)] mb-3">Connect a bank</p>
      {loadError ? (
        <p className="text-xs" style={{ color: "var(--rust)" }}>{loadError}</p>
      ) : (
        <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label htmlFor="bank-select" className="block text-[10px] mono text-[var(--muted)] mb-1">BANK</label>
            <div className="relative">
              <select
                id="bank-select"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                disabled={!institutions}
                className="w-full appearance-none text-sm border border-[var(--line)] rounded-lg px-2 py-1.5 pr-8 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
              >
                <option value="">{institutions ? "Choose a bank…" : "Loading banks…"}</option>
                {institutions?.map((i) => (
                  <option key={`${i.name}|${i.country}`} value={`${i.name}|${i.country}`} style={{ color: "var(--obsidian-2)" }}>
                    {i.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--faint)]" />
            </div>
          </div>
          <button
            type="submit"
            disabled={connecting || !institutions}
            className="flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg text-[var(--obsidian)] disabled:opacity-60"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 14px rgba(34,211,238,0.25)" }}
          >
            {connecting && <Loader2 size={14} className="animate-spin" />}
            Connect
          </button>
        </form>
      )}
      {connectError && <p className="text-xs mt-2" style={{ color: "var(--rust)" }}>{connectError}</p>}
    </div>
  );
}

function ConnectionRow({ connection, onRevoked }) {
  const [revoking, setRevoking] = useState(false);
  const accounts = connection.bank_accounts || [];

  async function handleRevoke() {
    setRevoking(true);
    try {
      await revokeConnection(connection.id);
      onRevoked();
    } catch {
      setRevoking(false);
    }
  }

  return (
    <li className="px-4 sm:px-5 py-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm text-[var(--text)]">{connection.aspsp_name}</p>
          <p className="text-[11px] mono text-[var(--faint)]">
            {connection.status === "active" && "connected"}
            {connection.status === "pending" && "pending"}
            {connection.status === "error" && (connection.error_message || "connection failed")}
            {connection.status === "revoked" && "revoked"}
          </p>
        </div>
        <button
          onClick={handleRevoke}
          disabled={revoking}
          aria-label={`Revoke connection to ${connection.aspsp_name}`}
          className="text-[var(--faint)] hover:text-[var(--rust)] disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {connection.status === "active" && accounts.length > 0 && (
        <ul className="mt-2 space-y-2">
          {accounts.map((a) => (
            <AccountRow key={a.id} account={a} />
          ))}
        </ul>
      )}
    </li>
  );
}

function AccountRow({ account }) {
  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState("");

  async function toggle() {
    if (open) return setOpen(false);
    setOpen(true);
    if (transactions === null) {
      try {
        const data = await fetchTransactions(account.id);
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message || "Couldn't load transactions.");
      }
    }
  }

  return (
    <li className="text-xs border rounded-lg p-2.5" style={{ borderColor: "var(--line)" }}>
      <button onClick={toggle} className="w-full flex items-center justify-between text-left">
        <span className="text-[var(--text)]">{account.name || account.iban || "Account"}</span>
        <ChevronDown size={12} className="text-[var(--faint)]" style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div className="mt-2">
          {error && <p style={{ color: "var(--rust)" }}>{error}</p>}
          {!error && transactions === null && <p className="text-[var(--faint)] mono">Loading…</p>}
          {transactions && transactions.length === 0 && <p className="text-[var(--faint)] mono">No transactions in the last 90 days.</p>}
          {transactions && transactions.length > 0 && (
            <ul className="space-y-1 mt-1">
              {transactions.slice(0, 20).map((t, i) => (
                <li key={t.transaction_id || i} className="flex justify-between text-[var(--muted)]">
                  <span className="truncate pr-2">{t.creditor?.name || t.debtor?.name || t.remittance_information?.[0] || "Transaction"}</span>
                  <span className="mono flex-shrink-0" style={{ color: Number(t.transaction_amount?.amount) < 0 ? "var(--rust)" : "var(--emerald)" }}>
                    {fmt(Math.abs(Number(t.transaction_amount?.amount) || 0))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
