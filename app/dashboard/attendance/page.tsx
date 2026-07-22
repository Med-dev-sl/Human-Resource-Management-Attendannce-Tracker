"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar";

interface AttendanceRecord {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  staffCategory: string;
  attendance: {
    id: string;
    checkIn: string;
    checkOut: string | null;
    status: string;
    date: string;
  } | null;
}

interface Summary {
  total: number;
  present: number;
  late: number;
  absent: number;
  halfDay: number;
  onLeave: number;
}

export default function AttendancePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const router = useRouter();

  async function fetchData() {
    try {
      const auth = await fetch("/api/auth/me").then((r) => r.json());
      if (!auth.user) { router.push("/"); return; }
      setUser(auth.user);
      const res = await fetch("/api/attendance/today");
      const data = await res.json();
      setRecords(data.records || []);
      setSummary(data.summary || null);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  async function handleCheckIn(employeeId: string) {
    setCheckingId(employeeId);
    try {
      await fetch("/api/attendance/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });
      await fetchData();
    } catch {
      alert("Failed to check in");
    } finally {
      setCheckingId(null);
    }
  }

  async function handleCheckOut(employeeId: string) {
    setCheckingId(employeeId);
    try {
      await fetch("/api/attendance/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });
      await fetchData();
    } catch {
      alert("Failed to check out");
    } finally {
      setCheckingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.employeeCode.toLowerCase().includes(q) || (r.department || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "absent" && !r.attendance) ||
      (statusFilter !== "absent" && r.attendance?.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardSidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 lg:ml-72 min-h-screen">
        <div className="p-6 lg:p-10 pt-20 lg:pt-10">
          <div style={{
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            opacity: mounted ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1) 0.15s",
          }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
              <p className="text-gray-500 mt-1">{today}</p>
            </div>

            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {[
                  { label: "Total", value: summary.total, color: "text-gray-900", bg: "bg-gray-50" },
                  { label: "Present", value: summary.present, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Late", value: summary.late, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Absent", value: summary.absent, color: "text-red-600", bg: "bg-red-50" },
                  { label: "Half Day", value: summary.halfDay, color: "text-orange-600", bg: "bg-orange-50" },
                  { label: "On Leave", value: summary.onLeave, color: "text-blue-600", bg: "bg-blue-50" },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    style={{
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? "translateY(0)" : "translateY(15px)",
                      transition: `all 0.5s cubic-bezier(0.32, 0.72, 0, 1) ${0.15 + i * 0.06}s`,
                    }}
                    className={`${s.bg} rounded-xl p-4 text-center`}
                  >
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, ID, department..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat pr-10"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="half-day">Half Day</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>

              {filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-gray-300 mx-auto mb-3">
                    <path d="M3 12h3l2-5 3 10 3-8 2 5h3" /><path d="M3 3v18h18" />
                  </svg>
                  <p className="text-gray-400 text-sm">No attendance records found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filtered.map((r, i) => {
                    const isCheckedIn = !!r.attendance;
                    const isCheckedOut = r.attendance?.checkOut;
                    return (
                      <div
                        key={r.employeeId}
                        style={{
                          opacity: mounted ? 1 : 0,
                          transform: mounted ? "translateY(0)" : "translateY(10px)",
                          transition: `all 0.4s cubic-bezier(0.32, 0.72, 0, 1) ${i * 0.03}s`,
                        }}
                        className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50/50 transition-colors duration-200"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm shrink-0">
                          {r.name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{r.employeeCode} &middot; {r.department || "—"}</p>
                        </div>
                        <div className="hidden sm:block text-[10px] font-semibold uppercase tracking-wider">
                          {!isCheckedIn ? (
                            <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600">Absent</span>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-lg ${
                              r.attendance!.status === "present" ? "bg-emerald-50 text-emerald-600" :
                              r.attendance!.status === "late" ? "bg-amber-50 text-amber-600" :
                              "bg-gray-50 text-gray-500"
                            }`}>{r.attendance!.status}</span>
                          )}
                        </div>
                        <div className="flex gap-1.5">
                          {!isCheckedIn ? (
                            <button
                              onClick={() => handleCheckIn(r.employeeId)}
                              disabled={checkingId === r.employeeId}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[11px] font-semibold transition-all duration-200 disabled:opacity-50 whitespace-nowrap"
                            >
                              {checkingId === r.employeeId ? "..." : "Check In"}
                            </button>
                          ) : !isCheckedOut ? (
                            <button
                              onClick={() => handleCheckOut(r.employeeId)}
                              disabled={checkingId === r.employeeId}
                              className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 text-[11px] font-semibold transition-all duration-200 disabled:opacity-50 whitespace-nowrap"
                            >
                              {checkingId === r.employeeId ? "..." : "Check Out"}
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-400 text-[11px] font-semibold whitespace-nowrap">
                              Done
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
