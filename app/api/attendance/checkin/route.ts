import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    const lateThreshold = 8 * 60 + 30;
    const status = timeInMinutes > lateThreshold ? "late" : "present";

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
