import { requireUser } from "@/lib/supabaseServer";
import { extractFromPdf, EXTRACTION_KINDS, MODEL } from "@/lib/pdfExtraction";
import { classifyExtraction } from "@/lib/aiCompliance";

const MAX_BYTES = 15 * 1024 * 1024;

// Compact, kind-aware description of what came out of the document — enough
// to reconstruct what the user saw without dumping the full raw payload into
// the log. Named amounts (not just item names) so a bad extraction is
// actually debuggable from the audit trail later.
function summarizeExtraction(kind, result) {
  if (kind === "payslip") {
    const deductionCount = (result.deductions || []).length;
    return `Extracted payslip: gross ${result.grossPay ?? "—"}, net ${result.netPay ?? "—"}, ` +
      `${deductionCount} deduction${deductionCount === 1 ? "" : "s"}.`;
  }
  const items = result.items || [];
  if (items.length === 0) return "Found nothing to extract.";
  const valueField = kind === "liabilities" ? "balance" : kind === "transactions" ? "amount" : "value";
  const lines = items.map((i) => `${i.name}: ${i[valueField]}`).join("; ");
  return `Extracted ${items.length} ${kind} item${items.length === 1 ? "" : "s"} — ${lines}`;
}

// Same audit trail the Assistant writes to (§4.1.G) — every AI call the app
// makes gets one traceable record, chat or extraction, not two divergent
// logs. Best-effort: a failed log write shouldn't block the user from seeing
// their extracted data.
async function logExtraction(supabase, userId, { kind, fileName, fileSize, summary }) {
  try {
    const { error } = await supabase.from("ai_interactions").insert({
      user_id: userId,
      user_message: `Uploaded a PDF to extract ${kind} (${fileName || "upload.pdf"}, ${fileSize} bytes)`,
      classification: classifyExtraction(),
      tools_used: [`extract_${kind}`],
      reply: summary,
      blocked: false,
      model: MODEL,
    });
    if (error) throw error;
  } catch (err) {
    console.error("Couldn't log extraction:", err.message || err);
  }
}

export async function POST(request) {
  const { user, client: supabase, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "PDF extraction isn't configured yet." }, { status: 503 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Couldn't read the upload." }, { status: 400 });
  }

  const kind = formData.get("kind");
  const file = formData.get("file");

  if (!EXTRACTION_KINDS.includes(kind)) {
    return Response.json({ error: "Unknown extraction type." }, { status: 400 });
  }
  if (!(file instanceof Blob) || file.size === 0) {
    return Response.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return Response.json({ error: "Only PDF files are supported." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "That file is too large (max 15MB)." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await extractFromPdf(kind, buffer.toString("base64"));
    await logExtraction(supabase, user.id, {
      kind,
      fileName: file.name,
      fileSize: file.size,
      summary: summarizeExtraction(kind, result),
    });
    return Response.json({ result });
  } catch (err) {
    await logExtraction(supabase, user.id, {
      kind,
      fileName: file.name,
      fileSize: file.size,
      summary: `Extraction failed: ${err.message || "unknown error"}`,
    });
    return Response.json({ error: err.message || "Couldn't read that PDF." }, { status: 502 });
  }
}
