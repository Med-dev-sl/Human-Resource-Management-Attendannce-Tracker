import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkSchedule, getStatusForCheckIn } from "@/lib/schedule";

export async function POST(request: Request) {
  try {
    const { employeeId } = await request.json();

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
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
        employeeId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 409 });
    }

    const schedule = await getWorkSchedule();
    const now = new Date();
    const status = getStatusForCheckIn(now, schedule);

    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: now,
        checkIn: now,
        status,
      },
    });

    return NextResponse.json({ attendance }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to check in" }, { status: 500 });
  }
}
