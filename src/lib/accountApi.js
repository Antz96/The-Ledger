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
