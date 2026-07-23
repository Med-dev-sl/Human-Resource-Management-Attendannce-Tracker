import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-utils";
import { getCached, setCache, generateCacheKey } from "@/lib/cache";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const cacheKey = generateCacheKey("dashboard:metrics", today.toISOString().slice(0, 10));
    const cached = await getCached<unknown>(cacheKey);
    if (cached) return success(cached, 200, 30);

    const [
      totalEmployees,
      todayAttendance,
      departmentStats,
      weekAttendance,
      hourlyRaw,
      schedule,
    ] = await Promise.all([
      prisma.employee.count({ where: { status: "active" } }),
      prisma.attendance.findMany({
        where: { date: { gte: today, lt: tomorrow } },
        select: { status: true, checkIn: true, employeeId: true },
      }),
      prisma.employee.groupBy({
        by: ["department"],
        where: { status: "active" },
        _count: { id: true },
      }),
      prisma.attendance.groupBy({
        by: ["date", "status"],
        where: { date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        _count: { id: true },
      }),
      prisma.attendance.findMany({
        where: {
          date: { gte: today, lt: tomorrow },
          checkIn: { not: null },
        },
        select: { checkIn: true, employeeId: true },
      }),
      prisma.workSchedule.findFirst(),
    ]);

    const present = todayAttendance.filter((a) => a.status === "present").length;
    const late = todayAttendance.filter((a) => a.status === "late").length;
    const onLeave = todayAttendance.filter((a) => a.status === "on-leave").length;
    const totalWithAttendance = todayAttendance.length;
    const absent = totalEmployees - totalWithAttendance;

    const checkedInToday = todayAttendance.filter((a) => a.checkIn);
    const avgMin = checkedInToday.length
      ? checkedInToday.reduce((s, a) => s + new Date(a.checkIn!).getHours() * 60 + new Date(a.checkIn!).getMinutes(), 0) / checkedInToday.length
      : 0;
    const avgH = Math.floor(avgMin / 60);
    const avgM = Math.floor(avgMin % 60);
    const avgCheckInTime = checkedInToday.length ? `${String(avgH).padStart(2, "0")}:${String(avgM).padStart(2, "0")}` : "--:--";

    const attendanceRate = totalEmployees ? Math.round(((present + late) / totalEmployees) * 100) : 0;

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const trendMap = new Map<string, { present: number; late: number; absent: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      trendMap.set(dayNames[d.getDay()], { present: 0, late: 0, absent: totalEmployees });
    }
    for (const a of weekAttendance) {
      const day = dayNames[new Date(a.date).getDay()];
      const entry = trendMap.get(day);
      if (entry) {
        const count = a._count.id;
        if (a.status === "present") { entry.present += count; entry.absent -= count; }
        else if (a.status === "late") { entry.late += count; entry.absent -= count; }
      }
    }
    const weeklyTrend = Array.from(trendMap.entries()).map(([date, v]) => ({ date, ...v }));

    const presentSet = new Set(todayAttendance.map((a) => a.employeeId));
    const departmentBreakdown = departmentStats.map((d) => ({
      department: d.department || "Unassigned",
      total: d._count.id,
      present: 0,
    }));
    for (const dept of departmentBreakdown) {
      dept.present = 0;
    }

    const hourDist: Record<string, number> = {};
    for (const a of hourlyRaw) {
      if (a.checkIn) {
        const h = String(new Date(a.checkIn).getHours()).padStart(2, "0");
        hourDist[h] = (hourDist[h] || 0) + 1;
      }
    }
    const hourlyDistribution = Array.from({ length: 10 }, (_, i) => i + 7).map((h) => {
      const key = String(h).padStart(2, "0");
      return { hour: `${key}:00`, count: hourDist[key] || 0 };
    });

    const result = {
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
    };

    await setCache(cacheKey, result, 30_000);
    return success(result, 200, 30);
  } catch (err) {
    return error("Failed to load metrics", 500);
  }
}
