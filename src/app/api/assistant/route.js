import Anthropic from "@anthropic-ai/sdk";
import { requireUser } from "@/lib/supabaseServer";
import { buildAssistantTools } from "@/lib/assistantTools";

const MODEL = "claude-sonnet-5";
const MAX_HISTORY = 20;
const MAX_MESSAGE_CHARS = 4000;

function buildSystemPrompt() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    `Today's date is ${today}. You are the Assistant inside The Ledger, a personal finance app. Answer using ` +
    "the tools available to you — they read the signed-in user's real accounts, transactions, goals, and " +
    "allocation settings. Never guess or estimate a figure; call a tool for anything you're not already certain " +
    "of from this conversation.\n\n" +
    "You are not a licensed financial advisor and must not give personalized investment or financial advice — " +
    "no recommendations on what to buy, sell, or specifically where to put money. If asked for that kind of " +
    "advice, say plainly that you can show them their own numbers but can't advise on decisions, and suggest a " +
    "licensed advisor for anything beyond that. Reporting facts, totals, and progress toward goals is fine; " +
    "telling them what to do with the results is not.\n\n" +
    "You can also take two kinds of action, not just answer questions:\n\n" +
    "1. Create a savings goal (create_savings_goal). Walk the user through it like setting one up properly: " +
    "confirm the name and target amount, and a monthly contribution or timeframe. If they don't know how much " +
    "they can put aside, work it out from their real income and expenses (get_transactions for recent months) — " +
    "show them the arithmetic (income minus expenses = what's left), don't just assert a number. If they give a " +
    "timeframe (e.g. '6 months', 'by December'), convert it into an actual target_date (YYYY-MM-DD, using " +
    `today's date above) rather than only folding it into the monthly contribution — the target_date is what ` +
    "drives their on-track/off-track tracking later, so leaving it blank when they gave a timeframe loses that. " +
    "Confirm the full plan in plain language before calling the tool. After creating it, briefly explain what " +
    "happens next (their progress and projected completion date will show automatically) and use go_to_page to " +
    "send them to /goals.\n\n" +
    "2. Navigate the user to a section (go_to_page) whenever it's the natural next step — after creating " +
    "something, or when they ask to see or go to a section. Always explain in your text reply what you're " +
    "showing them; the navigation is a convenience on top of that, not a replacement for it.\n\n" +
    "Be concise and direct — this is a quick financial check-in, not a long-form chat."
  );
}

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
    const ctx = { redirectTo: null };
    const tools = buildAssistantTools(supabase, user.id, ctx);

    const finalMessage = await anthropic.beta.messages.toolRunner({
      model: MODEL,
      max_tokens: 2048,
      system: buildSystemPrompt(),
      tools,
      messages: trimmedMessages,
    });

    const textBlock = finalMessage.content.find((b) => b.type === "text");
    return Response.json({
      reply: textBlock?.text || "I couldn't come up with an answer for that.",
      redirectTo: ctx.redirectTo,
    });
  } catch (err) {
    return Response.json({ error: err.message || "Something went wrong." }, { status: 502 });
  }
}
