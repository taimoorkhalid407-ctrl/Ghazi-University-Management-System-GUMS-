import React, { useState, useEffect } from 'react';
import {
  User,
  BookOpen,
  CalendarCheck,
  Award,
  Mail,
  Phone,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Printer
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Student, Department, Course, Enrollment, AttendanceRecord, MarkRecord } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { UniversityLogo } from '../components/common/UniversityLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface StudentProfilePageProps {
  initialTab?: 'profile' | 'courses' | 'attendance' | 'results';
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ initialTab = 'profile' }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'attendance' | 'results'>(initialTab);
  const [loading, setLoading] = useState(true);

  const [student, setStudent] = useState<Student | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<(Enrollment & { course?: Course })[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<(MarkRecord & { course?: Course })[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any[]>([]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      // Student ID comes from user session (e.g. stu-1 for Muhammad Abdullah)
      const targetId = currentUser?.studentId || 'stu-1';
      const data = await api.getStudentById(targetId);

      setStudent(data.student);
      setDepartment(data.department || null);
      setEnrolledCourses(data.enrolledCourses);
      setAttendance(data.attendance);
      setMarks(data.marks);
      setAttendanceSummary(data.attendanceSummary);
    } catch (err: unknown) {
      showToast('Unable to load your student records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [currentUser]);

  if (loading) {
    return <LoadingSpinner message="Loading your academic profile..." />;
  }

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-700">No student profile linked to your account.</p>
      </div>
    );
  }

  // Calculate Cumulative GPA for the student
  const cgpa = marks.length > 0 ? (marks.reduce((acc, m) => acc + m.gpa, 0) / marks.length).toFixed(2) : '3.50';

  return (
    <div className="space-y-6">
      {/* Student Banner Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white text-blue-900 font-black text-2xl flex items-center justify-center shadow-lg">
              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-200 mb-2 border border-white/10">
                <UniversityLogo size="xs" className="w-4 h-4 object-contain" />
                <span>Ghazi University • Student Profile</span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight">{student.firstName} {student.lastName}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                  {student.status}
                </span>
              </div>
              <p className="text-xs font-mono text-blue-200 mt-1">
                Roll No: <strong>{student.rollNumber}</strong> • Student ID: {student.studentId}
              </p>
              <p className="text-xs text-blue-100/90 mt-0.5">
                {student.program} • Semester {student.semester} ({student.section})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
            <div>
              <span className="text-[11px] text-blue-200 uppercase tracking-wider block">Cumulative GPA</span>
              <span className="text-2xl font-black text-white">{cgpa}</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="text-[11px] text-blue-200 uppercase tracking-wider block">Courses</span>
              <span className="text-2xl font-black text-white">{enrolledCourses.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'courses'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Enrolled Courses ({enrolledCourses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>My Attendance Record</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'results'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Academic Transcript & Grades</span>
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Personal & Academic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Full Legal Name</span>
              <span className="font-bold text-slate-900 text-sm">{student.firstName} {student.lastName}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Father's Name</span>
              <span className="font-bold text-slate-900 text-sm">{student.fatherName}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">CNIC (National ID)</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{student.cnic}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Academic Email</span>
              <span className="font-bold text-blue-700 text-sm">{student.email}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Phone Contact</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{student.phone}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Date of Birth</span>
              <span className="font-bold text-slate-900 text-sm">{student.dateOfBirth}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Academic Department</span>
              <span className="font-bold text-slate-900 text-sm">{department?.departmentName || 'Computer Science'}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Degree Program</span>
              <span className="font-bold text-slate-900 text-sm">{student.program}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Admission Date</span>
              <span className="font-bold text-slate-900 text-sm">{student.admissionDate}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2 lg:col-span-3">
              <span className="text-slate-400 block mb-1">Permanent Residential Address</span>
              <span className="font-bold text-slate-900 text-sm">
                {student.address}, {student.city}, {student.province}, Pakistan
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENROLLED COURSES */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {enrolledCourses.map(enr => (
            <div key={enr.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-mono font-bold text-xs">
                  {enr.course?.courseCode}
                </span>
                <Badge variant="success">{enr.status}</Badge>
              </div>

              <h4 className="text-base font-bold text-slate-900">{enr.course?.courseName}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{enr.course?.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Credit Hours: <strong>{enr.course?.creditHours} CH</strong></span>
                <span>Session: <strong>{enr.academicYear}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attendanceSummary.map((sum, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-sm">{sum.courseCode} - {sum.courseName}</h4>
                  <Badge variant={sum.percentage >= 75 ? 'success' : 'danger'}>
                    {sum.percentage >= 75 ? 'Exam Eligible' : 'Short Attendance'}
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs text-slate-500">Attendance Percentage</span>
                  <span className="text-xl font-black text-slate-900">{sum.percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${sum.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, sum.percentage)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
                  <span>Total: <strong>{sum.totalClasses}</strong></span>
                  <span className="text-emerald-700">Present: <strong>{sum.present}</strong></span>
                  <span className="text-rose-700">Absent: <strong>{sum.absent}</strong></span>
                  <span className="text-amber-700">Late: <strong>{sum.late}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800 uppercase tracking-wider">
              Lecture Attendance History ({attendance.length} Sessions)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Marked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map(a => (
                    <tr key={a.id}>
                      <td className="py-3 px-4 font-medium text-slate-800">{a.date}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">{a.courseId}</td>
                      <td className="py-3 px-4">
                        <Badge variant={a.status === 'Present' ? 'success' : a.status === 'Late' ? 'warning' : 'danger'}>
                          {a.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{a.markedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESULTS */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <UniversityLogo size="small" className="w-10 h-10 object-contain print:w-12 print:h-12" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">Ghazi University</h3>
                <p className="text-xs text-slate-500">Official Semester Grade Sheet • Controller of Examinations</p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Transcript</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Course Code</th>
                  <th className="py-3.5 px-4">Course Title</th>
                  <th className="py-3.5 px-3 text-center">Quiz (15)</th>
                  <th className="py-3.5 px-3 text-center">Assign (10)</th>
                  <th className="py-3.5 px-3 text-center">Mid (25)</th>
                  <th className="py-3.5 px-3 text-center">Final (40)</th>
                  <th className="py-3.5 px-3 text-center">Prac (10)</th>
                  <th className="py-3.5 px-3 text-center">Total (100)</th>
                  <th className="py-3.5 px-3 text-center">Grade</th>
                  <th className="py-3.5 px-3 text-center">GPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marks.map(m => (
                  <tr key={m.id} className="hover:bg-blue-50/20">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{m.course?.courseCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{m.course?.courseName}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{m.quizMarks}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{m.assignmentMarks}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{m.midtermMarks}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{m.finalMarks}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{m.practicalMarks}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-blue-950 bg-blue-50/50">{m.totalMarks}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-black text-xs bg-emerald-100 text-emerald-800">
                        {m.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-slate-900">{m.gpa.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-slate-500 font-medium">Grading criteria: A+ (90-100, 4.0), A (80-89, 3.7), B+ (75-79, 3.3), B (70-74, 3.0), C+ (65-69, 2.5), C (60-64, 2.0), D (50-59, 1.0), F (&lt;50, 0.0)</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Cumulative GPA:</span>
              <span className="text-base font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                {cgpa} / 4.00
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
