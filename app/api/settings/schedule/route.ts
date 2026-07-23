import { prisma } from "@/lib/prisma";
import { success, error, withRateLimit } from "@/lib/api-utils";
import { scheduleSchema } from "@/lib/validation";

export async function GET() {
  try {
    let schedule = await prisma.workSchedule.findFirst();
    if (!schedule) {
      schedule = await prisma.workSchedule.create({ data: {} });
    }
    return success({ schedule }, 200, 60);
  } catch {
    return error("Failed to fetch schedule", 500);
  }
}

export async function PUT(request: Request) {
  const rateLimited = withRateLimit(request, 30, 60_000);
  if (rateLimited) return rateLimited.response;

  try {
    const body = await request.json();
    const parsed = scheduleSchema.safeParse(body);
    if (!parsed.success) {
      return error("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const existing = await prisma.workSchedule.findFirst();

    if (existing) {
      const schedule = await prisma.workSchedule.update({
        where: { id: existing.id },
        data: {
          startTime: parsed.data.startTime,
          endTime: parsed.data.endTime,
          lateMinutes: parsed.data.lateMinutes,
          absentMinutes: parsed.data.absentMinutes,
          workDays: parsed.data.workDays || "MON-FRI",
        },
      });
      return success({ schedule });
    }

    const schedule = await prisma.workSchedule.create({
      data: {
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        lateMinutes: parsed.data.lateMinutes,
        absentMinutes: parsed.data.absentMinutes,
        workDays: parsed.data.workDays || "MON-FRI",
      },
    });
    return success({ schedule });
  } catch {
    return error("Failed to update schedule", 500);
  }
}
