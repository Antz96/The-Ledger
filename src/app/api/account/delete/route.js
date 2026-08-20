import { requireUser, getAdminClient } from "@/lib/supabaseServer";

// Deletes the requesting user's auth.users row via the admin client. Every
// table in the schema references profiles(id) on delete cascade, and
// profiles.id itself references auth.users(id) on delete cascade — so this
// one call cleanly removes everything: transactions, assets, liabilities,
// goals, the financial constitution, credit profile, bank connections,
// Assistant audit log, net worth history, all of it. No per-table cleanup
// needed.
export async function POST(request) {
  const { user, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = getAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message || "Couldn't delete your account." }, { status: 500 });
  }
}
