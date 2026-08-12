// Server-only. Never import from a client component — it reads
// SUPABASE_SERVICE_ROLE_KEY, which must not be bundled for the browser.
import { createClient } from "@supabase/supabase-js";

let service;
export function getServiceClient() {
  if (!service) {
    service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return service;
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin(request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || adminEmails().length === 0) {
    return {
      errorResponse: Response.json(
        { error: "Admin API not configured. Set SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAILS." },
        { status: 500 }
      ),
    };
  }
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return { errorResponse: Response.json({ error: "Missing access token." }, { status: 401 }) };
  }
  const client = getServiceClient();
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    return { errorResponse: Response.json({ error: "Invalid or expired session." }, { status: 401 }) };
  }
  if (!adminEmails().includes((data.user.email || "").toLowerCase())) {
    return { errorResponse: Response.json({ error: "Not authorized." }, { status: 403 }) };
  }
  return { admin: data.user, service: client };
}
