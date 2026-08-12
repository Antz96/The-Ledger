import { requireAdmin, adminEmails } from "@/lib/adminAuth";

export async function DELETE(request, { params }) {
  const { service, errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;
  const { id } = await params;

  const { data, error } = await service.auth.admin.getUserById(id);
  if (error || !data?.user) return Response.json({ error: "User not found." }, { status: 404 });
  if (adminEmails().includes((data.user.email || "").toLowerCase())) {
    return Response.json(
      { error: "Admin accounts can't be deleted from the app. Use the Supabase dashboard." },
      { status: 400 }
    );
  }

  const { error: delError } = await service.auth.admin.deleteUser(id);
  if (delError) return Response.json({ error: delError.message }, { status: 500 });
  return Response.json({ ok: true });
}
