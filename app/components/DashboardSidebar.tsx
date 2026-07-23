"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Employees",
    href: "/dashboard/employees",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Attendance",
    href: "/dashboard/attendance",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 12h3l2-5 3 10 3-8 2 5h3" />
        <path d="M3 3v18h18" />
      </svg>
    ),
  },
  {
    label: "QR Check-In",
    href: "/dashboard/qr-checkin",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="5" height="5" />
        <rect x="16" y="3" width="5" height="5" />
        <rect x="3" y="16" width="5" height="5" />
        <rect x="12" y="12" width="3" height="3" />
        <line x1="21" y1="12" x2="21" y2="12" /><line x1="12" y1="21" x2="12" y2="21" />
        <line x1="12" y1="16" x2="12" y2="12" /><line x1="16" y1="12" x2="12" y2="12" />
        <line x1="3" y1="12" x2="3" y2="12" /><line x1="12" y1="3" x2="12" y2="3" />
        <line x1="21" y1="16" x2="21" y2="21" /><line x1="16" y1="21" x2="21" y2="21" />
        <line x1="3" y1="12" x2="3" y2="12" /><line x1="12" y1="3" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

interface DashboardSidebarProps {
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

export default function DashboardSidebar({ user, onLogout }: DashboardSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [counts, setCounts] = useState({ employees: 0, present: 0 });
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch("/api/employees").then((r) => r.json()).catch(() => ({ employees: [] })),
      fetch("/api/attendance/today").then((r) => r.json()).catch(() => ({ summary: {} })),
    ]).then(([empData, attData]) => {
      setCounts({
        employees: empData.employees?.length || 0,
        present: attData.summary?.present || 0,
      });
    });
  }, []);

  function handleNavigate(href: string) {
    setSidebarOpen(false);
    router.push(href);
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SA";

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 lg:hidden"
        aria-label="Open sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-700">
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-[#0f1a2e] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <Logo className="h-9 w-auto brightness-0 invert" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const count = item.label === "Employees" ? counts.employees : item.label === "Attendance" ? counts.present : null;
            return (
              <button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                style={{
                  transform: mounted ? "translateY(0)" : "translateY(12px)",
                  opacity: mounted ? 1 : 0,
                  transition: `all 0.5s cubic-bezier(0.32, 0.72, 0, 1) ${index * 0.08}s`,
                }}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-300 group relative overflow-hidden
                  ${isActive
                    ? "text-white bg-white/10 shadow-lg shadow-black/10"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <span className={`relative z-10 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  {item.icon}
                </span>
                <span className="relative z-10 flex-1 text-left">{item.label}</span>
                {count !== null && (
                  <span className="relative z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                    {count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent animate-[fadeIn_0.3s_ease-out]" />
                )}
                {isActive && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-6">
          <div
            style={{
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              opacity: mounted ? 1 : 0,
              transition: "all 0.5s cubic-bezier(0.32, 0.72, 0, 1) 0.4s",
            }}
            className="bg-white/5 rounded-2xl p-4 border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.name || "Admin"}</p>
                <p className="text-xs text-white/40 truncate">{user?.email || ""}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-[fadeIn_0.3s_ease-out]"
        />
      )}
    </>
  );
}
