import { prisma } from "./prisma";

const localCache = new Map<string, { data: unknown; expiresAt: number }>();
const DEFAULT_TTL = 30_000;

export async function getCached<T>(key: string): Promise<T | undefined> {
  try {
    const row = await prisma.$queryRaw<{ value: string; expires_at: Date }[]>`
      SELECT value, expires_at FROM "Cache" WHERE key = ${key} AND expires_at > NOW() LIMIT 1
    `;
    if (row.length > 0) return JSON.parse(row[0].value) as T;
  } catch {
    // DB query failed — fall back to local cache
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
  const expiresAt = new Date(Date.now() + ttlMs);
  const json = JSON.stringify(value);
  try {
    await prisma.$executeRaw`
      INSERT INTO "Cache" (key, value, expires_at) VALUES (${key}, ${json}, ${expiresAt})
      ON CONFLICT (key) DO UPDATE SET value = ${json}, expires_at = ${expiresAt}
    `;
  } catch {
    localCache.set(key, { data: value, expiresAt: Date.now() + ttlMs });
    if (localCache.size > 500) {
      const oldest = localCache.entries().next().value;
      if (oldest) localCache.delete(oldest[0]);
    }
  }
}

export const generateCacheKey = (...parts: string[]) => parts.join(":");
