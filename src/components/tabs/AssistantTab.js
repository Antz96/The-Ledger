"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Send, User, Sparkles, ArrowRight } from "lucide-react";
import { sendAssistantMessage } from "@/lib/assistantApi";
import { SECTIONS } from "@/lib/navSections";

const EXAMPLE_PROMPTS = [
  "What's my net worth right now?",
  "Bring up my credit cards",
  "How much have I spent on Housing this month?",
  "Am I on track for my savings goal?",
];

function makeMessage(role, text, opts = {}) {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, role, text, ...opts };
}

export default function AssistantTab({ displayName }) {
  const router = useRouter();
  const [messages, setMessages] = useState([
    makeMessage(
      "assistant",
      `Hi${displayName ? ` ${displayName}` : ""} — ask me about your accounts, spending, or goals and I'll pull the real numbers. I can also set things up for you, like a savings goal, and take you to the right section. I won't tell you what to do with your money, though — I'm not a financial advisor.`,
      { synthetic: true }
    ),
  ]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(null);

  async function send(text) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const history = messages.filter((m) => !m.synthetic).map((m) => ({ role: m.role, content: m.text }));
    setMessages((prev) => [...prev, makeMessage("user", trimmed)]);
    setDraft("");
    setSending(true);
    setError("");
    try {
      const { reply, redirectTo } = await sendAssistantMessage([...history, { role: "user", content: trimmed }]);
      setMessages((prev) => [...prev, makeMessage("assistant", reply)]);
      if (redirectTo) {
        const section = SECTIONS.find((s) => s.href === redirectTo);
        setRedirecting(section?.label || redirectTo);
        setTimeout(() => router.push(redirectTo), 1400);
      }
    } catch (err) {
      setError(err.message || "Couldn't reach the assistant.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide text-[var(--muted)] mb-1 flex items-center gap-1.5">
          <Sparkles size={15} /> Assistant
        </p>
        <p className="text-xs text-[var(--faint)]">
          Reads your real accounts, transactions, goals, and allocation settings to answer questions — but doesn&apos;t
          advise on decisions. Not a licensed financial advisor.
        </p>
      </div>

      <div className="ledger-card overflow-hidden">
        <div className="p-4 sm:p-5 space-y-3 max-h-[480px] overflow-y-auto">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {sending && <TypingBubble />}
          {redirecting && (
            <p className="text-xs flex items-center gap-1 text-[var(--muted)]">
              Taking you to {redirecting} <ArrowRight size={12} />
            </p>
          )}
          {error && <p className="text-xs" style={{ color: "var(--rust)" }}>{error}</p>}
        </div>

        <div className="px-4 sm:px-5 pb-3 flex flex-wrap gap-1.5">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              disabled={sending}
              className="text-xs px-2.5 py-1.5 rounded-full border hover:bg-[var(--panel-hi)] disabled:opacity-50 text-[var(--muted)]"
              style={{ borderColor: "var(--line)" }}
            >
              {p}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(draft); }}
          className="flex items-center gap-2 px-4 sm:px-5 py-3 border-t"
          style={{ borderColor: "var(--line)" }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about your accounts, spending, or goals…"
            aria-label="Message the assistant"
            className="flex-1 text-sm border rounded-lg px-3 py-2 bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--emerald)]"
            style={{ borderColor: "var(--line)" }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Send message"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--obsidian)] disabled:opacity-50 flex-shrink-0"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isUser ? "var(--panel-hi)" : "linear-gradient(140deg, var(--emerald), var(--cyan))",
          color: isUser ? "var(--muted)" : "var(--obsidian)",
        }}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div
        className={`text-sm leading-relaxed rounded-2xl px-3.5 py-2.5 max-w-[80%] ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
        style={{
          background: isUser ? "linear-gradient(140deg, var(--emerald), var(--cyan))" : "var(--panel-hi)",
          color: isUser ? "var(--obsidian)" : "var(--text)",
        }}
      >
        {message.text}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-start gap-2">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", color: "var(--obsidian)" }}
      >
        <Bot size={14} />
      </div>
      <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5" style={{ background: "var(--panel-hi)" }}>
        <span className="inline-flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full opacity-40 animate-bounce" style={{ background: "var(--faint)", animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full opacity-40 animate-bounce" style={{ background: "var(--faint)", animationDelay: "120ms" }} />
          <span className="w-1.5 h-1.5 rounded-full opacity-40 animate-bounce" style={{ background: "var(--faint)", animationDelay: "240ms" }} />
        </span>
      </div>
    </div>
  );
}
