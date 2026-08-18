"use client";

import { supabase } from "@/lib/supabaseClient";

export async function extractPdf(kind, file) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const formData = new FormData();
  formData.append("kind", kind);
  formData.append("file", file);

  const res = await fetch("/api/extract", {
    method: "POST",
    headers: { Authorization: `Bearer ${token || ""}` },
    body: formData,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body.result;
}
