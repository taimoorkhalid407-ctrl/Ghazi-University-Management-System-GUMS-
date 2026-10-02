export type Role = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  studentId?: string; // If role is student, links to Student ID
  facultyId?: string; // If role is teacher, links to Faculty ID
  avatar?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. STU-001
  rollNumber: string; // e.g. BSCS-2022-001
  firstName: string;
  lastName: string;
  fatherName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string; // YYYY-MM-DD
  cnic: string; // 12345-1234567-1
  email: string;
  phone: string; // 0300-1234567
  address: string;
  city: string;
  province: string;
  departmentId: string;
  program: string;
  semester: number;
  section: string;
  admissionDate: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Graduated';
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  departmentId: string; // e.g. DEP-001
  departmentCode: string; // e.g. CS
  departmentName: string; // e.g. Department of Computer Science
  hodName: string; // e.g. Dr. Muhammad Imran
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  description?: string;
  createdAt?: string;
}

export interface Faculty {
  id: string;
  facultyId: string; // e.g. FAC-001
  employeeId: string; // e.g. GU-EMP-101
  firstName: string;
  lastName: string;
  fatherName: string;
  email: string;
  phone: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' | 'Visiting Lecturer';
  departmentId: string;
  qualification: string; // e.g. Ph.D. Computer Science
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Resigned';
  createdAt?: string;
}

export interface Course {
  id: string;
  courseId: string; // e.g. CRS-001
  courseCode: string; // e.g. CS-101
  courseName: string; // e.g. Programming Fundamentals
  creditHours: number; // e.g. 3 or 4
  departmentId: string;
  semester: number;
  teacherId: string; // Faculty ID
  description: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

export interface Enrollment {
  id: string;
  enrollmentId: string; // e.g. ENR-001
  studentId: string;
  courseId: string;
  semester: number;
  academicYear: string; // e.g. "2024-2025" or "Fall 2024"
  enrollmentDate: string;
  status: 'Enrolled' | 'Dropped' | 'Completed';
  createdAt?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceRecord {
  id: string;
  attendanceId: string;
  studentId: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string; // Name or ID of Teacher/Admin
  remarks?: string;
  createdAt?: string;
}

export interface MarkRecord {
  id: string;
  markId: string;
  studentId: string;
  courseId: string;
  quizMarks: number; // max 15
  assignmentMarks: number; // max 10
  midtermMarks: number; // max 25
  finalMarks: number; // max 40
  practicalMarks: number; // max 10
  totalMarks: number; // derived (quiz + assignment + midterm + final + practical)
  percentage: number; // derived
  grade: string; // A+, A, B+, B, C+, C, D, F
  gpa: number; // 0.0 to 4.0
  academicSemester?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalDepartments: number;
  totalCourses: number;
  activeStudents: number;
  maleStudents: number;
  femaleStudents: number;
  averageAttendance: number;
  averageGpa: number;
  departmentStats: { name: string; code: string; studentCount: number }[];
  enrollmentStats: { semester: string; count: number }[];
  attendanceDistribution: { name: string; value: number; color: string }[];
  gpaDistribution: { grade: string; count: number }[];
}

export interface AttendanceSummary {
  studentId: string;
  studentName: string;
  rollNumber: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}
