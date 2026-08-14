import { requireUser } from "@/lib/supabaseServer";

export async function GET(request) {
  const { client, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  const { data: connections, error: connError } = await client
    .from("bank_connections")
    .select("*, bank_accounts(*)")
    .order("created_at", { ascending: false });
  if (connError) return Response.json({ error: connError.message }, { status: 500 });

  return Response.json({ connections: connections || [] });
}
