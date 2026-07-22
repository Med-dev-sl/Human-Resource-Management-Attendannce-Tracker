"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar";

interface Employee {
  id: string;
  employeeId: string;
  title: string;
  firstName: string;
  lastName: string;
  staffCategory: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

export default function EmployeeList() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/employees").then((r) => r.json()),
    ]).then(([auth, data]) => {
      if (!auth.user) { router.push("/"); return; }
      setUser(auth.user);
      setEmployees(data.employees || []);
    }).catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
    if (res.ok) setEmployees((prev) => prev.filter((e) => e.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      `${e.title} ${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === "all" || e.staffCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: employees.length,
    academic: employees.filter((e) => e.staffCategory === "academic").length,
    administrative: employees.filter((e) => e.staffCategory !== "academic").length,
  };

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
                <p className="text-gray-500 mt-1">{stats.total} registered staff</p>
              </div>
              <button
                onClick={() => router.push("/dashboard/employees/register")}
                className="px-5 py-2.5 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-lg shadow-[#1e3a5f]/20 hover:bg-[#162d4a] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm whitespace-nowrap"
              >
                + Register Employee
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Staff", value: stats.total, color: "from-blue-500 to-indigo-500" },
                { label: "Academic", value: stats.academic, color: "from-emerald-500 to-teal-500" },
                { label: "Administrative", value: stats.administrative, color: "from-amber-500 to-orange-500" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    transform: mounted ? "translateY(0)" : "translateY(20px)",
                    opacity: mounted ? 1 : 0,
                    transition: `all 0.6s cubic-bezier(0.32, 0.72, 0, 1) ${0.2 + i * 0.08}s`,
                  }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                >
                  <p className="text-sm font-medium text-gray-500">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 bg-gradient-to-br ${s.color} bg-clip-text text-transparent`}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

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
                    placeholder="Search by name, ID, email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat pr-10"
                >
                  <option value="all">All Categories</option>
                  <option value="academic">Academic</option>
                  <option value="administrative">Administrative</option>
                  <option value="technical">Technical</option>
                  <option value="support">Support</option>
                </select>
              </div>

              {filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-gray-300 mx-auto mb-3">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <p className="text-gray-400 text-sm">{search ? "No employees match your search" : "No employees registered yet"}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filtered.map((emp, i) => (
                    <div
                      key={emp.id}
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateY(0)" : "translateY(10px)",
                        transition: `all 0.4s cubic-bezier(0.32, 0.72, 0, 1) ${i * 0.03}s`,
                      }}
                      className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer group"
                      onClick={() => router.push(`/dashboard/employees/${emp.id}`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm shrink-0">
                        {`${emp.firstName[0]}${emp.lastName[0]}`}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#1e3a5f] transition-colors">
                          {emp.title} {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {emp.employeeId} &middot; {emp.designation}
                        </p>
                      </div>
                      <div className="hidden sm:block text-xs text-gray-400 min-w-[120px] text-right">
                        {emp.department || "—"}
                      </div>
                      <div className="hidden md:block">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${
                          emp.staffCategory === "academic"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {emp.staffCategory}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`); }}
                        className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
