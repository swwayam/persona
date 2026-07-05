/**
 * Fixed-window, in-memory rate limiter keyed by client IP.
 *
 * Counters live in module scope, so limits reset on server restart and are
 * per-instance on serverless deployments (each lambda has its own map).
 * That's good enough to keep a demo's LLM bill bounded; swap for a shared
 * store (e.g. Upstash Redis) if limits must hold across instances.
 */

interface Bucket {
  count: number;
  resetAt: number; // epoch ms when the window ends
}

const buckets = new Map<string, Bucket>();

export interface RateLimitVerdict {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function getRateLimitConfig(): { max: number; windowMs: number } {
  return {
    max: Number(process.env.RATE_LIMIT_MAX) || 10,
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 24 * 60 * 60 * 1000
  };
}

export function checkRateLimit(key: string): RateLimitVerdict {
  const { max, windowMs } = getRateLimitConfig();
  const now = Date.now();

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    // Bound memory: expired buckets are only touched again if the same IP
    // returns, so sweep the map once it grows past a sane ceiling.
    if (buckets.size >= 10_000) sweepExpired(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, limit: max, remaining: max - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= max) {
    return { ok: false, limit: max, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, limit: max, remaining: max - bucket.count, resetAt: bucket.resetAt };
}

function sweepExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** "3h 12m" / "45 min" — for human-readable retry messages. */
export function formatTimeLeft(resetAt: number): string {
  const totalMinutes = Math.max(1, Math.ceil((resetAt - Date.now()) / 60_000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h === 0 ? `${m} min` : `${h}h ${m}m`;
}
