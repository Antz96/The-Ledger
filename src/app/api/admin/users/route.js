import { requireAdmin, adminEmails } from "@/lib/adminAuth";

async function listAllAuthUsers(service) {
  const all = [];
  let page = 1;
  const perPage = 1000;
  for (;;) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    all.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }
  return all;
}

export async function GET(request) {
  const { service, errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const [authUsers, profilesResult] = await Promise.all([
      listAllAuthUsers(service),
      service.from("profiles").select("id, display_name, created_at, transactions(count)"),
    ]);
    if (profilesResult.error) throw profilesResult.error;

    const profileById = new Map((profilesResult.data || []).map((p) => [p.id, p]));
    const admins = adminEmails();

    const users = authUsers
      .map((u) => {
        const p = profileById.get(u.id);
        return {
          id: u.id,
          email: u.email || "",
          displayName: p?.display_name || u.user_metadata?.display_name || (u.email || "").split("@")[0],
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at || null,
          emailConfirmed: Boolean(u.email_confirmed_at),
          txCount: p?.transactions?.[0]?.count ?? 0,
          isAdmin: admins.includes((u.email || "").toLowerCase()),
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const now = Date.now();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const stats = {
      totalUsers: users.length,
      confirmedUsers: users.filter((u) => u.emailConfirmed).length,
      newThisMonth: users.filter((u) => new Date(u.createdAt) >= monthStart).length,
      activeLast7d: users.filter((u) => u.lastSignInAt && now - new Date(u.lastSignInAt) < 7 * 864e5).length,
      totalTransactions: users.reduce((s, u) => s + u.txCount, 0),
    };

    return Response.json({ stats, users });
  } catch (err) {
    return Response.json({ error: err.message || "Couldn't load users." }, { status: 500 });
  }
}
