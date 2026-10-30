import crypto from "node:crypto";

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

function env(name: string) {
  return process.env[name]?.trim().replace(/^(["'])(.*)\1$/, "$2");
}

function publicKey() {
  const value = env("WINPAY_CALLBACK_PUBLIC_KEY") || env("WINPAY_PUBLIC_KEY");
  return value?.replace(/\\n/g, "\n");
}

export function verifyWinpayWebhook(request: Request, rawBody: string) {
  const signature = request.headers.get("x-signature")?.trim();
  const timestamp = request.headers.get("x-timestamp")?.trim();
  const key = publicKey();
  const isProduction = env("WINPAY_IS_PRODUCTION") === "true";
  const requiresSignature = isProduction || env("WINPAY_REQUIRE_WEBHOOK_SIGNATURE") === "true";

  if (!signature || !timestamp || !key) return !requiresSignature;

  const timestampMs = Date.parse(timestamp);
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > MAX_CLOCK_SKEW_MS) return false;

  let minifiedBody: string;
  try {
    minifiedBody = JSON.stringify(JSON.parse(rawBody));
  } catch {
    return false;
  }

  const pathname = new URL(request.url).pathname;
  const bodyHash = crypto.createHash("sha256").update(minifiedBody).digest("hex").toLowerCase();
  const stringToSign = `${request.method}:${pathname}:${bodyHash}:${timestamp}`;

  try {
    return crypto.createVerify("RSA-SHA256").update(stringToSign).verify(key, Buffer.from(signature, "base64"));
  } catch {
    return false;
  }
}
