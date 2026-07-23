import { prisma } from "@/lib/prisma";
import { getWorkSchedule, getStatusForCheckIn } from "@/lib/schedule";
import { success, error, withRateLimit } from "@/lib/api-utils";

export async function POST(request: Request) {
  const rateLimited = withRateLimit(request, 60, 60_000);
  if (rateLimited) return rateLimited.response;

  try {
    const { employeeId } = await request.json();
    if (!employeeId || typeof employeeId !== "string") {
      return error("Employee ID is required", 400);
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return error("Employee not found", 404);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: { employeeId, date: { gte: startOfDay, lte: endOfDay } },
    });
    if (existing) return error("Already checked in today", 409);

    const schedule = await getWorkSchedule();
    const now = new Date();
    const status = getStatusForCheckIn(now, schedule);

    const attendance = await prisma.attendance.create({
      data: { employeeId, date: now, checkIn: now, status },
    });

    return success({ attendance }, 201);
  } catch {
    return error("Failed to check in", 500);
  }
}
