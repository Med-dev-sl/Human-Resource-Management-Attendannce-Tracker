import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { generateToken, isValidToken } from "@/lib/qr-token";
import { getWorkSchedule, parseTime } from "@/lib/schedule";

export async function GET() {
  try {
    const now = new Date();
    const schedule = await getWorkSchedule();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = parseTime(schedule.startTime);
    const endMinutes = parseTime(schedule.endTime);

    const isWithinHours = nowMinutes >= startMinutes && nowMinutes < endMinutes;
    const valid = isWithinHours;

    if (!valid) {
      return NextResponse.json({
        valid: false,
        message: `QR code is only active during work hours (${schedule.startTime} - ${schedule.endTime})`,
        currentTime: now.toLocaleTimeString(),
        workHours: `${schedule.startTime} - ${schedule.endTime}`,
      });
    }

    const token = generateToken(now);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const checkinUrl = `${baseUrl}/checkin?token=${token}`;

    const qrSvg = await QRCode.toString(checkinUrl, {
      type: "svg",
      margin: 2,
      width: 300,
      color: { dark: "#0f1a2e", light: "#ffffff" },
    });

    return NextResponse.json({
      valid: true,
      token,
      url: checkinUrl,
      qrSvg,
      generatedAt: now.toISOString(),
      expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), endMinutes / 60, endMinutes % 60).toISOString(),
      currentTime: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
