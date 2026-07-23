import crypto from "node:crypto";
import { getWorkSchedule, parseTime } from "./schedule";

const SECRET = process.env.QR_SECRET || "hrma-qr-secret-default";

function getDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function generateToken(date: Date): string {
  const data = `${getDateStr(date)}:${SECRET}`;
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 16);
}

export async function isValidToken(token: string): Promise<boolean> {
  const now = new Date();
  const expected = generateToken(now);
  if (token !== expected) return false;

  const schedule = await getWorkSchedule();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseTime(schedule.startTime);
  const endMinutes = parseTime(schedule.endTime);

  return nowMinutes >= startMinutes && nowMinutes < endMinutes;
}

export function getTokenExpiry(date: Date): Date {
  const expiry = new Date(date);
  expiry.setHours(23, 59, 59, 999);
  return expiry;
}
