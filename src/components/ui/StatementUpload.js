"use client";

import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";

// Prototype only — the file never leaves the browser. No upload, no read, no storage.
// Real extraction comes once the AI backend is wired up, same as the Assistant tab.
export default function StatementUpload({
  label,
  className = "px-4 sm:px-5 py-3 border-t",
  doneDetail = "Once it's switched on, I'll pull the entries out of statements like this for you to review before anything is added.",
}) {
  const inputRef = useRef(null);
  const [state, setState] = useState("idle"); // idle | reading | done | error
  const [fileName, setFileName] = useState("");

  function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileName(file.name);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setState("error");
      return;
    }
    setState("reading");
    setTimeout(() => setState("done"), 1100);
  }

  return (
    <div className={className} style={{ borderColor: "var(--line)" }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-[var(--faint)] flex items-center gap-1.5">
          <FileText size={13} /> {label}
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={state === "reading"}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg text-[var(--obsidian)] disabled:opacity-60 flex-shrink-0"
          style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
        >
          <Upload size={13} /> Choose PDF
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFile}
          className="hidden"
          aria-label={label}
        />
      </div>

      {state === "reading" && (
        <p className="text-xs mono text-[var(--muted)] mt-2.5 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--cyan)" }} />
          Reading {fileName}…
        </p>
      )}

      {state === "done" && (
        <div className="mt-2.5 text-xs rounded-lg px-3 py-2.5 border" style={{ borderColor: "var(--line)", background: "var(--panel-hi)" }}>
          <p className="text-[var(--text)]">
            This is a look-and-feel preview — PDF import isn&apos;t connected yet, so{" "}
            <span className="mono">{fileName}</span> wasn&apos;t read, uploaded, or stored.
          </p>
          <p className="text-[var(--faint)] mt-1">{doneDetail}</p>
        </div>
      )}

      {state === "error" && (
        <p className="text-xs mt-2.5" style={{ color: "var(--rust)" }}>
          {fileName} doesn&apos;t look like a PDF — try a different file.
        </p>
      )}
    </div>
  );
}
