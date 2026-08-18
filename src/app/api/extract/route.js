import { requireUser } from "@/lib/supabaseServer";
import { extractFromPdf, EXTRACTION_KINDS } from "@/lib/pdfExtraction";

const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(request) {
  const { errorResponse } = await requireUser(request);
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
    return Response.json({ result });
  } catch (err) {
    return Response.json({ error: err.message || "Couldn't read that PDF." }, { status: 502 });
  }
}
