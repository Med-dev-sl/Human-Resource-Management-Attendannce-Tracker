import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { success, error, withRateLimit } from "@/lib/api-utils";
import { passwordSchema } from "@/lib/validation";
import { getUser } from "@/lib/get-user";

export async function GET(request: Request) {
  const user = await getUser(request);
  if (!user) return error("Unauthorized", 401);

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!profile) return error("User not found", 404);

  return success({ user: profile });
}

export async function PUT(request: Request) {
  const rateLimited = withRateLimit(request, 20, 60_000);
  if (rateLimited) return rateLimited.response;

  const current = await getUser(request);
  if (!current) return error("Unauthorized", 401);

  const body = await request.json();
  const data: Record<string, string> = {};
  if (body.name && typeof body.name === "string") data.name = body.name;
  if (body.email && typeof body.email === "string") data.email = body.email;

  const user = await prisma.user.update({
    where: { id: current.id },
    data,
    select: { id: true, email: true, name: true, role: true },
  });

  return success({ user });
}

export async function PATCH(request: Request) {
  const rateLimited = withRateLimit(request, 10, 60_000);
  if (rateLimited) return rateLimited.response;

  const current = await getUser(request);
  if (!current) return error("Unauthorized", 401);

  const body = await request.json();
  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) {
    return error("Validation failed", 400, parsed.error.flatten().fieldErrors);
  }

  const user = await prisma.user.findUnique({ where: { id: current.id } });
  if (!user) return error("User not found", 404);

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!isValid) return error("Current password is incorrect", 401);

  const password = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: current.id }, data: { password } });

  return success({ message: "Password updated successfully" });
}
