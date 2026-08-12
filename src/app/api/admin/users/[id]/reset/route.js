import { requireAdmin } from "@/lib/adminAuth";

export async function POST(request, { params }) {
  const { service, errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;
  const { id } = await params;

  const { data, error } = await service.auth.admin.getUserById(id);
  if (error || !data?.user?.email) return Response.json({ error: "User not found." }, { status: 404 });

  const redirectTo = request.headers.get("origin") || new URL(request.url).origin;
  const { error: resetError } = await service.auth.resetPasswordForEmail(data.user.email, { redirectTo });
  if (resetError) return Response.json({ error: resetError.message }, { status: 500 });
  return Response.json({ ok: true, email: data.user.email });
}
