import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { success, error, withRateLimit } from "@/lib/api-utils";
import { createUserSchema } from "@/lib/validation";
import { requireAdmin, getUser } from "@/lib/get-user";

export async function GET(request: Request) {
  const rateLimited = withRateLimit(request, 60, 60_000);
  if (rateLimited) return rateLimited.response;

  try {
    await requireAdmin(request);
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return success({ users });
  } catch (err) {
    if (err instanceof Error && (err as Error & { statusCode?: number }).statusCode) {
      const authErr = err as Error & { statusCode: number };
      return error(authErr.message, authErr.statusCode);
    }
    return error("Failed to fetch users", 500);
  }
}

export async function POST(request: Request) {
  const rateLimited = withRateLimit(request, 15, 60_000);
  if (rateLimited) return rateLimited.response;

  try {
    await requireAdmin(request);
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return error("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return error("Email already in use", 409);

    const password = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, password, role: parsed.data.role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return success({ user }, 201);
  } catch (err) {
    if (err instanceof Error && (err as Error & { statusCode?: number }).statusCode) {
      const authErr = err as Error & { statusCode: number };
      return error(authErr.message, authErr.statusCode);
    }
    return error("Failed to create user", 500);
  }
}

export async function DELETE(request: Request) {
  const rateLimited = withRateLimit(request, 15, 60_000);
  if (rateLimited) return rateLimited.response;

  try {
    const current = await getUser(request);
    if (!current) return error("Unauthorized", 401);

    const isAdmin = await prisma.user.findUnique({ where: { id: current.id }, select: { role: true } });
    if (!isAdmin || isAdmin.role !== "admin") return error("Forbidden", 403);

    const { id } = await request.json();
    if (!id || typeof id !== "string") return error("User ID is required", 400);
    if (id === current.id) return error("Cannot delete yourself", 400);

    await prisma.user.delete({ where: { id } });
    return success({ success: true });
  } catch {
    return error("Failed to delete user", 500);
  }
}
