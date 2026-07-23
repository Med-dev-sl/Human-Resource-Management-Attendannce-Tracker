import { prisma } from "./prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getSessionId(request: Request | NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/session=([^;]+)/);
  return match?.[1] || null;
}

export async function getUser(request: Request | NextRequest) {
  const userId = getSessionId(request);
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}

export async function requireUser(request: Request | NextRequest) {
  const user = await getUser(request);
  if (!user) {
    throw new AuthError(401, "Unauthorized");
  }
  return user;
}

export async function requireAdmin(request: Request | NextRequest) {
  const user = await requireUser(request);
  if (user.role !== "admin") {
    throw new AuthError(403, "Forbidden");
  }
  return user;
}

export class AuthError extends Error {
  statusCode: number;
  constructor(statusCode: number = 401, message: string = "Unauthorized") {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}
