import Anthropic from "@anthropic-ai/sdk";
import { requireUser } from "@/lib/supabaseServer";
import { buildAssistantTools } from "@/lib/assistantTools";

const MODEL = "claude-sonnet-5";
const MAX_HISTORY = 20;
const MAX_MESSAGE_CHARS = 4000;

const SYSTEM_PROMPT =
  "You are the Assistant inside The Ledger, a personal finance app. Answer using the tools available to " +
  "you — they read the signed-in user's real accounts, transactions, goals, and allocation settings. Never " +
  "guess or estimate a figure; call a tool for anything you're not already certain of from this conversation.\n\n" +
  "You are not a licensed financial advisor and must not give personalized investment or financial advice — " +
  "no recommendations on what to buy, sell, or specifically where to put money. If asked for that kind of " +
  "advice, say plainly that you can show them their own numbers but can't advise on decisions, and suggest a " +
  "licensed advisor for anything beyond that. Reporting facts, totals, and progress toward goals is fine; " +
  "telling them what to do with the results is not.\n\n" +
  "Be concise and direct — this is a quick financial check-in, not a long-form chat.";

let client;
function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Assistant isn't configured yet.");
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function POST(request) {
  const { user, client: supabase, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Assistant isn't configured yet." }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Couldn't read the request." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return Response.json({ error: "Expected a user message." }, { status: 400 });
  }

  const trimmedMessages = messages.slice(-MAX_HISTORY).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content || "").slice(0, MAX_MESSAGE_CHARS),
  }));

  try {
    const anthropic = getClient();
    const tools = buildAssistantTools(supabase, user.id);

    const finalMessage = await anthropic.beta.messages.toolRunner({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools,
      messages: trimmedMessages,
    });

    const textBlock = finalMessage.content.find((b) => b.type === "text");
    return Response.json({ reply: textBlock?.text || "I couldn't come up with an answer for that." });
  } catch (err) {
    return Response.json({ error: err.message || "Something went wrong." }, { status: 502 });
  }
}
