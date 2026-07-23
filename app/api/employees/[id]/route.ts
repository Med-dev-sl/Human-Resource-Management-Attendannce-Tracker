import { prisma } from "@/lib/prisma";
import { success, error, withRateLimit } from "@/lib/api-utils";
import { employeeSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/get-user";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = withRateLimit(request, 120, 60_000);
  if (rateLimited) return rateLimited.response;

  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { attendances: { orderBy: { date: "desc" }, take: 30 } },
    });
    if (!employee) return error("Employee not found", 404);
    return success({ employee });
  } catch {
    return error("Failed to fetch employee", 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = withRateLimit(request, 30, 60_000);
  if (rateLimited) return rateLimited.response;

  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const parsed = employeeSchema.safeParse(body);
    if (!parsed.success) {
      return error("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...parsed.data,
        dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
        dateOfEmployment: parsed.data.dateOfEmployment ? new Date(parsed.data.dateOfEmployment) : null,
      },
    });
    return success({ employee });
  } catch (err) {
    if (err instanceof Error && (err as Error & { statusCode?: number }).statusCode) {
      const authErr = err as Error & { statusCode: number };
      return error(authErr.message, authErr.statusCode);
    }
    return error("Failed to update employee", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = withRateLimit(request, 15, 60_000);
  if (rateLimited) return rateLimited.response;

  try {
    await requireAdmin(request);
    const { id } = await params;
    await prisma.employee.delete({ where: { id } });
    return success({ success: true });
  } catch (err) {
    if (err instanceof Error && (err as Error & { statusCode?: number }).statusCode) {
      const authErr = err as Error & { statusCode: number };
      return error(authErr.message, authErr.statusCode);
    }
    return error("Failed to delete employee", 500);
  }
}
