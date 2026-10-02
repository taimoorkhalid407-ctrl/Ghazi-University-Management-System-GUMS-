/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { StudentsPage } from './pages/StudentsPage.tsx';
import { FacultyPage } from './pages/FacultyPage.tsx';
import { DepartmentsPage } from './pages/DepartmentsPage.tsx';
import { CoursesPage } from './pages/CoursesPage.tsx';
import { EnrollmentsPage } from './pages/EnrollmentsPage.tsx';
import { AttendancePage } from './pages/AttendancePage.tsx';
import { MarksPage } from './pages/MarksPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { StudentProfilePage } from './pages/StudentProfilePage.tsx';
import { LoadingSpinner } from './components/common/LoadingSpinner.tsx';
import { ShieldAlert } from 'lucide-react';

function MainApp() {
  const { currentUser, role, isLoading, isAdmin, isTeacher, isStudent } = useAuth();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync default tab when role changes
  useEffect(() => {
    if (isStudent) {
      setCurrentTab('student-profile');
    } else {
      setCurrentTab('dashboard');
    }
  }, [role, isStudent]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner message="Initializing Ghazi University ERP System..." size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  // Role Access Control Gate (TC-22)
  const handleTabChange = (targetTab: string) => {
    if (isStudent && !['student-profile', 'student-courses', 'student-attendance', 'student-results'].includes(targetTab)) {
      showToast('Unauthorized access: Students can only view their own academic records.', 'error');
      setCurrentTab('student-profile');
      return;
    }

    if (isTeacher && ['faculty', 'departments', 'settings'].includes(targetTab)) {
      showToast('Restricted: Administrative permissions required for this module.', 'error');
      setCurrentTab('dashboard');
      return;
    }

    setCurrentTab(targetTab);
  };

  const renderContent = () => {
    // Defense-in-depth: Unauthorized tab access fallback
    if (isStudent && !['student-profile', 'student-courses', 'student-attendance', 'student-results'].includes(currentTab)) {
      return (
        <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-sm text-center max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Access Restricted</h3>
          <p className="text-sm text-slate-600 mb-4">
            Students are restricted to personal academic information only. You do not have permissions to access administrative or instructor modules.
          </p>
          <button
            onClick={() => setCurrentTab('student-profile')}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold"
          >
            Return to Student Portal
          </button>
        </div>
      );
    }

    if (isTeacher && ['faculty', 'departments', 'settings'].includes(currentTab)) {
      return (
        <div className="bg-white p-8 rounded-2xl border border-amber-200 shadow-sm text-center max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Administrative Privileges Required</h3>
          <p className="text-sm text-slate-600 mb-4">
            Faculty members have access to academic operations (courses, attendance, marks, rosters). Institutional configuration is restricted to Central Administration.
          </p>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleTabChange} />;
      case 'students':
        return <StudentsPage />;
      case 'faculty':
        return <FacultyPage />;
      case 'departments':
        return <DepartmentsPage />;
      case 'courses':
        return <CoursesPage />;
      case 'enrollments':
        return <EnrollmentsPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'marks':
        return <MarksPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;

      // Student Portal Views
      case 'student-profile':
        return <StudentProfilePage initialTab="profile" />;
      case 'student-courses':
        return <StudentProfilePage initialTab="courses" />;
      case 'student-attendance':
        return <StudentProfilePage initialTab="attendance" />;
      case 'student-results':
        return <StudentProfilePage initialTab="results" />;

      default:
        return <DashboardPage onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
