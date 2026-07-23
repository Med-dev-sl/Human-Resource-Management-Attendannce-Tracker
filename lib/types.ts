export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Employee {
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
  updatedAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  employee?: {
    employeeId: string;
    firstName: string;
    lastName: string;
    title: string;
    department: string | null;
  };
}

export interface AttendanceRecord {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string | null;
  staffCategory: string;
  attendance: {
    id: string;
    checkIn: string;
    checkOut: string | null;
    status: string;
    date: string;
  } | null;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  late: number;
  absent: number;
  halfDay: number;
  onLeave: number;
}

export interface WorkSchedule {
  id: string;
  startTime: string;
  endTime: string;
  lateMinutes: number;
  absentMinutes: number;
  workDays: string;
}

export interface DashboardMetrics {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  avgCheckInTime: string;
  attendanceRate: number;
  onLeave: number;
  weeklyTrend: { date: string; present: number; late: number; absent: number }[];
  departmentBreakdown: { department: string; total: number; present: number }[];
  hourlyDistribution: { hour: string; count: number }[];
}
