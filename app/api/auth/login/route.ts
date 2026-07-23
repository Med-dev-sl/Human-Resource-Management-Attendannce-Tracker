import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { success, error, withRateLimit, unauthorized } from "@/lib/api-utils";
import { securityHeaders } from "@/lib/security";

export async function POST(request: Request) {
  const rateLimitResult = withRateLimit(request, 20, 60_000);
  if (rateLimitResult) return rateLimitResult.response;

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return error("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, name: true, role: true, password: true },
    });

    if (!user) return unauthorized("Invalid email or password");

    const isValid = await bcrypt.compare(parsed.data.password, user.password);
    if (!isValid) return unauthorized("Invalid email or password");

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { headers: securityHeaders() });

    response.cookies.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    return error("Internal server error", 500);
  }
}
