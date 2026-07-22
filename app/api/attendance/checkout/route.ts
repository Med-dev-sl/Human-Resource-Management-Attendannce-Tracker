import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { employeeId } = await request.json();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: { gte: startOfDay, lte: endOfDay },
        checkOut: null,
      },
    });

    if (!attendance) {
      return NextResponse.json({ error: "No active check-in found" }, { status: 404 });
    }

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: new Date() },
    });

    return NextResponse.json({ attendance: updated });
  } catch {
    return NextResponse.json({ error: "Failed to check out" }, { status: 500 });
  }
}
