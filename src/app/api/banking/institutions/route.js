import { requireUser } from "@/lib/supabaseServer";
import { listASPSPs } from "@/lib/enableBanking";

export async function GET(request) {
  const { errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  const country = new URL(request.url).searchParams.get("country") || "GB";
  try {
    const data = await listASPSPs({ country });
    return Response.json({ institutions: data.aspsps || [] });
  } catch (err) {
    return Response.json({ error: err.message || "Couldn't load banks." }, { status: err.status || 500 });
  }
}
