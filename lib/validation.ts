import { z } from "zod";

export const employeeSchema = z.object({
  staffCategory: z.enum(["academic", "administrative", "technical", "support"]),
  title: z.string().min(1, "Title is required"),
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional().nullable(),
  gender: z.enum(["male", "female"]),
  dateOfBirth: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email"),
  address: z.string().optional().nullable(),
  faculty: z.string().optional().nullable(),
  school: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  designation: z.string().min(1, "Designation is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  dateOfEmployment: z.string().optional().nullable(),
  qualification: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  nextOfKinName: z.string().optional().nullable(),
  nextOfKinPhone: z.string().optional().nullable(),
  nextOfKinRelation: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const scheduleSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  lateMinutes: z.number().int().min(0).max(480),
  absentMinutes: z.number().int().min(0).max(480),
  workDays: z.string().optional(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "viewer", "manager"]).default("admin"),
});

export const attendanceActionSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  token: z.string().optional().nullable(),
});

export interface ValidationError {
  field: string;
  message: string;
}

export function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.issues.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));
}
