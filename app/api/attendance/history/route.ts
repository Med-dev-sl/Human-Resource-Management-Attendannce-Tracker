import { prisma } from "@/lib/prisma";
import { success, error, withRateLimit } from "@/lib/api-utils";
import { parsePagination, paginate } from "@/lib/pagination";

export async function GET(request: Request) {
  const rateLimited = withRateLimit(request, 60, 60_000);
  if (rateLimited) return rateLimited.response;

  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const days = Math.min(parseInt(searchParams.get("days") || "30") || 30, 90);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const pag = parsePagination(searchParams);

    const where: Record<string, unknown> = { date: { gte: startDate } };
    if (employeeId) where.employeeId = employeeId;

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip: pag.skip,
        take: pag.limit,
        include: {
          employee: { select: { employeeId: true, firstName: true, lastName: true, title: true, department: true } },
        },
        orderBy: { date: "desc" },
      }),
      prisma.attendance.count({ where }),
    ]);

    return success(paginate(records, total, pag), 200, 30);
  } catch {
    return error("Failed to fetch history", 500);
  }
}
