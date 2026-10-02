import React, { useState } from 'react';
import {
  Menu,
  Bell,
  CheckCircle,
  Database,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UniversityLogo } from '../common/UniversityLogo.tsx';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  currentTab: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar, currentTab }) => {
  const { currentUser, role, logout, demoLogin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Fall 2024 Final Exams', text: 'Date sheet for BSCS & BSSE announced by Controller.', time: '2h ago' },
    { id: 2, title: 'Attendance Audit', text: 'Monthly 75% eligibility report generated for CS-301.', time: '5h ago' },
    { id: 3, title: 'Department Meeting', text: 'Faculty Board meeting scheduled in Main Auditorium.', time: '1d ago' }
  ];

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Executive Academic Dashboard';
      case 'students': return 'Student Information System (SIS)';
      case 'faculty': return 'Faculty & Staff Registry';
      case 'departments': return 'Academic Departments';
      case 'courses': return 'Curriculum & Courses';
      case 'enrollments': return 'Course Enrollment Registry';
      case 'attendance': return 'Daily Attendance Management';
      case 'marks': return 'Examinations, Marks & Results';
      case 'reports': return 'Academic Reports & Analytics';
      case 'settings': return 'System Configuration';
      case 'student-profile': return 'Student Personal Profile';
      case 'student-courses': return 'My Registered Courses';
      case 'student-attendance': return 'My Attendance Record';
      case 'student-results': return 'Official Academic Transcript';
      default: return 'Ghazi University ERP';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="lg:hidden">
          <UniversityLogo size="xs" className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {getPageTitle(currentTab)}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Ghazi University Management System • Main Campus, Dera Ghazi Khan
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {(showNotifications || showRoleMenu) && (
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => {
              setShowNotifications(false);
              setShowRoleMenu(false);
            }}
          />
        )}

        {/* Database Status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-medium">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Persistent DB Online</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Academic Notifications</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">3 New</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                    <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{n.text}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Quick Switch Menu (for convenient testing of TC-01, TC-21, TC-22) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUser?.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">{role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
              </div>

              <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Switch Role Demo
              </div>
              <button
                onClick={async () => {
                  setShowRoleMenu(false);
                  await demoLogin('admin');
                }}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg mx-1 flex items-center justify-between ${
                  role === 'admin' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Admin (Central Administrator)</span>
                {role === 'admin' && <CheckCircle className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={async () => {
                  setShowRoleMenu(false);
                  await demoLogin('teacher');
                }}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg mx-1 flex items-center justify-between ${
                  role === 'teacher' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Teacher (Dr. Muhammad Imran)</span>
                {role === 'teacher' && <CheckCircle className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={async () => {
                  setShowRoleMenu(false);
                  await demoLogin('student');
                }}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg mx-1 flex items-center justify-between ${
                  role === 'student' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Student (M. Abdullah)</span>
                {role === 'student' && <CheckCircle className="w-3.5 h-3.5" />}
              </button>

              <div className="border-t border-slate-100 mt-2 pt-1">
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
