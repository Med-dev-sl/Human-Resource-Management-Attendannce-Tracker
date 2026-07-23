"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/app/components/Logo";

const features = [
  {
    title: "Employee Registration",
    desc: "Comprehensive registration for academic and administrative staff with faculty, department, and qualification tracking.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "QR Code Attendance",
    desc: "Contactless check-in and check-out via QR code scanning. Auto-generates daily with configurable work hours.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" /><rect x="3" y="16" width="5" height="5" />
        <line x1="21" y1="12" x2="21" y2="12" /><line x1="12" y1="21" x2="12" y2="21" />
        <line x1="12" y1="16" x2="12" y2="12" /><line x1="16" y1="12" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: "Real-Time Dashboard",
    desc: "Live attendance overview with present, late, and absent counts. Monitor staff attendance at a glance.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: "Work Schedule Control",
    desc: "Configure start and end times, late thresholds, and absent rules. Attendance status adapts automatically.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    title: "Attendance History",
    desc: "Track attendance records over time. Filter by employee, date range, and status for comprehensive reporting.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3 12h3l2-5 3 10 3-8 2 5h3" /><path d="M3 3v18h18" />
      </svg>
    ),
  },
  {
    title: "Staff Management",
    desc: "Complete employee lifecycle management from registration to employment tracking for all staff categories.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header
        style={{
          transform: mounted ? "translateY(0)" : "translateY(-20px)",
          opacity: mounted ? 1 : 0,
          transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1) 0.1s",
        }}
        className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo className="h-8 w-auto" />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 rounded-xl bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#162d4a] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 lg:pt-32 lg:pb-40">
            <div className="max-w-3xl">
              <div
                style={{
                  transform: mounted ? "translateY(0)" : "translateY(30px)",
                  opacity: mounted ? 1 : 0,
                  transition: "all 0.7s cubic-bezier(0.32, 0.72, 0, 1) 0.2s",
                }}
              >
                <span className="inline-block px-3 py-1 rounded-full bg-[#1e3a5f]/5 text-[#1e3a5f] text-xs font-semibold mb-6">
                  ETUSL Human Resource Management
                </span>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                  Staff Attendance{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Management System
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-500 mt-6 max-w-2xl leading-relaxed">
                  A comprehensive solution for tracking employee attendance, managing staff records,
                  and streamlining HR operations across all faculties and departments.
                </p>
              </div>

              <div
                style={{
                  transform: mounted ? "translateY(0)" : "translateY(20px)",
                  opacity: mounted ? 1 : 0,
                  transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1) 0.4s",
                }}
                className="flex flex-wrap gap-4 mt-10"
              >
                <Link
                  href="/login"
                  className="px-8 py-3.5 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-lg shadow-[#1e3a5f]/20 hover:bg-[#162d4a] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Access Dashboard
                </Link>
                <a
                  href="#features"
                  className="px-8 py-3.5 rounded-xl bg-white text-gray-700 font-semibold border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Learn More
                </a>
              </div>

              <div
                style={{
                  transform: mounted ? "translateY(0)" : "translateY(15px)",
                  opacity: mounted ? 1 : 0,
                  transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1) 0.5s",
                }}
                className="flex items-center gap-6 mt-12 text-sm text-gray-400"
              >
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-500"><polyline points="20 6 9 17 4 12" /></svg>
                  QR Code Check-In
                </span>
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-500"><polyline points="20 6 9 17 4 12" /></svg>
                  Real-Time Tracking
                </span>
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-500"><polyline points="20 6 9 17 4 12" /></svg>
                  Auto Attendance Rules
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Everything you need to manage attendance
              </h2>
              <p className="text-gray-500 mt-4 text-lg">
                Built for universities and institutions to handle staff attendance efficiently.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  style={{
                    transform: mounted ? "translateY(0)" : "translateY(30px)",
                    opacity: mounted ? 1 : 0,
                    transition: `all 0.6s cubic-bezier(0.32, 0.72, 0, 1) ${0.15 + i * 0.08}s`,
                  }}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#1e3a5f]/5 text-[#1e3a5f] flex items-center justify-center mb-4 group-hover:bg-[#1e3a5f] group-hover:text-white transition-all duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-gradient-to-br from-[#0f1a2e] to-[#1a2d4a] rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl lg:text-4xl font-bold text-white">
                  Ready to get started?
                </h2>
                <p className="text-blue-200/70 mt-4 text-lg max-w-xl mx-auto">
                  Sign in to the admin dashboard to manage employees and track attendance.
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-8 px-10 py-3.5 rounded-xl bg-white text-[#1e3a5f] font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Sign In to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-gray-400">
          <Logo className="h-6 w-auto opacity-50" />
          <p>&copy; {new Date().getFullYear()} ETUSL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
