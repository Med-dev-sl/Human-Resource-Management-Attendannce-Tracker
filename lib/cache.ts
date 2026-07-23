import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

const localCache = new Map<string, { data: unknown; expiresAt: number }>();

const DEFAULT_TTL = 30_000;

export async function getCached<T>(key: string): Promise<T | undefined> {
  if (redis) {
    const data = await redis.get<T>(key);
    return data ?? undefined;
  }
  const entry = localCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    localCache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

export async function setCache(key: string, value: unknown, ttlMs: number = DEFAULT_TTL): Promise<void> {
  if (redis) {
    await redis.set(key, value, { ex: Math.ceil(ttlMs / 1000) });
    return;
  }
  localCache.set(key, { data: value, expiresAt: Date.now() + ttlMs });
  if (localCache.size > 500) {
    const oldest = localCache.entries().next().value;
    if (oldest) localCache.delete(oldest[0]);
  }
}

export function generateCacheKey(...parts: string[]): string {
  return parts.join(":");
}

export function cacheHeaders(maxAge = 30): HeadersInit {
  return {
    "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
  };
}
