import { NextResponse } from "next/server";
import { securityHeaders } from "@/lib/security";

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { headers: securityHeaders() }
  );
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
