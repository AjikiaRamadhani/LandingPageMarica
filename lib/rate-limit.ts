type RateLimitEntry = { count: number; resetAt: number };

const entries = new Map<string, RateLimitEntry>();

export function isRateLimited(
  request: Request,
  scope: string,
  maxAttempts: number,
  windowMs = 15 * 60 * 1000
) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const client = request.headers.get("x-real-ip") ?? forwardedFor ?? "unknown";
  const key = `${scope}:${client}`;
  const now = Date.now();
  const current = entries.get(key);

  if (!current || current.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > maxAttempts;
}