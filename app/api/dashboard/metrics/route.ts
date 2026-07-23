import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [totalEmployees, todayAttendance, employees, weekAttendance, hourlyRaw, schedule] = await Promise.all([
      prisma.employee.count({ where: { status: "active" } }),
      prisma.attendance.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
      prisma.employee.findMany({ where: { status: "active" }, select: { id: true, department: true } }),
      prisma.attendance.findMany({
        where: { date: { gte: sevenDaysAgo, lte: endOfDay } },
        orderBy: { date: "asc" },
      }),
      prisma.attendance.findMany({
        where: { date: { gte: startOfDay, lte: endOfDay } },
        select: { checkIn: true },
      }),
      prisma.workSchedule.findFirst(),
    ]);

    const present = todayAttendance.filter((a) => a.status === "present").length;
    const late = todayAttendance.filter((a) => a.status === "late").length;
    const absent = totalEmployees - todayAttendance.length;
    const onLeave = todayAttendance.filter((a) => a.status === "on-leave").length;

    const withCheckIn = todayAttendance.filter((a) => a.checkIn);
    const avgMinutes = withCheckIn.length
      ? withCheckIn.reduce((sum, a) => {
          const d = new Date(a.checkIn!);
          return sum + d.getHours() * 60 + d.getMinutes();
        }, 0) / withCheckIn.length
      : 0;
    const avgH = Math.floor(avgMinutes / 60);
    const avgM = Math.floor(avgMinutes % 60);
    const avgCheckInTime = withCheckIn.length ? `${String(avgH).padStart(2, "0")}:${String(avgM).padStart(2, "0")}` : "--:--";

    const attendanceRate = totalEmployees ? Math.round(((present + late) / totalEmployees) * 100) : 0;

    const trendMap = new Map<string, { present: number; late: number; absent: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const dayTotal = employees.length;
      trendMap.set(key, { present: 0, late: 0, absent: dayTotal });
    }
    for (const a of weekAttendance) {
      const key = new Date(a.date).toISOString().slice(0, 10);
      const entry = trendMap.get(key);
      if (entry) {
        if (a.status === "present") { entry.present++; entry.absent--; }
        else if (a.status === "late") { entry.late++; entry.absent--; }
      }
    }
    const weeklyTrend = Array.from(trendMap.entries()).map(([date, v]) => ({
      date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      ...v,
    }));

    const deptMap = new Map<string, { total: number; present: number }>();
    for (const emp of employees) {
      const dept = emp.department || "Unassigned";
      if (!deptMap.has(dept)) deptMap.set(dept, { total: 0, present: 0 });
      deptMap.get(dept)!.total++;
    }
    const presentIds = new Set(todayAttendance.map((a) => a.employeeId));
    for (const emp of employees) {
      if (presentIds.has(emp.id)) {
        const dept = emp.department || "Unassigned";
        deptMap.get(dept)!.present++;
      }
    }
    const departmentBreakdown = Array.from(deptMap.entries()).map(([department, v]) => ({ department, ...v }));

    const hourBuckets: Record<string, number> = {};
    for (const a of hourlyRaw) {
      if (a.checkIn) {
        const h = String(new Date(a.checkIn).getHours()).padStart(2, "0");
        hourBuckets[h] = (hourBuckets[h] || 0) + 1;
      }
    }
    const hourlyDistribution = Array.from({ length: 9 }, (_, i) => i + 7).map((h) => {
      const key = String(h).padStart(2, "0");
      return { hour: `${key}:00`, count: hourBuckets[key] || 0 };
    });

    return NextResponse.json({
      totalEmployees,
      presentToday: present,
      lateToday: late,
      absentToday: absent,
      avgCheckInTime,
      attendanceRate,
      onLeave,
      weeklyTrend,
      departmentBreakdown,
      hourlyDistribution,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load metrics" }, { status: 500 });
  }
}
