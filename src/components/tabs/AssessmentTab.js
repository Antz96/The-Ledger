"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { ASSESSMENT_QUESTIONS } from "@/lib/assessmentQuestions";

function isVisible(q, answers) {
  return !q.showIf || q.showIf(answers);
}

function nextVisibleIndex(from, answers) {
  let i = from + 1;
  while (i < ASSESSMENT_QUESTIONS.length && !isVisible(ASSESSMENT_QUESTIONS[i], answers)) i++;
  return i;
}

function prevVisibleIndex(from, answers) {
  let i = from - 1;
  while (i >= 0 && !isVisible(ASSESSMENT_QUESTIONS[i], answers)) i--;
  return i;
}

export default function AssessmentTab({ onSubmit, saving }) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("questions"); // "questions" | "review"
  const [answers, setAnswers] = useState({}); // question_id -> { label, tags?, draft? }
  const [textDraft, setTextDraft] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState([]);

  const question = ASSESSMENT_QUESTIONS[step];
  const visible = ASSESSMENT_QUESTIONS.filter((q) => isVisible(q, answers));
  const posInVisible = visible.indexOf(question) + 1;

  useEffect(() => {
    if (phase === "questions" && question?.type === "text") {
      setTextDraft(answers[question.id]?.label ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phase]);

  function goToReview(finalAnswers) {
    const drafts = ASSESSMENT_QUESTIONS.map((q) => finalAnswers[q.id]?.draft)
      .filter(Boolean)
      .map((d, i) => ({ ...d, _key: i }));
    setReviewDrafts(drafts);
    setPhase("review");
  }

  function advance(next) {
    setAnswers(next);
    const ni = nextVisibleIndex(step, next);
    if (ni >= ASSESSMENT_QUESTIONS.length) {
      goToReview(next);
    } else {
      setStep(ni);
    }
  }

  function selectOption(option) {
    const next = { ...answers, [question.id]: { label: option.label, tags: option.tags, draft: option.draft } };
    advance(next);
  }

  function submitText() {
    const next = { ...answers, [question.id]: { label: textDraft } };
    advance(next);
  }

  function goBack() {
    if (phase === "review") {
      setPhase("questions");
      return;
    }
    const pi = prevVisibleIndex(step, answers);
    if (pi < 0) return;
    setStep(pi);
  }

  function updateDraftValue(key, value) {
    setReviewDrafts((prev) => prev.map((d) => (d._key === key ? { ...d, value } : d)));
  }

  function removeDraft(key) {
    setReviewDrafts((prev) => prev.filter((d) => d._key !== key));
  }

  function finish() {
    const responses = ASSESSMENT_QUESTIONS.filter((q) => isVisible(q, answers)).map((q) => ({
      question_id: q.id,
      answer: answers[q.id]?.label ?? "",
    }));
    const tags = Array.from(new Set(Object.values(answers).flatMap((a) => a.tags || [])));
    const goalNote = answers.q_goal?.label?.trim() || null;
    const confirmed = reviewDrafts
      .filter((d) => Number(d.value) > 0)
      .map(({ _key, ...d }) => ({ ...d, value: Number(d.value) }));
    onSubmit(responses, tags, goalNote, confirmed);
  }

  if (phase === "review") {
    const homeDraft = reviewDrafts.find((d) => d.category === "Property");
    const mortgageDraft = reviewDrafts.find((d) => d.category === "Mortgage");
    const equity = homeDraft && mortgageDraft ? Number(homeDraft.value) - Number(mortgageDraft.value) : null;
    const ownsPortfolio = answers.q_property?.label === "Multiple properties";

    return (
      <div style={{ background: "var(--obsidian)", minHeight: "100dvh" }} className="flex items-center justify-center p-6">
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

          <div className="flex items-center gap-2 mt-4 mb-4">
            <button onClick={goBack} aria-label="Back to questions" className="text-[var(--faint)] hover:text-[var(--text)]">
              <ArrowLeft size={16} />
            </button>
            <p className="serif text-lg font-semibold text-[var(--text)]">Here&apos;s your starting point</p>
          </div>

          {ownsPortfolio && (
            <p
              className="text-xs px-3 py-2 rounded-lg mb-4"
              style={{ background: "rgba(34,211,238,0.08)", color: "var(--cyan)", border: "1px solid rgba(34,211,238,0.2)" }}
            >
              You mentioned multiple properties — add each one individually from Assets after this, so your net worth reflects all of them.
            </p>
          )}

          {reviewDrafts.length === 0 ? (
            <p className="text-xs text-[var(--faint)] mb-5">
              Nothing to add yet based on your answers — you can add real numbers anytime from Assets.
            </p>
          ) : (
            <>
              <p className="text-xs mono text-[var(--muted)] mb-4">
                Rough figures from your answers. Adjust or remove anything before we save it to your Ledger.
              </p>
              <div className="space-y-2 mb-5">
                {reviewDrafts.map((d) => (
                  <div
                    key={d._key}
                    className="flex items-center gap-2 border rounded-lg px-3 py-2"
                    style={{ borderColor: "var(--line)", background: "var(--panel-lo)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text)] truncate">{d.name}</p>
                      <p className="text-[10px] mono text-[var(--faint)]">{d.category}</p>
                    </div>
                    <span className="text-xs text-[var(--faint)]">£</span>
                    <input
                      type="number"
                      min="0"
                      value={d.value}
                      onChange={(e) => updateDraftValue(d._key, e.target.value)}
                      aria-label={`${d.name} amount`}
                      className="w-24 text-sm text-right border rounded-md px-2 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
                      style={{ borderColor: "var(--line)" }}
                    />
                    <button
                      onClick={() => removeDraft(d._key)}
                      aria-label={`Remove ${d.name}`}
                      className="text-[var(--faint)] hover:text-[var(--rust)]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {equity !== null && (
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg mb-5 -mt-2"
                  style={{ background: "rgba(15,185,129,0.08)", border: "1px solid rgba(15,185,129,0.2)" }}
                >
                  <span className="text-xs text-[var(--muted)]">Equity in your property (value minus mortgage)</span>
                  <span className="text-sm mono font-medium" style={{ color: equity >= 0 ? "var(--emerald)" : "var(--rust)" }}>
                    £{equity.toLocaleString()}
                  </span>
                </div>
              )}
            </>
          )}

          <button
            onClick={finish}
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-[var(--obsidian)] disabled:opacity-60"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 20px rgba(34,211,238,0.25)" }}
          >
            Save and finish
          </button>
          <p className="text-[10px] mono text-[var(--faint)] mt-5 text-center">
            You can edit or delete any of these later from Assets.
          </p>
        </div>
      </div>
    );
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
          {posInVisible > 1 && (
            <button onClick={goBack} aria-label="Previous question" className="text-[var(--faint)] hover:text-[var(--text)]">
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="h-1.5 flex-1 rounded-full bg-[var(--panel-hi)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(posInVisible / visible.length) * 100}%`, background: "linear-gradient(90deg, var(--emerald), var(--cyan))" }}
            />
          </div>
          <span className="text-[11px] mono text-[var(--faint)] whitespace-nowrap">{posInVisible} / {visible.length}</span>
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
