import { NextResponse } from "next/server";
import { securityHeaders, rateLimit, getClientIp } from "./security";

export function success<T>(data: T, status = 200, maxAge?: number) {
  const headers: Record<string, string> = { ...securityHeaders() };
  if (maxAge) {
    headers["Cache-Control"] = `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`;
  }
  return NextResponse.json(data, { status, headers });
}

export function error(message: string, status = 400, details?: unknown) {
  const body = details ? { error: message, details } : { error: message };
  return NextResponse.json(body, { status, headers: securityHeaders() });
}

export function notFound(message = "Not found") {
  return error(message, 404);
}

export function withRateLimit(request: Request, maxRequests = 60, windowMs = 60_000) {
  const ip = getClientIp(request);
  const result = rateLimit(`api:${ip}`, maxRequests, windowMs);
  if (!result.allowed) {
    const headers: Record<string, string> = {
      ...securityHeaders(),
      "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
    };
    return {
      response: NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers }
      ),
    };
  }
  return null;
}
