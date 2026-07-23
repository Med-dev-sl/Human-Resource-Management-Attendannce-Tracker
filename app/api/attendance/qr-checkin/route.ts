import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/qr-token";
import { getWorkSchedule, getStatusForCheckIn, isWithinWorkHours } from "@/lib/schedule";

export async function POST(request: Request) {
  try {
    const { token, employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const schedule = await getWorkSchedule();

    if (!isWithinWorkHours(new Date(), schedule)) {
      return NextResponse.json({
        error: `Check-in/out is only available during work hours (${schedule.startTime} - ${schedule.endTime})`,
      }, { status: 403 });
    }

    if (token) {
      const valid = await isValidToken(token);
      if (!valid) {
        return NextResponse.json({ error: "QR code has expired or is invalid" }, { status: 401 });
      }
    }

    const employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { id: employeeId },
          { employeeId },
        ],
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existing && existing.checkOut) {
      return NextResponse.json({ error: "Already checked in and out today" }, { status: 409 });
    }

    if (existing && !existing.checkOut) {
      if (!isWithinWorkHours(new Date(), schedule)) {
        return NextResponse.json({ error: "Check-out is only available during work hours" }, { status: 403 });
      }

      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: { checkOut: new Date() },
      });
      return NextResponse.json({
        message: "Check-out recorded",
        action: "checkout",
        attendance: {
          ...updated,
          checkIn: updated.checkIn?.toISOString(),
          checkOut: updated.checkOut?.toISOString(),
        },
        employee: { name: `${employee.title} ${employee.firstName} ${employee.lastName}`, employeeId: employee.employeeId },
      });
    }

    const now = new Date();
    const status = getStatusForCheckIn(now, schedule);

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: now,
        checkIn: now,
        status,
      },
    });

    return NextResponse.json({
      message: "Check-in recorded",
      action: "checkin",
      attendance: {
        ...attendance,
        checkIn: attendance.checkIn?.toISOString(),
        checkOut: attendance.checkOut?.toISOString(),
      },
      employee: { name: `${employee.title} ${employee.firstName} ${employee.lastName}`, employeeId: employee.employeeId },
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process check-in";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
