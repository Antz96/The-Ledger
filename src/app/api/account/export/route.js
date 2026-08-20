import { requireUser } from "@/lib/supabaseServer";

// Every user-owned table in the schema, for the GDPR data-portability
// right promised in the Privacy Policy. Uses the requesting user's own
// RLS-scoped client (not the admin client) — select("*") with no explicit
// .eq(user_id, ...) filter is safe and correct because row-level security
// already restricts every one of these tables to auth.uid() = user_id (or
// = id, for profiles), the same boundary the rest of the app relies on.
// Deliberately excludes opportunities/savings_rates/articles — shared
// reference data, not anything personal to this user.
const USER_TABLES = [
  "profiles", "transactions", "goals", "allocations", "assets", "liabilities",
  "financial_goals", "credit_action_progress", "credit_profile", "credit_goal_selections",
  "assessment_responses", "bank_connections", "bank_accounts", "net_worth_snapshots",
  "financial_constitution", "ai_interactions",
];

export async function GET(request) {
  const { user, client, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  const exportData = { exported_at: new Date().toISOString(), user_id: user.id, email: user.email };

  for (const table of USER_TABLES) {
    const { data: rows, error } = await client.from(table).select("*");
    if (error) {
      return Response.json({ error: `Couldn't export ${table}: ${error.message}` }, { status: 500 });
    }
    exportData[table] = rows;
  }

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ledger-export-${user.id}.json"`,
    },
  });
}
