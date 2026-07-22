import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const days = Math.min(parseInt(searchParams.get("days") || "30"), 90);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const where: Record<string, unknown> = {
      date: { gte: startDate },
    };
    if (employeeId) where.employeeId = employeeId;

    const records = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
            title: true,
            department: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ records });
  } catch {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
