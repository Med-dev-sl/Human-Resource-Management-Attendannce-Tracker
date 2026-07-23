import QRCode from "qrcode";
import { generateToken } from "@/lib/qr-token";
import { getWorkSchedule, parseTime } from "@/lib/schedule";
import { success, error, withRateLimit } from "@/lib/api-utils";

export async function GET(request: Request) {
  const rateLimited = withRateLimit(request, 30, 60_000);
  if (rateLimited) return rateLimited.response;

  try {
    const now = new Date();
    const schedule = await getWorkSchedule();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = parseTime(schedule.startTime);
    const endMinutes = parseTime(schedule.endTime);
    const isWithinHours = nowMinutes >= startMinutes && nowMinutes < endMinutes;

    if (!isWithinHours) {
      return success({
        valid: false,
        message: `QR code is only active during work hours (${schedule.startTime} - ${schedule.endTime})`,
        currentTime: now.toLocaleTimeString(),
        workHours: `${schedule.startTime} - ${schedule.endTime}`,
      });
    }

    const token = generateToken(now);
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const checkinUrl = `${baseUrl}/checkin?token=${token}`;

    const qrSvg = await QRCode.toString(checkinUrl, {
      type: "svg", margin: 2, width: 300,
      color: { dark: "#0f1a2e", light: "#ffffff" },
    });

    const expiresAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(endMinutes / 60), endMinutes % 60).toISOString();

    return success({
      valid: true, token, url: checkinUrl, qrSvg,
      generatedAt: now.toISOString(), expiresAt,
      currentTime: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
    }, 200, 5);
  } catch {
    return error("Failed to generate QR code", 500);
  }
}
