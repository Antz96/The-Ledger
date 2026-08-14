import { requireUser } from "@/lib/supabaseServer";
import { deleteSession } from "@/lib/enableBanking";

export async function DELETE(request, { params }) {
  const { client, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;
  const { id } = await params;

  const { data: connection, error: findError } = await client
    .from("bank_connections")
    .select("session_id")
    .eq("id", id)
    .maybeSingle();
  if (findError) return Response.json({ error: findError.message }, { status: 500 });
  if (!connection) return Response.json({ error: "Connection not found." }, { status: 404 });

  if (connection.session_id) {
    try {
      await deleteSession(connection.session_id);
    } catch (err) {
      // The session may already be expired/revoked bank-side — that's fine,
      // we still want to remove our own record of it.
      if (err.status && err.status !== 404) {
        return Response.json({ error: err.message || "Couldn't revoke access at the bank." }, { status: err.status });
      }
    }
  }

  const { error: deleteError } = await client.from("bank_connections").delete().eq("id", id);
  if (deleteError) return Response.json({ error: deleteError.message }, { status: 500 });

  return Response.json({ ok: true });
}
