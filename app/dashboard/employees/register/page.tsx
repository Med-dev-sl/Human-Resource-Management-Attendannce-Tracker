"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar";

const staffCategories = ["academic", "administrative", "technical", "support"];
const titles = ["Prof.", "Dr.", "Mr.", "Mrs.", "Ms.", "Miss", "Eng.", "Rev."];
const designations = [
  "Vice Chancellor", "Deputy Vice Chancellor", "Registrar", "Dean",
  "Associate Dean", "Head of Department", "Senior Lecturer", "Lecturer",
  "Assistant Lecturer", "Graduate Assistant", "Research Fellow",
  "Senior Research Fellow", "Professor", "Associate Professor",
  "Administrative Officer", "Executive Assistant", "Accountant",
  "Senior Accountant", "Finance Officer", "Internal Auditor",
  "Human Resource Officer", "Procurement Officer", "ICT Officer",
  "Senior ICT Officer", "Lab Technician", "Lab Technologist",
  "Librarian", "Senior Librarian", "Security Officer",
  "Transport Officer", "Estates Officer", "Catering Officer",
  "Store Keeper", "Secretary", "Administrative Assistant",
];
const employmentTypes = ["full-time", "part-time", "contract", "adjunct", "visiting"];
const genders = ["male", "female"];
const faculties = [
  "Faculty of Science", "Faculty of Arts", "Faculty of Social Sciences",
  "Faculty of Engineering", "Faculty of Law", "Faculty of Education",
  "Faculty of Medicine", "Faculty of Agriculture", "Faculty of Business",
  "Faculty of Computing", "School of Graduate Studies",
];
const departments: Record<string, string[]> = {
  "Faculty of Science": ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Geology"],
  "Faculty of Arts": ["English", "History", "Philosophy", "Linguistics", "Religious Studies"],
  "Faculty of Social Sciences": ["Economics", "Political Science", "Sociology", "Psychology", "Geography"],
  "Faculty of Engineering": ["Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Chemical Engineering"],
  "Faculty of Law": ["Private Law", "Public Law", "International Law"],
  "Faculty of Education": ["Curriculum Studies", "Educational Psychology", "Educational Administration"],
  "Faculty of Medicine": ["Anatomy", "Physiology", "Pharmacology", "Community Medicine"],
  "Faculty of Agriculture": ["Crop Science", "Animal Science", "Soil Science", "Agricultural Economics"],
  "Faculty of Business": ["Accounting", "Finance", "Marketing", "Management", "Entrepreneurship"],
  "Faculty of Computing": ["Software Engineering", "Data Science", "Cybersecurity", "Information Systems"],
  "School of Graduate Studies": ["Research", "Academic Writing", "Methodology"],
};

const qualifications = [
  "PhD", "Master's Degree", "Bachelor's Degree",
  "Higher National Diploma", "National Diploma",
  "Certificate", "Professional Certification",
];

export default function RegisterEmployee() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    staffCategory: "academic",
    title: "",
    lastName: "",
    firstName: "",
    middleName: "",
    gender: "male",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    faculty: "",
    school: "",
    department: "",
    designation: "",
    employmentType: "full-time",
    dateOfEmployment: "",
    qualification: "",
    specialization: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinRelation: "",
  });

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((res) => { if (!res.ok) throw Error(); return res.json(); })
      .then((data) => { if (!data.user) throw Error(); setUser(data.user); })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [router]);

  function update(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "faculty") next.department = "";
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Employee registered: ${data.employee.employeeId}`);
      setForm({
        staffCategory: "academic", title: "", lastName: "", firstName: "",
        middleName: "", gender: "male", dateOfBirth: "", phone: "", email: "",
        address: "", faculty: "", school: "", department: "", designation: "",
        employmentType: "full-time", dateOfEmployment: "", qualification: "",
        specialization: "", nextOfKinName: "", nextOfKinPhone: "", nextOfKinRelation: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) return <LoadingScreen />;

  const departmentsForFaculty = form.faculty ? departments[form.faculty] || [] : [];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardSidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 lg:ml-72 min-h-screen">
        <div className="p-6 lg:p-10 pt-20 lg:pt-10 max-w-4xl">
          <div style={{
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            opacity: mounted ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1) 0.15s",
          }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Employee Registration</h1>
              <p className="text-gray-500 mt-1">Register a new staff member</p>
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
              <Section title="Staff Category">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {staffCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => update("staffCategory", cat)}
                      className={`p-3 rounded-xl text-sm font-medium capitalize transition-all duration-300 border ${
                        form.staffCategory === cat
                          ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-lg shadow-[#1e3a5f]/20 scale-[1.02]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Personal Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SelectField label="Title" value={form.title} onChange={(v) => update("title", v)} options={titles} placeholder="Select title" required />
                  <InputField label="First Name" value={form.firstName} onChange={(v) => update("firstName", v)} required />
                  <InputField label="Middle Name" value={form.middleName} onChange={(v) => update("middleName", v)} />
                  <InputField label="Last Name" value={form.lastName} onChange={(v) => update("lastName", v)} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <SelectField label="Gender" value={form.gender} onChange={(v) => update("gender", v)} options={genders} required />
                  <InputField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(v) => update("dateOfBirth", v)} />
                  <InputField label="Phone" type="tel" value={form.phone} onChange={(v) => update("phone", v)} />
                  <InputField label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm resize-none"
                  />
                </div>
              </Section>

              <Section title="Academic / Administrative Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField label="Faculty / School" value={form.faculty} onChange={(v) => update("faculty", v)} options={form.staffCategory === "academic" ? faculties : ["Office of the Vice Chancellor", "Registry", "Finance Department", "Human Resources", "ICT Directorate", "Library Services", "Works & Physical Planning", "Security Services", "Catering & Hospitality", "Transport Services"]} placeholder="Select faculty" />
                  <InputField label="School (if applicable)" value={form.school} onChange={(v) => update("school", v)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <SelectField label="Department / Unit" value={form.department} onChange={(v) => update("department", v)} options={departmentsForFaculty} placeholder="Select department" />
                  <SelectField label="Designation" value={form.designation} onChange={(v) => update("designation", v)} options={designations} placeholder="Select designation" required />
                </div>
              </Section>

              <Section title="Employment Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <SelectField label="Employment Type" value={form.employmentType} onChange={(v) => update("employmentType", v)} options={employmentTypes} required />
                  <InputField label="Date of Employment" type="date" value={form.dateOfEmployment} onChange={(v) => update("dateOfEmployment", v)} />
                  <SelectField label="Highest Qualification" value={form.qualification} onChange={(v) => update("qualification", v)} options={qualifications} placeholder="Select qualification" />
                </div>
                <div className="mt-4">
                  <InputField label="Specialization / Research Area" value={form.specialization} onChange={(v) => update("specialization", v)} />
                </div>
              </Section>

              <Section title="Next of Kin">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField label="Full Name" value={form.nextOfKinName} onChange={(v) => update("nextOfKinName", v)} />
                  <InputField label="Phone" type="tel" value={form.nextOfKinPhone} onChange={(v) => update("nextOfKinPhone", v)} />
                  <InputField label="Relationship" value={form.nextOfKinRelation} onChange={(v) => update("nextOfKinRelation", v)} placeholder="e.g. Spouse, Parent" />
                </div>
              </Section>

              <div className="flex gap-3 pb-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-[#1e3a5f] text-white font-semibold shadow-lg shadow-[#1e3a5f]/20 hover:bg-[#162d4a] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Registering..." : "Register Employee"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/employees")}
                  className="px-8 py-3 rounded-xl bg-white text-gray-600 font-semibold border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]" />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, required }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat pr-10"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
