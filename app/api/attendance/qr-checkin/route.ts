import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/qr-token";
import { getWorkSchedule, getStatusForCheckIn, isWithinWorkHours } from "@/lib/schedule";
import { success, error, withRateLimit } from "@/lib/api-utils";

export async function POST(request: Request) {
  const rateLimited = withRateLimit(request, 60, 60_000);
  if (rateLimited) return rateLimited.response;

  try {
    const { token, employeeId } = await request.json();
    if (!employeeId || typeof employeeId !== "string") {
      return error("Employee ID is required", 400);
    }

    const schedule = await getWorkSchedule();
    if (!isWithinWorkHours(new Date(), schedule)) {
      return error(`Check-in/out is only available during work hours (${schedule.startTime} - ${schedule.endTime})`, 403);
    }

    if (token && typeof token === "string") {
      const valid = await isValidToken(token);
      if (!valid) return error("QR code has expired or is invalid", 401);
    }

    const employee = await prisma.employee.findFirst({
      where: { OR: [{ id: employeeId }, { employeeId }] },
    });
    if (!employee) return error("Employee not found", 404);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: { employeeId: employee.id, date: { gte: startOfDay, lte: endOfDay } },
    });

    if (existing?.checkOut) {
      return error("Already checked in and out today", 409);
    }

    if (existing && !existing.checkOut) {
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: { checkOut: new Date() },
      });
      return success({
        message: "Check-out recorded",
        action: "checkout",
        attendance: { ...updated, checkIn: updated.checkIn?.toISOString(), checkOut: updated.checkOut?.toISOString() },
        employee: { name: `${employee.title} ${employee.firstName} ${employee.lastName}`, employeeId: employee.employeeId },
      });
    }

    const now = new Date();
    const status = getStatusForCheckIn(now, schedule);
    const attendance = await prisma.attendance.create({
      data: { employeeId: employee.id, date: now, checkIn: now, status },
    });

    return success({
      message: "Check-in recorded",
      action: "checkin",
      attendance: { ...attendance, checkIn: attendance.checkIn?.toISOString(), checkOut: attendance.checkOut?.toISOString() },
      employee: { name: `${employee.title} ${employee.firstName} ${employee.lastName}`, employeeId: employee.employeeId },
    }, 201);
  } catch {
    return error("Failed to process check-in", 500);
  }
}
