import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let schedule = await prisma.workSchedule.findFirst();
    if (!schedule) {
      schedule = await prisma.workSchedule.create({ data: {} });
    }
    return NextResponse.json({ schedule });
  } catch {
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let schedule = await prisma.workSchedule.findFirst();
    if (schedule) {
      schedule = await prisma.workSchedule.update({
        where: { id: schedule.id },
        data: {
          startTime: body.startTime,
          endTime: body.endTime,
          lateMinutes: parseInt(body.lateMinutes) || 30,
          absentMinutes: parseInt(body.absentMinutes) || 120,
          workDays: body.workDays || "MON-FRI",
        },
      });
    } else {
      schedule = await prisma.workSchedule.create({
        data: {
          startTime: body.startTime || "08:00",
          endTime: body.endTime || "17:00",
          lateMinutes: parseInt(body.lateMinutes) || 30,
          absentMinutes: parseInt(body.absentMinutes) || 120,
          workDays: body.workDays || "MON-FRI",
        },
      });
    }
    return NextResponse.json({ schedule });
  } catch {
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}
