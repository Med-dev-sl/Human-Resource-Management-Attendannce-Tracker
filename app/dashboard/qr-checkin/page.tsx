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

export default function QRCheckinPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());
  const [recent, setRecent] = useState<{ name: string; action: string; time: string }[]>([]);
  const router = useRouter();

  const tick = useCallback(() => setNow(new Date()), []);

  async function fetchQR() {
    try {
      const res = await fetch("/api/attendance/qr-token");
      const data = await res.json();
      setQrData(data);
      if (!data.valid) setError(data.message || "QR code not available");
      else setError("");
    } catch {
      setError("Failed to load QR code");
    }
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

    fetchQR();
    const qrRefresh = setInterval(fetchQR, 30000);

    return () => { clearInterval(clock); clearInterval(qrRefresh); };
  }, [tick, router]);

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
              <p className="text-gray-500 mt-1">Display this QR code at entrance for staff to scan</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
                <div className="w-full mb-6 text-center">
                  <div className="text-5xl font-bold text-[#1e3a5f] tabular-nums tracking-tight font-mono">
                    {timeStr}
                  </div>
                  <p className="text-sm text-gray-400 mt-1.5">{dateStr}</p>
                </div>

                <div className="relative bg-white rounded-2xl p-4 shadow-inner border border-gray-100 mb-4">
                  {qrData?.qrSvg ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: qrData.qrSvg }}
                      className="w-64 h-64"
                    />
                  ) : (
                    <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-xl">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f] mx-auto mb-3" />
                        <p className="text-xs text-gray-400">Generating QR...</p>
                      </div>
                    </div>
                  )}
                </div>

                {qrData?.valid ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active — scan to check in/out
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-sm font-medium mb-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      QR code inactive
                    </div>
                    <p className="text-xs text-gray-400">{qrData?.message || `Active during work hours (${qrData?.workHours || "08:00 - 17:00"})`}</p>
                  </div>
                )}

                <button
                  onClick={fetchQR}
                  className="mt-4 px-5 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium transition-all duration-300"
                >
                  Refresh QR Code
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                    Quick Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{timeStr.split(":")[0]}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">Current Hour</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{qrData?.valid ? "Active" : "—"}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">QR Status</p>
                    </div>
                  </div>
                  {qrData?.expiresAt && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
                      Expires at {new Date(qrData.expiresAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                    Instructions
                  </h3>
                  <ol className="space-y-3 text-sm text-gray-600">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>Display this screen at the staff entrance</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>Staff scan the QR code with their phone camera</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>They enter their Employee ID on the page that opens</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <span>System records check-in (before work hours) or check-out</span>
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
