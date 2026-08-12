import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;
  return Response.json({ isAdmin: true });
}
