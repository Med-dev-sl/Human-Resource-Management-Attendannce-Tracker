"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar";

interface QRData {
  valid: boolean;
  qrSvg?: string;
  token?: string;
  generatedAt?: string;
  expiresAt?: string;
  currentTime?: string;
  date?: string;
  message?: string;
  workHours?: string;
}

interface Schedule {
  startTime: string;
  endTime: string;
}

export default function QRCheckinPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [qrDataUri, setQrDataUri] = useState("");
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [withinHours, setWithinHours] = useState(false);
  const [now, setNow] = useState(new Date());
  const router = useRouter();

  const tick = useCallback(() => setNow(new Date()), []);

  async function fetchQR() {
    try {
      const res = await fetch("/api/attendance/qr-token");
      const data = await res.json();
      setQrData(data);
      if (data.qrSvg) {
        setQrDataUri(`data:image/svg+xml,${encodeURIComponent(data.qrSvg)}`);
      } else {
        setQrDataUri("");
      }
    } catch {}
  }

  function checkHours(sched: Schedule) {
    const n = new Date();
    const nowMin = n.getHours() * 60 + n.getMinutes();
    const [sh, sm] = sched.startTime.split(":").map(Number);
    const [eh, em] = sched.endTime.split(":").map(Number);
    const active = nowMin >= sh * 60 + sm && nowMin < eh * 60 + em;
    setWithinHours(active);
  }

  useEffect(() => {
    setMounted(true);
    const clock = setInterval(tick, 1000);

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) { router.push("/"); return; }
        setUser(data.user);
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));

    fetch("/api/settings/schedule")
      .then((r) => r.json())
      .then((data) => {
        if (data.schedule) {
          setSchedule(data.schedule);
          checkHours(data.schedule);
        }
      });

    fetchQR();
    const qrRefresh = setInterval(fetchQR, 15000);
    const hoursCheck = setInterval(() => {
      if (schedule) checkHours(schedule);
    }, 5000);

    return () => { clearInterval(clock); clearInterval(qrRefresh); clearInterval(hoursCheck); };
  }, [tick, router, schedule]);

  useEffect(() => {
    if (schedule) checkHours(schedule);
  }, [now, schedule]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const showQR = withinHours && qrData?.qrSvg;
  const hoursStr = schedule ? `${schedule.startTime} - ${schedule.endTime}` : "";

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardSidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 min-h-screen">
        <div className="p-6 lg:p-10 pt-20 lg:pt-10">
          <div style={{
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            opacity: mounted ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1) 0.15s",
          }}>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">QR Check-In</h1>
              <p className="text-gray-500 mt-1">Display this screen at the staff entrance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
                <div className="w-full mb-6 text-center">
                  <div className="text-5xl font-bold text-[#1e3a5f] tabular-nums tracking-tight font-mono">
                    {timeStr}
                  </div>
                  <p className="text-sm text-gray-400 mt-1.5">{dateStr}</p>
                </div>

                <div className="relative bg-white rounded-2xl p-4 shadow-inner border border-gray-100 mb-4 min-h-[18rem] flex items-center justify-center w-full">
                  {showQR ? (
                    <img
                      src={qrDataUri}
                      alt="QR Code"
                      className="w-64 h-64 animate-[fadeIn_0.8s_ease-out]"
                    />
                  ) : (
                    <div className="text-center animate-[fadeIn_0.5s_ease-out]">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-gray-400">
                          <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" />
                          <rect x="3" y="16" width="5" height="5" /><line x1="21" y1="12" x2="21" y2="12" />
                          <line x1="12" y1="21" x2="12" y2="21" /><line x1="12" y1="12" x2="12" y2="12" />
                        </svg>
                      </div>
                      <p className="text-gray-400 font-medium text-sm">
                        {schedule
                          ? withinHours
                            ? "Preparing QR code..."
                            : `QR appears at ${schedule.startTime}`
                          : "Loading schedule..."
                        }
                      </p>
                      <p className="text-xs text-gray-300 mt-1">{hoursStr && `Work hours: ${hoursStr}`}</p>
                    </div>
                  )}
                </div>

                {withinHours ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium animate-[fadeIn_0.5s_ease-out]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    QR Active — Scan to check in/out
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {schedule
                      ? `QR activates at ${schedule.startTime}`
                      : "Outside work hours"
                    }
                  </div>
                )}

                {qrData?.expiresAt && withinHours && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl text-xs text-blue-700 animate-[fadeIn_0.5s_ease-out]">
                    QR expires at {new Date(qrData.expiresAt).toLocaleTimeString()}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                    Today&apos;s Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{timeStr.split(":")[0]}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">Current Hour</p>
                    </div>
                    <div className={`rounded-xl p-4 text-center ${withinHours ? "bg-emerald-50" : "bg-gray-50"}`}>
                      <p className={`text-2xl font-bold ${withinHours ? "text-emerald-600" : "text-gray-300"}`}>
                        {withinHours ? "Live" : "—"}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">QR Status</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-lg font-bold text-gray-900">{hoursStr.split(" - ")[0] || "—"}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">Start</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-lg font-bold text-gray-900">{hoursStr.split(" - ")[1] || "—"}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">End</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                    How it works
                  </h3>
                  <ol className="space-y-3 text-sm text-gray-600">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>QR code <strong>appears automatically</strong> at {schedule?.startTime || "start time"}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>Staff scan the QR with their phone camera</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>Enter Employee ID on their phone to check in/out</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <span>QR code <strong>disappears</strong> at {schedule?.endTime || "end time"}</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
