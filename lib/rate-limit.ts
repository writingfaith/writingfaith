import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting for auth and newsletter endpoints (ADR 0001 §8), backed by
 * Upstash. When Upstash env vars are absent (local development), limiting is
 * skipped with a warning rather than blocking the flow — production should
 * always have it configured.
 */
const configured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const limiter = configured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      // 5 attempts per hour per key: generous for humans, hostile to scripts.
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "writingfaith",
    })
  : null;

const quoteCardLimiter = configured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(30, "1 h"),
      prefix: "writingfaith:quote-card",
    })
  : null;

let warned = false;

/**
 * Returns true when the action may proceed. Keys should combine the concern
 * and the principal, e.g. `subscribe:1.2.3.4` or `signin:user@example.com`.
 */
export async function allowRequest(key: string): Promise<boolean> {
  if (!limiter) {
    if (!warned) {
      console.warn(
        "[rate-limit] Upstash env vars missing — rate limiting is disabled.",
      );
      warned = true;
    }
    return true;
  }
  const { success } = await limiter.limit(key);
  return success;
}

/** A more generous public-media limit: enough to explore, bounded for cost. */
export async function allowQuoteCardRequest(key: string): Promise<boolean> {
  if (!quoteCardLimiter) return true;
  const { success } = await quoteCardLimiter.limit(key);
  return success;
}
