"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar";

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        if (!data.user) throw new Error("Not authenticated");
        setUser(data.user);
      })
      .catch(() => {
        router.push("/");
      })
      .finally(() => setLoading(false));
  }, [router]);

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

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardSidebar user={user} onLogout={handleLogout} />

      <main className="flex-1 min-h-screen">
        <div className="p-6 lg:p-10 pt-20 lg:pt-10">
          <div
            style={{
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              opacity: mounted ? 1 : 0,
              transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1) 0.2s",
            }}
          >
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(" ")[0] || "Admin"}
              </h1>
              <p className="text-gray-500 mt-1.5">Here&apos;s your HR overview for today</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { label: "Total Employees", value: "0", sub: "Registered staff", color: "from-blue-500 to-indigo-500" },
                { label: "Present Today", value: "0", sub: "Currently checked in", color: "from-emerald-500 to-teal-500" },
                { label: "Absent", value: "0", sub: "Not checked in today", color: "from-rose-500 to-pink-500" },
              ].map((card, i) => (
                <div
                  key={card.label}
                  style={{
                    transform: mounted ? "translateY(0)" : "translateY(30px)",
                    opacity: mounted ? 1 : 0,
                    transition: `all 0.6s cubic-bezier(0.32, 0.72, 0, 1) ${0.25 + i * 0.1}s`,
                  }}
                  className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500`} />
                  <div className="relative">
                    <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                    <p className="text-4xl font-bold text-gray-900 tracking-tight">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-2">{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
