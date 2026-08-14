"use client";

import { supabase } from "@/lib/supabaseClient";

async function bankingFetch(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token || ""}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

export function fetchInstitutions(country = "GB") {
  return bankingFetch(`/api/banking/institutions?country=${encodeURIComponent(country)}`);
}

export function startConnection(aspsp) {
  return bankingFetch("/api/banking/connect", {
    method: "POST",
    body: JSON.stringify({ aspsp_name: aspsp.name, aspsp_country: aspsp.country }),
  });
}

export function fetchConnections() {
  return bankingFetch("/api/banking/accounts");
}

export function fetchTransactions(accountId) {
  return bankingFetch(`/api/banking/transactions?account_id=${encodeURIComponent(accountId)}`);
}

export function revokeConnection(connectionId) {
  return bankingFetch(`/api/banking/connections/${connectionId}`, { method: "DELETE" });
}
