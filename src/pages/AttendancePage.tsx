import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Users,
  BookOpen,
  Calendar,
  Save,
  RefreshCw,
  BarChart3,
  Check
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Course, Student, AttendanceSummary } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const AttendancePage: React.FC = () => {
  const { showToast } = useToast();
  const { currentUser, role } = useAuth();

  const [activeTab, setActiveTab] = useState<'mark' | 'history' | 'summary'>('mark');

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Students enrolled in selected course
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // History & Summary
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCourses = async () => {
    try {
      const res = await api.getCourses();
      setCourses(res.courses);
      if (res.courses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(res.courses[0].id);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to fetch courses', 'error');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch enrolled students for active course & prefill attendance for the date
  const loadAttendanceSheet = async () => {
    if (!selectedCourseId) return;
    setLoadingSheet(true);
    try {
      // 1. Get enrollments for this course
      const enrRes = await api.getEnrollments({ courseId: selectedCourseId });
      const studentIds = enrRes.enrollments.map(e => e.studentId);

      // 2. Get students details
      const stuRes = await api.getStudents();
      const courseStudents = stuRes.students.filter(s => studentIds.includes(s.id));
      setEnrolledStudents(courseStudents);

      // 3. Check existing attendance for this date & course
      const attRes = await api.getAttendance({
        courseId: selectedCourseId,
        date: selectedDate
      });

      const initialMap: Record<string, 'Present' | 'Absent' | 'Late'> = {};
      courseStudents.forEach(stu => {
        const found = attRes.attendance.find(a => a.studentId === stu.id);
        initialMap[stu.id] = found ? found.status : 'Present';
      });

      setAttendanceSheet(initialMap);
    } catch (err: unknown) {
      showToast('Error loading attendance sheet', 'error');
    } finally {
      setLoadingSheet(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId && selectedDate) {
      loadAttendanceSheet();
    }
  }, [selectedCourseId, selectedDate]);

  // Load history & summaries
  const loadHistoryAndSummary = async () => {
    setLoadingHistory(true);
    try {
      const [attRes, sumRes] = await Promise.all([
        api.getAttendance({ courseId: selectedCourseId !== 'all' ? selectedCourseId : undefined }),
        api.getAttendanceSummary(selectedCourseId !== 'all' ? selectedCourseId : undefined)
      ]);
      setAttendanceHistory(attRes.attendance);
      setSummaries(sumRes);
    } catch (err: unknown) {
      showToast('Failed to load attendance records', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'summary') {
      loadHistoryAndSummary();
    }
  }, [activeTab, selectedCourseId]);

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceSheet(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: 'Present' | 'Absent' | 'Late') => {
    const updated: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    enrolledStudents.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceSheet(updated);
  };

  const handleSaveAttendance = async () => {
    if (enrolledStudents.length === 0) {
      showToast('No students enrolled in this course to mark attendance.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const records = enrolledStudents.map(student => ({
        studentId: student.id,
        courseId: selectedCourseId,
        date: selectedDate,
        status: attendanceSheet[student.id] || 'Present',
        markedBy: currentUser?.name || 'Academic Faculty'
      }));

      const res = await api.recordAttendanceBatch(records);
      showToast(res.message, 'success');
      loadAttendanceSheet();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to record attendance.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record lecture attendance, monitor 75% HEC exam eligibility, and view audit summaries
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('mark')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'mark'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mark Daily Class
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'summary'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student % Summary
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Raw Attendance Logs
          </button>
        </div>
      </div>

      {/* TAB 1: MARK DAILY CLASS */}
      {activeTab === 'mark' && (
        <div className="space-y-6">
          {/* Class Selector Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.courseCode} - {c.courseName} (Sem {c.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lecture Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isSaving || enrolledStudents.length === 0}
                className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-md shadow-blue-700/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving to DB...' : 'Save Attendance'}</span>
              </button>
            </div>
          </div>

          {/* Students Roster Sheet */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Enrolled Class Roster ({enrolledStudents.length} Students)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Marked by: {currentUser?.name}
              </span>
            </div>

            {loadingSheet ? (
              <LoadingSpinner message="Loading enrolled students roster..." />
            ) : enrolledStudents.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No students enrolled in this course"
                  description="Enroll students in this course under the Enrollments module to mark their attendance."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">#</th>
                      <th className="py-3.5 px-4">Roll Number</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Father Name</th>
                      <th className="py-3.5 px-4 text-center">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrolledStudents.map((student, idx) => {
                      const currentStatus = attendanceSheet[student.id] || 'Present';
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                            {student.rollNumber}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{student.fatherName}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Present')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                  currentStatus === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Absent')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                  currentStatus === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Late')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                  currentStatus === 'Late'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                Late
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT PERCENTAGE SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Filter Course:</span>
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="all">All Courses</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.courseCode} - {c.courseName}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-500">
              * Minimum 75% required by HEC rules for examination eligibility
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {loadingHistory ? (
              <LoadingSpinner message="Calculating student attendance percentages..." />
            ) : summaries.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No attendance summaries available"
                  description="Mark attendance sessions first to calculate attendance percentages."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Roll Number</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Course</th>
                      <th className="py-3.5 px-4 text-center">Total Classes</th>
                      <th className="py-3.5 px-4 text-center">Present</th>
                      <th className="py-3.5 px-4 text-center">Absent</th>
                      <th className="py-3.5 px-4 text-center">Late</th>
                      <th className="py-3.5 px-4 text-center">Attendance %</th>
                      <th className="py-3.5 px-4 text-right">Eligibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summaries.map((sum, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                          {sum.rollNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{sum.studentName}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-700">{sum.courseCode}</span> - {sum.courseName}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">{sum.totalClasses}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">{sum.present}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-rose-600">{sum.absent}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-amber-600">{sum.late}</td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <span className="font-black text-slate-900">{sum.percentage}%</span>
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  sum.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, sum.percentage)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Badge variant={sum.percentage >= 75 ? 'success' : 'danger'}>
                            {sum.percentage >= 75 ? 'Eligible for Exams' : 'Short Attendance'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RAW LOGS */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder="Search logs by student name or roll number..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {loadingHistory ? (
              <LoadingSpinner message="Loading attendance logs..." />
            ) : attendanceHistory.length === 0 ? (
              <EmptyState title="No logs found" description="No attendance records recorded yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Log ID</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Roll Number</th>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Course</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Marked By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceHistory
                      .filter(a => {
                        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
                        if (!historySearch.trim()) return true;
                        const q = historySearch.toLowerCase();
                        return (
                          a.studentName?.toLowerCase().includes(q) ||
                          a.rollNumber?.toLowerCase().includes(q)
                        );
                      })
                      .map(att => (
                        <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{att.attendanceId}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">{att.date}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{att.rollNumber}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{att.studentName}</td>
                          <td className="py-3.5 px-4 text-slate-700">{att.courseCode} - {att.courseName}</td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                att.status === 'Present'
                                  ? 'success'
                                  : att.status === 'Late'
                                  ? 'warning'
                                  : 'danger'
                              }
                            >
                              {att.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{att.markedBy}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
