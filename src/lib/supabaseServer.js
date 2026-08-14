// Server-only. Never import from a client component — it can read
// SUPABASE_SERVICE_ROLE_KEY, which must not be bundled for the browser.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// A client scoped to the requesting user's own access token — every query
// runs under that user's RLS policies, same as the browser client does.
export function getUserClient(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return { client: null, token: null };
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  return { client, token };
}

export async function requireUser(request) {
  const { client } = getUserClient(request);
  if (!client) return { errorResponse: Response.json({ error: "Missing access token." }, { status: 401 }) };
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) {
    return { errorResponse: Response.json({ error: "Invalid or expired session." }, { status: 401 }) };
  }
  return { user: data.user, client };
}

// Bypasses RLS. Used only where a request genuinely can't carry the user's
// own session — e.g. the bank's redirect back to our OAuth-style callback.
let adminClient;
export function getAdminClient() {
  if (!adminClient) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
    adminClient = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  }
  return adminClient;
}
