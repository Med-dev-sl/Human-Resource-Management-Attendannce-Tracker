"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useAnimatedMount } from "@/lib/hooks/useAnimatedMount";
import type { DashboardMetrics } from "@/lib/types";

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1"];

interface User {
  name: string; email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const mounted = useAnimatedMount();
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/dashboard/metrics").then((r) => r.json()),
    ]).then(([auth, data]) => {
      if (!auth.user) { router.push("/"); return; }
      setUser(auth.user);
      setMetrics(data);
    }).catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Employees", value: metrics?.totalEmployees ?? 0, sub: "Active staff", color: "from-blue-500 to-indigo-500", icon: "users" },
    { label: "Present Today", value: metrics?.presentToday ?? 0, sub: `${metrics?.attendanceRate ?? 0}% attendance rate`, color: "from-emerald-500 to-teal-500", icon: "check" },
    { label: "Late Today", value: metrics?.lateToday ?? 0, sub: "Arrived after start time", color: "from-amber-500 to-orange-500", icon: "clock" },
    { label: "Absent Today", value: metrics?.absentToday ?? 0, sub: "Not checked in", color: "from-rose-500 to-pink-500", icon: "x" },
  ];

  const pieData = [
    { name: "Present", value: metrics?.presentToday ?? 0 },
    { name: "Late", value: metrics?.lateToday ?? 0 },
    { name: "Absent", value: (metrics?.absentToday ?? 0) - (metrics?.onLeave ?? 0) },
    { name: "On Leave", value: metrics?.onLeave ?? 0 },
  ].filter((d) => d.value > 0);

  const animProps = (delay: number) => ({
    style: {
      transform: mounted ? "translateY(0)" : "translateY(24px)",
      opacity: mounted ? 1 : 0,
      transition: `all 0.6s cubic-bezier(0.32, 0.72, 0, 1) ${delay}s`,
    },
  });

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardSidebar user={user} onLogout={logout} />
      <main className="flex-1 min-h-screen">
        <div className="p-6 lg:p-10 pt-20 lg:pt-10">
          <div {...animProps(0)}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(" ")[0] || "Admin"}
              </h1>
              <p className="text-gray-500 mt-1.5">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((card, i) => (
                <div key={card.label} {...animProps(0.15 + i * 0.08)}
                  className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500`} />
                  <div className="relative">
                    <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 tracking-tight">{card.value}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5">{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6" {...animProps(0.5)}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Weekly Trend</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics?.weeklyTrend ?? []} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      />
                      <Bar dataKey="present" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="late" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" {...animProps(0.55)}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Today&apos;s Distribution</h3>
                <div className="h-72 flex flex-col items-center justify-center">
                  {pieData.length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="flex flex-wrap gap-4 mt-2 justify-center">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-500">{d.name}</span>
                        <span className="font-medium text-gray-700">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" {...animProps(0.6)}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Hourly Check-In Distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics?.hourlyDistribution ?? []} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" {...animProps(0.65)}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Department Breakdown</h3>
                <div className="space-y-3">
                  {metrics?.departmentBreakdown?.map((dept, i) => (
                    <div key={dept.department} className="flex items-center gap-3" {...animProps(0.7 + i * 0.05)}>
                      <span className="text-xs text-gray-500 w-28 truncate shrink-0">{dept.department}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                          style={{ width: `${dept.total ? (dept.present / dept.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-16 text-right shrink-0">{dept.present}/{dept.total}</span>
                    </div>
                  ))}
                  {(!metrics?.departmentBreakdown || metrics.departmentBreakdown.length === 0) && (
                    <p className="text-sm text-gray-400 text-center py-4">No department data</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
