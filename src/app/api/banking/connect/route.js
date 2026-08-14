import { requireUser } from "@/lib/supabaseServer";
import { startAuth } from "@/lib/enableBanking";

export async function POST(request) {
  const { user, client, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  const redirectUri = process.env.ENABLE_BANKING_REDIRECT_URI;
  if (!redirectUri) {
    return Response.json({ error: "Bank connections aren't configured yet — missing ENABLE_BANKING_REDIRECT_URI." }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { aspsp_name, aspsp_country } = body;
  if (!aspsp_name || !aspsp_country) {
    return Response.json({ error: "Pick a bank first." }, { status: 400 });
  }

  try {
    const { data: connection, error: insertError } = await client
      .from("bank_connections")
      .insert({ user_id: user.id, aspsp_name, aspsp_country })
      .select()
      .single();
    if (insertError) throw insertError;

    const auth = await startAuth({
      aspspName: aspsp_name,
      aspspCountry: aspsp_country,
      redirectUrl: redirectUri,
      state: connection.state_token,
    });

    return Response.json({ redirect_url: auth.url });
  } catch (err) {
    return Response.json({ error: err.message || "Couldn't start the bank connection." }, { status: err.status || 500 });
  }
}
