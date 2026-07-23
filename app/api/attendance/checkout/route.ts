import { prisma } from "@/lib/prisma";
import { success, error, withRateLimit } from "@/lib/api-utils";

export async function POST(request: Request) {
  const rateLimited = withRateLimit(request, 60, 60_000);
  if (rateLimited) return rateLimited.response;

  try {
    const { employeeId } = await request.json();
    if (!employeeId || typeof employeeId !== "string") {
      return error("Employee ID is required", 400);
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await prisma.attendance.findFirst({
      where: { employeeId, date: { gte: startOfDay, lte: endOfDay }, checkOut: null },
    });
    if (!attendance) return error("No active check-in found", 404);

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: new Date() },
    });

    return success({ attendance: updated });
  } catch {
    return error("Failed to check out", 500);
  }
}
