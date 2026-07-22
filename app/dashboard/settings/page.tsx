"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar";

interface Schedule {
  id: string;
  startTime: string;
  endTime: string;
  lateMinutes: number;
  absentMinutes: number;
  workDays: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [form, setForm] = useState<Schedule>({
    id: "",
    startTime: "08:00",
    endTime: "17:00",
    lateMinutes: 30,
    absentMinutes: 120,
    workDays: "MON-FRI",
  });

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/settings/schedule").then((r) => r.json()),
    ])
      .then(([auth, data]) => {
        if (!auth.user) { router.push("/"); return; }
        setUser(auth.user);
        if (data.schedule) setForm(data.schedule);
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/settings/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Work schedule updated");
      setForm(data.schedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardSidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 min-h-screen">
        <div className="p-6 lg:p-10 pt-20 lg:pt-10 max-w-3xl">
          <div style={{
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            opacity: mounted ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1) 0.15s",
          }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-500 mt-1">Configure work schedule and attendance rules</p>
            </div>

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm animate-[fadeIn_0.3s_ease-out]">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-[fadeIn_0.3s_ease-out]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                  Work Hours
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => update("startTime", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Official work start time</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => update("endTime", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Official work end time</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                  Attendance Rules
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Late Threshold (minutes)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={240}
                      value={form.lateMinutes}
                      onChange={(e) => update("lateMinutes", parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Check-in after start time + this = late
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Absent Threshold (minutes)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={480}
                      value={form.absentMinutes}
                      onChange={(e) => update("absentMinutes", parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Check-in after start time + this = absent
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500 mt-0.5 shrink-0">
                      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">How attendance rules work</p>
                      <ul className="space-y-1 text-blue-600">
                        <li>• Check-in before <strong>{form.startTime}</strong> → <strong>Present</strong></li>
                        <li>• Check-in between <strong>{formatPreview(form.startTime, form.lateMinutes)}</strong> and <strong>{formatPreview(form.startTime, form.absentMinutes)}</strong> → <strong>Late</strong></li>
                        <li>• Check-in after <strong>{formatPreview(form.startTime, form.absentMinutes)}</strong> → <strong>Absent</strong></li>
                        <li>• No check-in → <strong>Absent</strong> (marked at end of day)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pb-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-lg shadow-[#1e3a5f]/20 hover:bg-[#162d4a] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 text-sm"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function formatPreview(time: string, addMinutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + addMinutes;
  const hours = Math.floor(total / 60) % 24;
  const mins = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}
