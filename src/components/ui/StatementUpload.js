"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { extractPdf } from "@/lib/extractApi";

// Uploads a PDF straight to /api/extract and hands the parsed result back to the
// caller via onResult — the caller decides how to render it (review table, breakdown, etc).
export default function StatementUpload({ kind, label, className = "px-4 sm:px-5 py-3 border-t", onResult }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | reading | error
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("error");
      setError(`${file.name} doesn't look like a PDF — try a different file.`);
      return;
    }

    setStatus("reading");
    setError("");
    try {
      const result = await extractPdf(kind, file);
      setStatus("idle");
      onResult(result, file.name);
    } catch (err) {
      setStatus("error");
      setError(err.message || "Couldn't read that file.");
    }
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
          disabled={status === "reading"}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg text-[var(--obsidian)] disabled:opacity-60 flex-shrink-0"
          style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
        >
          {status === "reading" ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {status === "reading" ? "Reading…" : "Choose PDF"}
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

      {status === "error" && (
        <p className="text-xs mt-2.5" style={{ color: "var(--rust)" }}>{error}</p>
      )}
    </div>
  );
}
