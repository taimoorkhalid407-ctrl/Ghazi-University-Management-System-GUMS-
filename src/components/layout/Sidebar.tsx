import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  UserCheck,
  CalendarCheck,
  Award,
  FileBarChart,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UniversityLogo } from '../common/UniversityLogo.tsx';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isOpen,
  onCloseMobile
}) => {
  const { currentUser, role, logout, isAdmin, isTeacher, isStudent } = useAuth();

  // Navigation items defined by role
  const getNavItems = () => {
    if (isStudent) {
      return [
        { id: 'student-profile', label: 'My Profile', icon: User },
        { id: 'student-courses', label: 'Enrolled Courses', icon: BookOpen },
        { id: 'student-attendance', label: 'My Attendance', icon: CalendarCheck },
        { id: 'student-results', label: 'Marks & Results', icon: Award }
      ];
    }

    if (isTeacher) {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
        { id: 'marks', label: 'Marks & Results', icon: Award },
        { id: 'reports', label: 'Reports', icon: FileBarChart }
      ];
    }

    // Admin has complete access
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'faculty', label: 'Faculty', icon: GraduationCap },
      { id: 'departments', label: 'Departments', icon: Building2 },
      { id: 'courses', label: 'Courses', icon: BookOpen },
      { id: 'enrollments', label: 'Enrollments', icon: UserCheck },
      { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
      { id: 'marks', label: 'Marks & Results', icon: Award },
      { id: 'reports', label: 'Reports', icon: FileBarChart },
      { id: 'settings', label: 'Settings', icon: Settings }
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3.5">
          <UniversityLogo
            size="medium"
            priority
            className="w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-base tracking-tight text-white leading-tight truncate">
              Ghazi University
            </h1>
            <p className="text-xs text-slate-400 font-normal truncate mt-0.5">
              Dera Ghazi Khan, Punjab
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                GUMS
              </span>
              <span className="text-[9px] uppercase font-semibold text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700/60">
                ERP Portal
              </span>
            </div>
          </div>
        </div>

        {/* Current Role Banner */}
        <div className="px-6 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Authenticated Portal</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
              isAdmin
                ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                : isTeacher
                ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
            }`}
          >
            {role}
          </span>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold text-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-900/40 rounded-lg transition-colors border border-rose-900/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
