import { requireUser } from "@/lib/supabaseServer";
import { getAccountTransactions } from "@/lib/enableBanking";

export async function GET(request) {
  const { client, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  const accountId = new URL(request.url).searchParams.get("account_id");
  if (!accountId) return Response.json({ error: "Missing account_id." }, { status: 400 });

  // Ownership is enforced by RLS: this select only returns a row if the
  // requesting user's own bank_accounts row matches account_id.
  const { data: account, error: accountError } = await client
    .from("bank_accounts")
    .select("account_uid, bank_connections(status)")
    .eq("id", accountId)
    .maybeSingle();
  if (accountError) return Response.json({ error: accountError.message }, { status: 500 });
  if (!account) return Response.json({ error: "Account not found." }, { status: 404 });
  if (account.bank_connections?.status !== "active") {
    return Response.json({ error: "This connection isn't active." }, { status: 409 });
  }

  const dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  try {
    const data = await getAccountTransactions(account.account_uid, { dateFrom });
    return Response.json({ transactions: data.transactions || [] });
  } catch (err) {
    return Response.json({ error: err.message || "Couldn't load transactions." }, { status: err.status || 500 });
  }
}
