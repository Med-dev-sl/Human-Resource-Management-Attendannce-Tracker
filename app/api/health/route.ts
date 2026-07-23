import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-utils";

export async function GET() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;

    const [employeeCount, attendanceCount, userCount] = await Promise.all([
      prisma.employee.count(),
      prisma.attendance.count(),
      prisma.user.count(),
    ]);

    return success({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: { connected: true, latencyMs: dbLatency },
      counts: { employees: employeeCount, attendances: attendanceCount, users: userCount },
      environment: process.env.NODE_ENV || "development",
    }, 200, 10);
  } catch (err) {
    return error("Database connection failed", 503);
  }
}
