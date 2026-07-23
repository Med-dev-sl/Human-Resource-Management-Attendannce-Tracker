import { prisma } from "@/lib/prisma";
import { success, error, withRateLimit } from "@/lib/api-utils";
import { getCached, setCache, generateCacheKey } from "@/lib/cache";

export async function GET(request: Request) {
  const rateLimitResult = withRateLimit(request, 120, 60_000);
  if (rateLimitResult) return rateLimitResult.response;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const cacheKey = generateCacheKey("attendance:today", today.toISOString().slice(0, 10));
    const cached = await getCached<unknown>(cacheKey);
    if (cached) return success(cached, 200, 15);

    const [activeEmployees, todayAttendances] = await Promise.all([
      prisma.employee.findMany({
        where: { status: "active" },
        select: { id: true, employeeId: true, firstName: true, lastName: true, title: true, department: true, staffCategory: true },
        orderBy: { lastName: "asc" },
      }),
      prisma.attendance.findMany({
        where: { date: { gte: today, lt: tomorrow } },
        select: { id: true, employeeId: true, checkIn: true, checkOut: true, status: true, date: true },
      }),
    ]);

    const attendanceMap = new Map(todayAttendances.map((a) => [a.employeeId, a]));

    const records = activeEmployees.map((emp) => ({
      employeeId: emp.id,
      employeeCode: emp.employeeId,
      name: `${emp.title} ${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      staffCategory: emp.staffCategory,
      attendance: attendanceMap.get(emp.id) || null,
    }));

    const summary = {
      total: records.length,
      present: records.filter((r) => r.attendance?.status === "present").length,
      late: records.filter((r) => r.attendance?.status === "late").length,
      absent: records.filter((r) => !r.attendance).length,
      halfDay: records.filter((r) => r.attendance?.status === "half-day").length,
      onLeave: records.filter((r) => r.attendance?.status === "on-leave").length,
    };

    const result = { records, summary };
    await setCache(cacheKey, result, 15_000);
    return success(result, 200, 15);
  } catch (err) {
    return error("Failed to fetch today's attendance", 500);
  }
}
