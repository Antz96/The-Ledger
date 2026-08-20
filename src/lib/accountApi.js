"use client";

import { supabase } from "@/lib/supabaseClient";

export async function deleteAccount() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch("/api/account/delete", {
    method: "POST",
    headers: { Authorization: `Bearer ${token || ""}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
}

// Downloads every row of the user's own data as a JSON file. GET requests
// can't carry an Authorization header from a plain <a href>, so this fetches
// the file client-side and triggers the download itself via a throwaway
// object URL, rather than linking directly to the API route.
export async function exportAccountData() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch("/api/account/export", {
    headers: { Authorization: `Bearer ${token || ""}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ledger-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
