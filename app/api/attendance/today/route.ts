import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendances = await prisma.employee.findMany({
      where: { status: "active" },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        title: true,
        department: true,
        staffCategory: true,
        attendances: {
          where: {
            date: { gte: startOfDay, lte: endOfDay },
          },
          take: 1,
        },
      },
      orderBy: { lastName: "asc" },
    });

    const records = attendances.map((emp) => ({
      employeeId: emp.id,
      employeeCode: emp.employeeId,
      name: `${emp.title} ${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      staffCategory: emp.staffCategory,
      attendance: emp.attendances[0] || null,
    }));

    const summary = {
      total: records.length,
      present: records.filter((r) => r.attendance?.status === "present").length,
      late: records.filter((r) => r.attendance?.status === "late").length,
      absent: records.filter((r) => !r.attendance).length,
      halfDay: records.filter((r) => r.attendance?.status === "half-day").length,
      onLeave: records.filter((r) => r.attendance?.status === "on-leave").length,
    };

    return NextResponse.json({ records, summary });
  } catch {
    return NextResponse.json({ error: "Failed to fetch today's attendance" }, { status: 500 });
  }
}
