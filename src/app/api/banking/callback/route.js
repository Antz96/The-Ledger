import { getAdminClient } from "@/lib/supabaseServer";
import { createSession } from "@/lib/enableBanking";

// Enable Banking (via the user's own bank) redirects the browser here after
// consent. This request carries no Supabase session — the state_token set
// when the connection was started is the only thing correlating it back to
// a user, so this route runs on the service role rather than a user client.
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const authError = url.searchParams.get("error");
  const authErrorDescription = url.searchParams.get("error_description");

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const redirectTo = (params) => Response.redirect(`${appUrl}/connections?${params}`, 302);

  if (!state) return redirectTo("error=missing_state");

  const admin = getAdminClient();
  const { data: connection } = await admin
    .from("bank_connections")
    .select("*")
    .eq("state_token", state)
    .maybeSingle();

  if (!connection) return redirectTo("error=unknown_connection");

  if (authError) {
    await admin
      .from("bank_connections")
      .update({ status: "error", error_message: authErrorDescription || authError })
      .eq("id", connection.id);
    return redirectTo(`error=${encodeURIComponent(authErrorDescription || authError)}`);
  }

  if (!code) return redirectTo("error=missing_code");

  try {
    const session = await createSession(code);
    await admin
      .from("bank_connections")
      .update({
        status: "active",
        session_id: session.session_id,
        valid_until: session.access?.valid_until || null,
      })
      .eq("id", connection.id);

    const accounts = (session.accounts || []).map((a) => ({
      connection_id: connection.id,
      user_id: connection.user_id,
      account_uid: a.uid,
      name: a.name || a.product || null,
      iban: a.account_id?.iban || null,
      currency: a.currency || null,
    }));
    if (accounts.length > 0) {
      await admin.from("bank_accounts").insert(accounts);
    }

    return redirectTo("connected=1");
  } catch (err) {
    await admin
      .from("bank_connections")
      .update({ status: "error", error_message: err.message || "Couldn't finish connecting." })
      .eq("id", connection.id);
    return redirectTo(`error=${encodeURIComponent(err.message || "connection_failed")}`);
  }
}
