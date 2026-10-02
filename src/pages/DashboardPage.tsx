import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  Award,
  TrendingUp,
  UserCheck,
  ArrowUpRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../services/api.ts';
import { DashboardStats } from '../types/index.ts';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { UniversityLogo } from '../components/common/UniversityLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { currentUser, role } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: unknown) {
      console.error('Failed to load stats:', err);
      setError(err instanceof Error ? err.message : 'Unable to load statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating real-time academic indicators from database..." />;
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-200">
        <p className="text-sm font-semibold text-rose-600 mb-3">{error || 'Failed to load dashboard'}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UniversityLogo
              size="medium"
              priority
              className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 drop-shadow-sm"
            />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-200 mb-2 border border-white/10">
                <Building2 className="w-3.5 h-3.5" />
                <span>Ghazi University Main Campus, DG Khan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {currentUser?.name}
              </h2>
              <p className="text-sm text-blue-100/90 max-w-2xl mt-0.5">
                Academic operations center. Real-time persistent records for students, faculty, attendance, and exam grading.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              title="Refresh database numbers"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 flex items-center gap-2 text-xs font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Stats</span>
            </button>

            {role === 'admin' && (
              <button
                onClick={() => onNavigate('students')}
                className="px-4 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 transition-colors font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Student</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (4 main metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs text-blue-700 font-medium flex items-center gap-0.5">
              Browse <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-900">{stats.totalStudents}</h3>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {stats.activeStudents} Active
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Male: <strong className="text-slate-700">{stats.maleStudents}</strong></span>
            <span>Female: <strong className="text-slate-700">{stats.femaleStudents}</strong></span>
          </div>
        </div>

        {/* Total Faculty */}
        <div
          onClick={() => onNavigate('faculty')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs text-indigo-700 font-medium flex items-center gap-0.5">
              Browse <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty Members</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-900">{stats.totalFaculty}</h3>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              Full-time
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            All departments represented
          </div>
        </div>

        {/* Total Departments */}
        <div
          onClick={() => onNavigate('departments')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-xs text-purple-700 font-medium flex items-center gap-0.5">
              Browse <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-900">{stats.totalDepartments}</h3>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
              Accredited
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            CS, IT, AI, SE, BBA, MATH, etc.
          </div>
        </div>

        {/* Total Courses */}
        <div
          onClick={() => onNavigate('courses')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs text-amber-700 font-medium flex items-center gap-0.5">
              Browse <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Offered Courses</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-900">{stats.totalCourses}</h3>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            Curriculum aligned with HEC Pakistan
          </div>
        </div>
      </div>

      {/* Secondary Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Attendance</p>
              <h4 className="text-xl font-black text-slate-900 mt-0.5">{stats.averageAttendance}%</h4>
              <p className="text-[11px] text-slate-400">Calculated from all marked lecture sessions</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Manage
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Academic GPA</p>
              <h4 className="text-xl font-black text-slate-900 mt-0.5">{stats.averageGpa} / 4.00</h4>
              <p className="text-[11px] text-slate-400">Derived from recorded examination marks</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('marks')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Review Marks
          </button>
        </div>
      </div>

      {/* 4 Interactive Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Students by Department */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Students by Department</h4>
              <p className="text-xs text-slate-500">Distribution across 8 academic faculties</p>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Live DB
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} Students`, 'Enrolled']}
                  labelFormatter={(code) => {
                    const dept = stats.departmentStats.find(d => d.code === code);
                    return dept ? `${dept.code} - ${dept.name}` : code;
                  }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="studentCount" fill="#1e40af" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Student Enrollment Statistics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Student Enrollment Trend</h4>
              <p className="text-xs text-slate-500">Student count across cohorts & semesters</p>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Cohorts
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.enrollmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#enrollmentGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Attendance Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Class Attendance Distribution</h4>
              <p className="text-xs text-slate-500">Breakdown of Present, Absent, and Late records</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Audited
            </span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.attendanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.attendanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} records`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs">
            {stats.attendanceDistribution.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: GPA/Performance Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">GPA & Grade Performance</h4>
              <p className="text-xs text-slate-500">Student count by academic letter grade</p>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Semester Curve
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.gpaDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="grade" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} Students`, 'Achieved']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
