// Server-only. Never import from a client component — it reads ANTHROPIC_API_KEY.
import Anthropic from "@anthropic-ai/sdk";
import {
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
  ASSET_PURPOSES,
  INCOME_CATS,
  EXPENSE_CATS,
  SAVINGS_CATS,
} from "@/lib/ledgerConstants";

export const MODEL = "claude-sonnet-5";

let client;
function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("PDF extraction isn't configured yet — no Anthropic API key is set.");
    client = new Anthropic({ apiKey });
  }
  return client;
}

const EXTRACTORS = {
  assets: {
    instructions:
      "This is a financial statement (bank, investment, pension, or similar). Find every distinct " +
      "asset or account balance in it — there may be more than one. For each, report its name (as " +
      "shown, or a short sensible label), its most fitting category, the best-fitting purpose for " +
      "that money, and its current value as a plain number with no currency symbol or commas. Only " +
      "report what the document actually shows — never estimate or invent a figure. If you can't find " +
      "any asset balances, return an empty list.",
    tool: {
      name: "report_assets",
      description: "Report every asset/account balance found in the statement.",
      input_schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                category: { type: "string", enum: ASSET_CATEGORIES },
                purpose: { type: "string", enum: ASSET_PURPOSES },
                value: { type: "number" },
              },
              required: ["name", "category", "purpose", "value"],
            },
          },
        },
        required: ["items"],
      },
    },
  },
  liabilities: {
    instructions:
      "This is a statement for a debt or liability (credit card, loan, mortgage, or similar). Find " +
      "every distinct balance owed in it. For each, report its name (as shown, or a short sensible " +
      "label), its most fitting category, and the current outstanding balance as a plain number with " +
      "no currency symbol or commas. Only report what the document actually shows. If you can't find " +
      "any balances owed, return an empty list.",
    tool: {
      name: "report_liabilities",
      description: "Report every debt/liability balance found in the statement.",
      input_schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                category: { type: "string", enum: LIABILITY_CATEGORIES },
                balance: { type: "number" },
              },
              required: ["name", "category", "balance"],
            },
          },
        },
        required: ["items"],
      },
    },
  },
  transactions: {
    instructions:
      `This is a bank or card statement covering a period of time. List every individual transaction ` +
      `in it. For each, report the date (YYYY-MM-DD), whether it's income, an expense, or a transfer ` +
      `into savings, a category, the amount as a positive plain number, and a short note describing it ` +
      `(e.g. the merchant or payee name). Use "income" categories like ${INCOME_CATS.join(", ")}; ` +
      `"expense" categories like ${EXPENSE_CATS.join(", ")}; "savings" categories like ${SAVINGS_CATS.join(", ")}. ` +
      `Pick the closest match, or "Other" if nothing fits. Only report transactions actually shown — ` +
      `don't invent or summarize rows.`,
    tool: {
      name: "report_transactions",
      description: "Report every transaction line found in the statement.",
      input_schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", description: "YYYY-MM-DD" },
                type: { type: "string", enum: ["income", "expense", "savings"] },
                category: { type: "string" },
                amount: { type: "number" },
                note: { type: "string" },
              },
              required: ["date", "type", "category", "amount"],
            },
          },
        },
        required: ["items"],
      },
    },
  },
  payslip: {
    instructions:
      "This is a payslip. Report the pay period it covers, the pay date if shown, gross pay, net " +
      "(take-home) pay, and every individual deduction line (tax, National Insurance/social security, " +
      "pension, student loan, or anything else deducted) with its label and amount, all as plain " +
      "numbers with no currency symbol or commas. Only report figures actually printed on the payslip.",
    tool: {
      name: "report_payslip",
      description: "Report the pay breakdown found on the payslip.",
      input_schema: {
        type: "object",
        properties: {
          payPeriod: { type: "string", enum: ["weekly", "fortnightly", "four-weekly", "monthly", "annual", "other"] },
          payDate: { type: "string", description: "YYYY-MM-DD if shown" },
          grossPay: { type: "number" },
          netPay: { type: "number" },
          deductions: {
            type: "array",
            items: {
              type: "object",
              properties: { label: { type: "string" }, amount: { type: "number" } },
              required: ["label", "amount"],
            },
          },
        },
        required: ["netPay"],
      },
    },
  },
};

export const EXTRACTION_KINDS = Object.keys(EXTRACTORS);

export async function extractFromPdf(kind, base64Pdf) {
  const extractor = EXTRACTORS[kind];
  if (!extractor) throw new Error(`Unknown extraction type: ${kind}`);

  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    tools: [extractor.tool],
    tool_choice: { type: "tool", name: extractor.tool.name },
    messages: [
      {
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Pdf } },
          { type: "text", text: extractor.instructions },
        ],
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse) throw new Error("Couldn't read that PDF — Claude didn't return structured data.");
  return toolUse.input;
}
