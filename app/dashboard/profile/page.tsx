"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useAnimatedMount } from "@/lib/hooks/useAnimatedMount";

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string; role: string; createdAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const mounted = useAnimatedMount();
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ]).then(([auth, data]) => {
      if (!auth.user) { router.push("/"); return; }
      setUser(auth.user);
      if (data.user) {
        setName(data.user.name || auth.user.name);
        setEmail(data.user.email || auth.user.email);
      } else {
        setName(auth.user.name);
        setEmail(auth.user.email);
      }
    }).catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError(""); setProfileSuccess("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfileSuccess("Profile updated");
      setUser((prev) => prev ? { ...prev, name: data.user.name, email: data.user.email } : prev);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update");
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setPasswordError(""); setPasswordSuccess("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPasswordSuccess("Password changed");
      setCurrentPassword(""); setNewPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally { setSaving(false); }
  };

  const animProps = (delay: number) => ({
    style: { transform: mounted ? "translateY(0)" : "translateY(20px)", opacity: mounted ? 1 : 0, transition: `all 0.6s cubic-bezier(0.32, 0.72, 0, 1) ${delay}s` },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardSidebar user={user} onLogout={logout} />
      <main className="flex-1 min-h-screen">
        <div className="p-6 lg:p-10 pt-20 lg:pt-10 max-w-3xl">
          <div {...animProps(0)}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-500 mt-1">Manage your account settings</p>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" {...animProps(0.15)}>
                <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Profile Information</h2>
                {profileSuccess && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">{profileSuccess}</div>}
                {profileError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{profileError}</div>}
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Role: <strong className="text-gray-600 capitalize">{user?.role || "admin"}</strong></span>
                    <span>Joined: <strong className="text-gray-600">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</strong></span>
                  </div>
                  <button type="submit" disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-lg shadow-[#1e3a5f]/20 hover:bg-[#162d4a] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 text-sm"
                  >
                    {saving ? "Saving..." : "Update Profile"}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" {...animProps(0.2)}>
                <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Change Password</h2>
                {passwordSuccess && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">{passwordSuccess}</div>}
                {passwordError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{passwordError}</div>}
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm"
                    />
                  </div>
                  <button type="submit" disabled={saving || !currentPassword || !newPassword}
                    className="px-6 py-2.5 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-lg shadow-[#1e3a5f]/20 hover:bg-[#162d4a] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 text-sm"
                  >
                    {saving ? "Changing..." : "Change Password"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
