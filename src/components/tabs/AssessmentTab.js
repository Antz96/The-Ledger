"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ASSESSMENT_QUESTIONS } from "@/lib/assessmentQuestions";

export default function AssessmentTab({ onSubmit, saving }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({}); // question_id -> { label, tags } | { label } for text
  const [textDraft, setTextDraft] = useState("");

  const question = ASSESSMENT_QUESTIONS[step];
  const isLast = step === ASSESSMENT_QUESTIONS.length - 1;

  useEffect(() => {
    if (question.type === "text") setTextDraft(answers[question.id]?.label ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function finish(finalAnswers) {
    const responses = ASSESSMENT_QUESTIONS.map((q) => ({
      question_id: q.id,
      answer: finalAnswers[q.id]?.label ?? "",
    }));
    const tags = Array.from(
      new Set(Object.values(finalAnswers).flatMap((a) => a.tags || []))
    );
    const goalNote = finalAnswers.q7?.label?.trim() || null;
    onSubmit(responses, tags, goalNote);
  }

  function selectOption(option) {
    const next = { ...answers, [question.id]: { label: option.label, tags: option.tags } };
    setAnswers(next);
    if (isLast) {
      finish(next);
    } else {
      setStep((s) => s + 1);
    }
  }

  function submitText() {
    const next = { ...answers, [question.id]: { label: textDraft } };
    setAnswers(next);
    if (isLast) {
      finish(next);
    } else {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step === 0) return;
    setStep((s) => s - 1);
  }

  return (
    <div
      style={{ background: "var(--obsidian)", minHeight: "100dvh" }}
      className="flex items-center justify-center p-6"
    >
      <div className="ledger-card w-full max-w-md p-7">
        <div className="flex items-center gap-2.5 mb-1">
          <span
            className="w-[22px] h-[22px] rounded-[7px] flex-shrink-0"
            style={{
              background: "linear-gradient(140deg, var(--emerald), var(--cyan))",
              boxShadow: "0 0 14px rgba(34,211,238,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
            }}
          />
          <p className="serif text-xl font-semibold text-[var(--text)]">The Ledger</p>
        </div>
        <p className="text-xs mono text-[var(--muted)] mb-5">A few quick questions so we can point you at the right content — takes about a minute.</p>

        <div className="flex items-center gap-2 mb-5">
          {step > 0 && (
            <button onClick={goBack} aria-label="Previous question" className="text-[var(--faint)] hover:text-[var(--text)]">
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="h-1.5 flex-1 rounded-full bg-[var(--panel-hi)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${((step + 1) / ASSESSMENT_QUESTIONS.length) * 100}%`, background: "linear-gradient(90deg, var(--emerald), var(--cyan))" }}
            />
          </div>
          <span className="text-[11px] mono text-[var(--faint)] whitespace-nowrap">{step + 1} / {ASSESSMENT_QUESTIONS.length}</span>
        </div>

        <p className="serif text-lg font-semibold text-[var(--text)] mb-4">{question.text}</p>

        {question.type === "select" ? (
          <div className="space-y-2">
            {question.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => selectOption(opt)}
                disabled={saving}
                className="w-full text-left text-sm px-4 py-2.5 rounded-lg border hover:bg-[var(--panel-hi)] disabled:opacity-50 text-[var(--text)]"
                style={{ borderColor: "var(--line)", background: "var(--panel-lo)" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <input
              autoFocus
              value={textDraft}
              onChange={(e) => setTextDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitText()}
              placeholder={question.placeholder}
              aria-label={question.text}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[var(--emerald)] bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)]"
              style={{ borderColor: "var(--line)" }}
            />
            <button
              onClick={submitText}
              disabled={saving}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-[var(--obsidian)] disabled:opacity-60"
              style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 20px rgba(34,211,238,0.25)" }}
            >
              {textDraft.trim() ? "Continue" : "Skip"}
            </button>
          </div>
        )}

        <p className="text-[10px] mono text-[var(--faint)] mt-5 text-center">
          This just helps us show relevant articles — nothing here is evaluated or scored.
        </p>
      </div>
    </div>
  );
}
