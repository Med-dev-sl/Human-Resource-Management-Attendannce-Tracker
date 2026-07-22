"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar";

interface EmployeeDetail {
  id: string;
  employeeId: string;
  staffCategory: string;
  title: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  gender: string;
  dateOfBirth: string | null;
  phone: string | null;
  email: string;
  address: string | null;
  faculty: string | null;
  school: string | null;
  department: string | null;
  designation: string;
  employmentType: string;
  dateOfEmployment: string | null;
  qualification: string | null;
  specialization: string | null;
  nextOfKinName: string | null;
  nextOfKinPhone: string | null;
  nextOfKinRelation: string | null;
  status: string;
  createdAt: string;
  attendances: { id: string; date: string; status: string; checkIn: string | null; checkOut: string | null }[];
}

export default function EmployeeDetailPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [emp, setEmp] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/employees/${id}`).then((r) => r.json()),
    ]).then(([auth, data]) => {
      if (!auth.user) { router.push("/"); return; }
      setUser(auth.user);
      if (!data.employee) { router.push("/dashboard/employees"); return; }
      setEmp(data.employee);
      const e = data.employee;
      setForm({
        staffCategory: e.staffCategory,
        title: e.title,
        lastName: e.lastName,
        firstName: e.firstName,
        middleName: e.middleName || "",
        gender: e.gender,
        dateOfBirth: e.dateOfBirth ? e.dateOfBirth.slice(0, 10) : "",
        phone: e.phone || "",
        email: e.email,
        address: e.address || "",
        faculty: e.faculty || "",
        school: e.school || "",
        department: e.department || "",
        designation: e.designation,
        employmentType: e.employmentType,
        dateOfEmployment: e.dateOfEmployment ? e.dateOfEmployment.slice(0, 10) : "",
        qualification: e.qualification || "",
        specialization: e.specialization || "",
        nextOfKinName: e.nextOfKinName || "",
        nextOfKinPhone: e.nextOfKinPhone || "",
        nextOfKinRelation: e.nextOfKinRelation || "",
      });
    }).catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEmp(data.employee);
      setEditing(false);
      setSuccess("Employee updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !emp) {
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
        <div className="p-6 lg:p-10 pt-20 lg:pt-10 max-w-4xl">
          <div style={{
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            opacity: mounted ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1) 0.15s",
          }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button onClick={() => router.push("/dashboard/employees")} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-500">
                    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{emp.title} {emp.firstName} {emp.lastName}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{emp.employeeId} &middot; {emp.designation}</p>
                </div>
              </div>
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm ${
                  editing
                    ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md"
                    : "bg-[#1e3a5f] text-white hover:bg-[#162d4a] hover:shadow-md"
                } disabled:opacity-50`}
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Edit"}
              </button>
            </div>

            {success && <p className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">{success}</p>}
            {error && <p className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</p>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <InfoCard title="Personal Information">
                  <InfoRow label="Full Name" value={`${emp.title} ${emp.firstName} ${emp.middleName || ""} ${emp.lastName}`} />
                  <InfoRow label="Gender" value={emp.gender} />
                  <InfoRow label="Date of Birth" value={emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString() : "—"} />
                  <InfoRow label="Phone" value={emp.phone || "—"} />
                  <InfoRow label="Email" value={emp.email} />
                  <InfoRow label="Address" value={emp.address || "—"} />
                </InfoCard>

                <InfoCard title="Employment Details">
                  <InfoRow label="Employee ID" value={emp.employeeId} />
                  <InfoRow label="Staff Category" value={emp.staffCategory} />
                  <InfoRow label="Designation" value={emp.designation} />
                  <InfoRow label="Employment Type" value={emp.employmentType} />
                  <InfoRow label="Date of Employment" value={emp.dateOfEmployment ? new Date(emp.dateOfEmployment).toLocaleDateString() : "—"} />
                  <InfoRow label="Faculty/School" value={emp.faculty || emp.school || "—"} />
                  <InfoRow label="Department" value={emp.department || "—"} />
                </InfoCard>

                <InfoCard title="Qualifications">
                  <InfoRow label="Highest Qualification" value={emp.qualification || "—"} />
                  <InfoRow label="Specialization" value={emp.specialization || "—"} />
                </InfoCard>

                <InfoCard title="Next of Kin">
                  <InfoRow label="Name" value={emp.nextOfKinName || "—"} />
                  <InfoRow label="Phone" value={emp.nextOfKinPhone || "—"} />
                  <InfoRow label="Relationship" value={emp.nextOfKinRelation || "—"} />
                </InfoCard>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Status</h3>
                  <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    emp.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {emp.status}
                  </span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Attendance</h3>
                  {emp.attendances.length === 0 ? (
                    <p className="text-xs text-gray-400">No attendance records</p>
                  ) : (
                    <div className="space-y-2">
                      {emp.attendances.slice(0, 10).map((a) => (
                        <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()}</span>
                          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            a.status === "present" ? "bg-emerald-50 text-emerald-600" :
                            a.status === "late" ? "bg-amber-50 text-amber-600" :
                            a.status === "absent" ? "bg-red-50 text-red-600" :
                            "bg-gray-50 text-gray-500"
                          }`}>{a.status}</span>
                        </div>
                      ))}
                    </div>
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

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-gray-400 font-medium shrink-0 w-36">{label}</span>
      <span className="text-sm text-gray-900 text-right">{value}</span>
    </div>
  );
}
