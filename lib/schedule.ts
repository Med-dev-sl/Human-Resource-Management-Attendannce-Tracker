import { prisma } from "./prisma";

export async function getWorkSchedule() {
  const schedule = await prisma.workSchedule.findFirst();
  return schedule || { startTime: "08:00", endTime: "17:00", lateMinutes: 30, absentMinutes: 120 };
}

export function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export function getStatusForCheckIn(
  checkInTime: Date,
  schedule: { startTime: string; lateMinutes: number; absentMinutes: number }
): string {
  const nowMinutes = checkInTime.getHours() * 60 + checkInTime.getMinutes();
  const startMinutes = parseTime(schedule.startTime);
  const lateThreshold = startMinutes + schedule.lateMinutes;

  if (nowMinutes > startMinutes + schedule.absentMinutes) return "absent";
  if (nowMinutes > lateThreshold) return "late";
  return "present";
}
