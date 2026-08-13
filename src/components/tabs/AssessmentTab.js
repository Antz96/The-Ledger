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
      style={{ background: "var(--ledger-green)", minHeight: "100dvh" }}
      className="flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md bg-[#F7F3E8] rounded-lg p-7 shadow-xl">
        <p className="serif text-xl text-[#1F3D2E] mb-1">The Ledger</p>
        <p className="text-xs mono text-[#5B5541] mb-5">A few quick questions so we can point you at the right content — takes about a minute.</p>

        <div className="flex items-center gap-2 mb-5">
          {step > 0 && (
            <button onClick={goBack} aria-label="Previous question" className="opacity-50 hover:opacity-100">
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="h-1.5 flex-1 rounded-full bg-[#EDE7D6] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${((step + 1) / ASSESSMENT_QUESTIONS.length) * 100}%`, background: "var(--ledger-green-soft)" }}
            />
          </div>
          <span className="text-[11px] mono opacity-50 whitespace-nowrap">{step + 1} / {ASSESSMENT_QUESTIONS.length}</span>
        </div>

        <p className="serif text-lg text-[#1F3D2E] mb-4">{question.text}</p>

        {question.type === "select" ? (
          <div className="space-y-2">
            {question.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => selectOption(opt)}
                disabled={saving}
                className="w-full text-left text-sm px-4 py-2.5 rounded border hover:bg-[#EAE4D2] disabled:opacity-50"
                style={{ borderColor: "var(--line)", background: "white" }}
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
              className="w-full border rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#2F6B4F] bg-white"
              style={{ borderColor: "var(--line)" }}
            />
            <button
              onClick={submitText}
              disabled={saving}
              className="w-full py-2.5 rounded text-sm font-medium text-[#F7F3E8] disabled:opacity-60"
              style={{ background: "#2F6B4F" }}
            >
              {textDraft.trim() ? "Continue" : "Skip"}
            </button>
          </div>
        )}

        <p className="text-[10px] mono opacity-40 mt-5 text-center">
          This just helps us show relevant articles — nothing here is evaluated or scored.
        </p>
      </div>
    </div>
  );
}
