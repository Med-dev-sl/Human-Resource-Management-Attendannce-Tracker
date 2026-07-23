"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/app/components/Logo";

export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a5f]" />
      </div>
    }>
      <CheckinContent />
    </Suspense>
  );
}

function CheckinContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState<"form" | "success" | "error">("form");
  const [employeeId, setEmployeeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [withinHours, setWithinHours] = useState(true);
  const [schedule, setSchedule] = useState<{ startTime: string; endTime: string } | null>(null);
  const [qrSvg, setQrSvg] = useState("");
  const [result, setResult] = useState<{
    message: string; action: string; employee: { name: string; employeeId: string };
    attendance: { checkIn?: string; checkOut?: string; status?: string };
  } | null>(null);
  const [time, setTime] = useState(new Date());

  const tick = useCallback(() => setTime(new Date()), []);

  useEffect(() => {
    const interval = setInterval(tick, 1000);

    function loadData() {
      fetch("/api/settings/schedule")
        .then((r) => r.json())
        .then((data) => {
          if (data.schedule) {
            setSchedule(data.schedule);
            const n = new Date();
            const nowMin = n.getHours() * 60 + n.getMinutes();
            const [sh, sm] = data.schedule.startTime.split(":").map(Number);
            const [eh, em] = data.schedule.endTime.split(":").map(Number);
            setWithinHours(nowMin >= sh * 60 + sm && nowMin < eh * 60 + em);
          }
        });
    }

    function fetchQr() {
      fetch("/api/attendance/qr-token")
        .then((r) => r.json())
        .then((data) => {
          if (data.qrSvg && data.valid) setQrSvg(data.qrSvg);
          else if (!data.valid) setQrSvg("");
        });
    }

    loadData();
    fetchQr();
    const refresh = setInterval(() => {
      loadData();
      fetchQr();
    }, 10000);

    return () => { clearInterval(interval); clearInterval(refresh); };
  }, [tick]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/attendance/qr-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, employeeId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Check-in failed");
        return;
      }

      setResult(data);
      setStep("success");
    } catch {
      setMessage("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const hrs = schedule ? `${schedule.startTime} - ${schedule.endTime}` : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 animate-[fadeInUp_0.5s_ease-out]">
          <Logo className="w-28 h-auto mx-auto" />
        </div>

        {step === "form" && (
          <div className="animate-[fadeInUp_0.5s_ease-out]">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/50 border border-white/50 p-8 space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#1e3a5f] tabular-nums tracking-tight font-mono">
                  {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                </div>
                <p className="text-sm text-gray-500 mt-1.5">
                  {time.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
                <div className="mt-3">
                  {withinHours ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      System Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {schedule ? `Opens at ${schedule.startTime}` : "Outside work hours"}
                    </span>
                  )}
                </div>
                {hrs && <p className="text-[11px] text-gray-400 mt-2">Work hours: {hrs}</p>}
              </div>

              {withinHours && qrSvg && (
                <div className="flex justify-center animate-[fadeIn_0.6s_ease-out]">
                  <div className="bg-white rounded-xl p-3 shadow-inner border border-gray-100">
                    <div dangerouslySetInnerHTML={{ __html: qrSvg }} className="w-40 h-40" />
                  </div>
                </div>
              )}

              {withinHours && (
                <form onSubmit={handleSubmit} className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Staff Attendance ID
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="Enter your Employee ID (e.g. FAC/2026/001)"
                      required
                      autoFocus
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-center text-lg font-medium tracking-wider"
                    />
                    <p className="text-xs text-gray-400 mt-1.5 text-center">
                      Enter your staff ID to check in or out
                    </p>
                  </div>

                  {message && <p className="text-red-500 text-sm text-center">{message}</p>}

                  <button
                    type="submit"
                    disabled={submitting || !employeeId.trim()}
                    className="w-full py-3.5 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-lg shadow-[#1e3a5f]/20 hover:bg-[#162d4a] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {submitting ? "Processing..." : "Check In / Out"}
                  </button>
                </form>
              )}

              {!withinHours && (
                <div className="text-center py-6 animate-[fadeIn_0.5s_ease-out]">
                  <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-amber-500">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">
                    Check-in is only available during work hours
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {schedule ? `${schedule.startTime} — ${schedule.endTime}` : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === "success" && result && (
          <div className="animate-[fadeInUp_0.5s_ease-out]">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/50 border border-white/50 p-8 text-center space-y-5">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                result.action === "checkin" ? "bg-emerald-100" : "bg-amber-100"
              }`}>
                {result.action === "checkin" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9 text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9 text-amber-600">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {result.action === "checkin" ? "Check-In Successful" : "Check-Out Successful"}
                </h2>
                <p className="text-gray-500 mt-1">{result.employee.name}</p>
                <p className="text-xs text-gray-400">{result.employee.employeeId}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                {result.attendance.checkIn && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Check-in</span>
                    <span className="text-gray-900 font-medium">{new Date(result.attendance.checkIn).toLocaleTimeString()}</span>
                  </div>
                )}
                {result.attendance.checkOut && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Check-out</span>
                    <span className="text-gray-900 font-medium">{new Date(result.attendance.checkOut).toLocaleTimeString()}</span>
                  </div>
                )}
                {result.attendance.status && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium capitalize ${
                      result.attendance.status === "present" ? "text-emerald-600" :
                      result.attendance.status === "late" ? "text-amber-600" : "text-gray-900"
                    }`}>{result.attendance.status}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="text-gray-900 font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-sm text-gray-400">{result.message}</p>

              <button
                onClick={() => { setStep("form"); setEmployeeId(""); setResult(null); setMessage(""); }}
                className="px-6 py-2.5 rounded-xl bg-[#1e3a5f] text-white font-semibold hover:bg-[#162d4a] transition-all duration-300 text-sm"
              >
                Check Another
              </button>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/50 border border-white/50 p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-red-500">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <p className="text-gray-900 font-semibold">{message}</p>
            <p className="text-xs text-gray-400">Please try again during work hours</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
