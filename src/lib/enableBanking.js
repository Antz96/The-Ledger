// Server-only. Never import from a client component — it reads
// ENABLE_BANKING_PRIVATE_KEY, which must not be bundled for the browser.
import crypto from "crypto";

const API_BASE = "https://api.enablebanking.com";

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function getConfig() {
  const appId = process.env.ENABLE_BANKING_APP_ID;
  const rawKey = process.env.ENABLE_BANKING_PRIVATE_KEY;
  if (!appId || !rawKey) {
    throw new Error(
      "Bank connections aren't configured yet — missing ENABLE_BANKING_APP_ID or ENABLE_BANKING_PRIVATE_KEY."
    );
  }
  // .env files can't hold real newlines in a single value; the private key is
  // stored with literal \n escapes and unescaped here.
  const privateKey = rawKey.replace(/\\n/g, "\n");
  return { appId, privateKey };
}

function signAppJWT() {
  const { appId, privateKey } = getConfig();
  const header = { typ: "JWT", alg: "RS256", kid: appId };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: "enablebanking.com", aud: "api.enablebanking.com", iat: now, exp: now + 3600 };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(signingInput), privateKey);
  return `${signingInput}.${base64url(signature)}`;
}

async function ebFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${signAppJWT()}`,
      "Content-Type": "application/json",
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.message || body.error_description || `Enable Banking request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

export function listASPSPs({ country = "GB" } = {}) {
  const params = new URLSearchParams({ country, psu_type: "personal" });
  return ebFetch(`/aspsps?${params.toString()}`);
}

export function startAuth({ aspspName, aspspCountry, redirectUrl, state, psuType = "personal" }) {
  const validUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  return ebFetch("/auth", {
    method: "POST",
    body: JSON.stringify({
      aspsp: { name: aspspName, country: aspspCountry },
      access: { valid_until: validUntil },
      state,
      redirect_url: redirectUrl,
      psu_type: psuType,
    }),
  });
}

export function createSession(code) {
  return ebFetch("/sessions", { method: "POST", body: JSON.stringify({ code }) });
}

export function getSession(sessionId) {
  return ebFetch(`/sessions/${sessionId}`);
}

export function deleteSession(sessionId) {
  return ebFetch(`/sessions/${sessionId}`, { method: "DELETE" });
}

export function getAccountBalances(accountUid) {
  return ebFetch(`/accounts/${accountUid}/balances`);
}

export function getAccountTransactions(accountUid, { dateFrom, dateTo, continuationKey } = {}) {
  const params = new URLSearchParams();
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);
  if (continuationKey) params.set("continuation_key", continuationKey);
  const qs = params.toString();
  return ebFetch(`/accounts/${accountUid}/transactions${qs ? `?${qs}` : ""}`);
}
