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

  const [step, setStep] = useState<"validating" | "form" | "success" | "error">("validating");
  const [employeeId, setEmployeeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{
    message: string; action: string; employee: { name: string; employeeId: string };
    attendance: { checkIn?: string; checkOut?: string; status?: string };
  } | null>(null);
  const [time, setTime] = useState(new Date());

  const tick = useCallback(() => setTime(new Date()), []);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    if (!token) {
      setStep("error");
      setMessage("Invalid QR code. Please scan again.");
      return;
    }
    setStep("form");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {step === "validating" && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/50 border border-white/50 p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a5f] mx-auto" />
            <p className="text-gray-500 mt-4 text-sm">Validating QR code...</p>
          </div>
        )}

        {step === "form" && (
          <div className="animate-[fadeInUp_0.5s_ease-out]">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/50 border border-white/50 p-8 space-y-6">
              <div className="text-center">
                <Logo className="w-28 h-auto mx-auto mb-4" />
                <div className="text-4xl font-bold text-[#1e3a5f] tabular-nums tracking-tight">
                  {time.toLocaleTimeString()}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {time.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                  QR Code Active
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    Scan QR code at any entrance to check in/out
                  </p>
                </div>

                {message && (
                  <p className="text-red-500 text-sm text-center">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !employeeId.trim()}
                  className="w-full py-3.5 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-lg shadow-[#1e3a5f]/20 hover:bg-[#162d4a] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {submitting ? "Processing..." : "Check In / Out"}
                </button>
              </form>
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
            <p className="text-xs text-gray-400">Please scan a valid QR code from the attendance terminal</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
