import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Search,
  Filter,
  Users,
  Building2,
  CalendarCheck,
  Award,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Student, Department, Course, Enrollment, AttendanceRecord, MarkRecord } from '../types/index.ts';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { UniversityLogo } from '../components/common/UniversityLogo.tsx';
import { useToast } from '../context/ToastContext.tsx';

type ReportType = 'students' | 'departments' | 'attendance' | 'marks' | 'enrollments';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();

  const [activeReport, setActiveReport] = useState<ReportType>('students');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Loaded database entities
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [stuRes, depRes, crsRes, enrRes, attRes, mrkRes] = await Promise.all([
        api.getStudents(),
        api.getDepartments(),
        api.getCourses(),
        api.getEnrollments(),
        api.getAttendance(),
        api.getMarks()
      ]);
      setStudents(stuRes.students);
      setDepartments(depRes.departments);
      setCourses(crsRes.courses);
      setEnrollments(enrRes.enrollments);
      setAttendance(attRes.attendance);
      setMarks(mrkRes);
    } catch (err: unknown) {
      showToast('Error loading report datasets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // CSV Exporter Utility
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename}.csv successfully!`, 'success');
  };

  const handleExport = () => {
    if (activeReport === 'students') {
      const headers = ['Roll Number', 'Name', 'Father Name', 'Department', 'Program', 'Semester', 'CNIC', 'Phone', 'City', 'Status'];
      const rows = students.map(s => {
        const dept = departments.find(d => d.id === s.departmentId);
        return [
          s.rollNumber,
          `${s.firstName} ${s.lastName}`,
          s.fatherName,
          dept?.departmentCode || 'N/A',
          s.program,
          s.semester,
          s.cnic,
          s.phone,
          s.city,
          s.status
        ];
      });
      exportToCSV('gu_students_registry', headers, rows);
    } else if (activeReport === 'departments') {
      const headers = ['Department Code', 'Department Name', 'HOD', 'Email', 'Phone', 'Students Enrolled', 'Status'];
      const rows = departments.map(d => {
        const count = students.filter(s => s.departmentId === d.id).length;
        return [d.departmentCode, d.departmentName, d.hodName, d.email, d.phone, count, d.status];
      });
      exportToCSV('gu_departments_summary', headers, rows);
    } else if (activeReport === 'attendance') {
      const headers = ['Date', 'Roll Number', 'Student Name', 'Course', 'Status', 'Marked By'];
      const rows = attendance.map(a => [a.date, a.rollNumber, a.studentName, a.courseCode, a.status, a.markedBy]);
      exportToCSV('gu_attendance_logs', headers, rows);
    } else if (activeReport === 'marks') {
      const headers = ['Roll Number', 'Student Name', 'Course', 'Quiz (15)', 'Assign (10)', 'Midterm (25)', 'Final (40)', 'Practical (10)', 'Total (100)', 'Percentage', 'Grade', 'GPA'];
      const rows = marks.map(m => [
        m.rollNumber,
        m.studentName,
        m.courseCode,
        m.quizMarks,
        m.assignmentMarks,
        m.midtermMarks,
        m.finalMarks,
        m.practicalMarks,
        m.totalMarks,
        `${m.percentage}%`,
        m.grade,
        m.gpa.toFixed(2)
      ]);
      exportToCSV('gu_examination_grades', headers, rows);
    } else if (activeReport === 'enrollments') {
      const headers = ['Enrollment ID', 'Roll Number', 'Student Name', 'Course Code', 'Course Title', 'Semester', 'Academic Year', 'Status'];
      const rows = enrollments.map(e => [
        e.enrollmentId,
        e.rollNumber,
        e.studentName,
        e.courseCode,
        e.courseName,
        e.semester,
        e.academicYear,
        e.status
      ]);
      exportToCSV('gu_course_enrollments', headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Exportable institutional dossiers, auditor registries, and student statistics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => setActiveReport('students')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'students' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Student List</span>
        </button>

        <button
          onClick={() => setActiveReport('departments')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'departments' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>2. Department-wise</span>
        </button>

        <button
          onClick={() => setActiveReport('attendance')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'attendance' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>3. Attendance Report</span>
        </button>

        <button
          onClick={() => setActiveReport('marks')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'marks' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>4. Marks / Results</span>
        </button>

        <button
          onClick={() => setActiveReport('enrollments')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'enrollments' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>5. Course Enrollments</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search report records..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Rendered Active Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden print:border-none print:shadow-none">
        {/* Printable Official University Report Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 print:bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UniversityLogo size="medium" className="w-14 h-14 object-contain print:w-16 print:h-16" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                Ghazi University
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Dera Ghazi Khan, Punjab, Pakistan
              </p>
              <p className="text-xs font-bold text-blue-700 mt-0.5">
                {activeReport === 'students' && 'Student Management Report'}
                {activeReport === 'departments' && 'Department Directory & Enrollment Summary'}
                {activeReport === 'attendance' && 'Academic Attendance Logs & Eligibility Report'}
                {activeReport === 'marks' && 'Examinations, Grades & Results Report'}
                {activeReport === 'enrollments' && 'Course Enrollment & Registration Registry'}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 hidden sm:block print:block">
            <p className="font-semibold text-slate-700">Official Institutional Report</p>
            <p>Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p className="text-[10px] text-slate-400">GUMS Academic ERP • Official Record</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Aggregating records for report..." />
        ) : (
          <div className="overflow-x-auto">
            {/* REPORT 1: STUDENT LIST */}
            {activeReport === 'students' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Roll Number</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Father Name</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Program</th>
                    <th className="py-3.5 px-4">Semester</th>
                    <th className="py-3.5 px-4">CNIC</th>
                    <th className="py-3.5 px-4">City</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter(s => {
                      if (!search.trim()) return true;
                      const q = search.toLowerCase();
                      return (
                        s.firstName.toLowerCase().includes(q) ||
                        s.lastName.toLowerCase().includes(q) ||
                        s.rollNumber.toLowerCase().includes(q) ||
                        s.city.toLowerCase().includes(q)
                      );
                    })
                    .map(s => {
                      const dept = departments.find(d => d.id === s.departmentId);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-blue-900">{s.rollNumber}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{s.firstName} {s.lastName}</td>
                          <td className="py-3 px-4 text-slate-700">{s.fatherName}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{dept?.departmentCode || 'N/A'}</td>
                          <td className="py-3 px-4 text-slate-700">{s.program}</td>
                          <td className="py-3 px-4 font-mono">Sem {s.semester} ({s.section})</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{s.cnic}</td>
                          <td className="py-3 px-4 text-slate-700">{s.city}</td>
                          <td className="py-3 px-4 font-medium text-emerald-700">{s.status}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}

            {/* REPORT 2: DEPARTMENTS */}
            {activeReport === 'departments' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Department Name</th>
                    <th className="py-3.5 px-4">Head of Department (HOD)</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4 text-center">Active Students</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments
                    .filter(d => {
                      if (!search.trim()) return true;
                      const q = search.toLowerCase();
                      return (
                        d.departmentCode.toLowerCase().includes(q) ||
                        d.departmentName.toLowerCase().includes(q) ||
                        d.hodName.toLowerCase().includes(q)
                      );
                    })
                    .map(d => {
                      const count = students.filter(s => s.departmentId === d.id).length;
                      return (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-blue-900">{d.departmentCode}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{d.departmentName}</td>
                          <td className="py-3 px-4 text-slate-700">{d.hodName}</td>
                          <td className="py-3 px-4 font-mono text-blue-700">{d.email}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{d.phone}</td>
                          <td className="py-3 px-4 text-center font-black text-slate-900">{count}</td>
                          <td className="py-3 px-4 text-right font-medium text-emerald-700">{d.status}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}

            {/* REPORT 3: ATTENDANCE */}
            {activeReport === 'attendance' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Roll Number</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Course</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Instructor / Proctor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance
                    .filter(a => {
                      if (!search.trim()) return true;
                      const q = search.toLowerCase();
                      return (
                        a.studentName?.toLowerCase().includes(q) ||
                        a.rollNumber?.toLowerCase().includes(q) ||
                        a.courseCode?.toLowerCase().includes(q)
                      );
                    })
                    .map(a => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-800">{a.date}</td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-900">{a.rollNumber}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{a.studentName}</td>
                        <td className="py-3 px-4">{a.courseCode} - {a.courseName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              a.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : a.status === 'Late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{a.markedBy}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {/* REPORT 4: MARKS & RESULTS */}
            {activeReport === 'marks' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Roll Number</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Course</th>
                    <th className="py-3.5 px-2 text-center">Quiz</th>
                    <th className="py-3.5 px-2 text-center">Assign</th>
                    <th className="py-3.5 px-2 text-center">Mid</th>
                    <th className="py-3.5 px-2 text-center">Final</th>
                    <th className="py-3.5 px-2 text-center">Prac</th>
                    <th className="py-3.5 px-2 text-center">Total</th>
                    <th className="py-3.5 px-2 text-center">Grade</th>
                    <th className="py-3.5 px-2 text-center">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marks
                    .filter(m => {
                      if (!search.trim()) return true;
                      const q = search.toLowerCase();
                      return (
                        m.studentName?.toLowerCase().includes(q) ||
                        m.rollNumber?.toLowerCase().includes(q) ||
                        m.courseCode?.toLowerCase().includes(q)
                      );
                    })
                    .map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-blue-900">{m.rollNumber}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{m.studentName}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{m.courseCode}</td>
                        <td className="py-3 px-2 text-center font-mono">{m.quizMarks}</td>
                        <td className="py-3 px-2 text-center font-mono">{m.assignmentMarks}</td>
                        <td className="py-3 px-2 text-center font-mono">{m.midtermMarks}</td>
                        <td className="py-3 px-2 text-center font-mono">{m.finalMarks}</td>
                        <td className="py-3 px-2 text-center font-mono">{m.practicalMarks}</td>
                        <td className="py-3 px-2 text-center font-black text-blue-950 bg-blue-50/50">{m.totalMarks}</td>
                        <td className="py-3 px-2 text-center font-black text-emerald-700">{m.grade}</td>
                        <td className="py-3 px-2 text-center font-black text-slate-900">{m.gpa.toFixed(2)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {/* REPORT 5: ENROLLMENTS */}
            {activeReport === 'enrollments' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Enrollment ID</th>
                    <th className="py-3.5 px-4">Roll Number</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Course</th>
                    <th className="py-3.5 px-4">Semester</th>
                    <th className="py-3.5 px-4">Session</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments
                    .filter(e => {
                      if (!search.trim()) return true;
                      const q = search.toLowerCase();
                      return (
                        e.studentName?.toLowerCase().includes(q) ||
                        e.rollNumber?.toLowerCase().includes(q) ||
                        e.courseCode?.toLowerCase().includes(q)
                      );
                    })
                    .map(e => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-400">{e.enrollmentId}</td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-900">{e.rollNumber}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{e.studentName}</td>
                        <td className="py-3 px-4">{e.courseCode} - {e.courseName}</td>
                        <td className="py-3 px-4">Semester {e.semester}</td>
                        <td className="py-3 px-4 font-medium text-slate-600">{e.academicYear}</td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-700">{e.status}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
