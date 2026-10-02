import React, { useState } from 'react';
import {
  Settings,
  Database,
  RefreshCw,
  Shield,
  GraduationCap,
  User,
  CheckCircle,
  Building,
  Server,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api.ts';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { demoLogin, role } = useAuth();

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [lastResetStats, setLastResetStats] = useState<any>(null);

  const handleResetSeed = async () => {
    setIsResetting(true);
    try {
      const res = await api.resetSeed();
      setLastResetStats(res.stats);
      showToast(res.message, 'success');
      setIsResetDialogOpen(false);
    } catch (err: unknown) {
      showToast('Failed to reset database.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Configuration & Maintenance</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Ghazi University Management System (GUMS) enterprise ERP administration
        </p>
      </div>

      {/* Database Maintenance Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Academic Database State</h3>
            <p className="text-xs text-slate-500">Persistent storage synchronized with server disk store</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Status</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Connected & Healthy
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Storage Engine</span>
            <span className="font-bold text-slate-800 text-sm">Atomic JSON Store (Disk)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Campus Node</span>
            <span className="font-bold text-slate-800 text-sm">DG Khan Server Cluster</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-amber-950 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-700" />
              Reset & Reseed Initial Realistic Dataset
            </h4>
            <p className="text-amber-800 mt-1">
              Restores 32 Pakistani students, 10 faculty, 8 departments, 15 courses, 50+ enrollments, attendance, and exam marks.
            </p>
          </div>
          <button
            onClick={() => setIsResetDialogOpen(true)}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
          >
            Reset / Re-Seed Database
          </button>
        </div>

        {lastResetStats && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs">
            <div className="font-bold mb-1">Database successfully reseeded with:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 mt-2">
              <div>Students: <strong>{lastResetStats.students}</strong></div>
              <div>Faculty: <strong>{lastResetStats.faculty}</strong></div>
              <div>Departments: <strong>{lastResetStats.departments}</strong></div>
              <div>Courses: <strong>{lastResetStats.courses}</strong></div>
              <div>Enrollments: <strong>{lastResetStats.enrollments}</strong></div>
              <div>Attendance: <strong>{lastResetStats.attendance}</strong></div>
              <div>Marks: <strong>{lastResetStats.marks}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Role Verification Directory (TC-01, TC-21, TC-22) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Accounts</h3>
            <p className="text-xs text-slate-500">Test credentials for academic manual verification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Admin */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-all bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                Central Admin
              </span>
              <Shield className="w-4 h-4 text-purple-600" />
            </div>
            <div className="space-y-1 text-xs text-slate-600 mb-4">
              <p>Email: <strong className="font-mono text-slate-900">admin@gu.edu.pk</strong></p>
              <p>Password: <strong className="font-mono text-slate-900">Admin@123</strong></p>
              <p className="text-[11px] text-slate-400">Full CRUD privileges across all 8 modules.</p>
            </div>
            <button
              onClick={() => demoLogin('admin')}
              className="w-full py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Switch to Admin
            </button>
          </div>

          {/* Teacher */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                Academic Faculty
              </span>
              <GraduationCap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="space-y-1 text-xs text-slate-600 mb-4">
              <p>Email: <strong className="font-mono text-slate-900">imran@gu.edu.pk</strong></p>
              <p>Password: <strong className="font-mono text-slate-900">Teacher@123</strong></p>
              <p className="text-[11px] text-slate-400">Access to Students, Courses, Attendance & Marks.</p>
            </div>
            <button
              onClick={() => demoLogin('teacher')}
              className="w-full py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Switch to Teacher
            </button>
          </div>

          {/* Student */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Enrolled Student
              </span>
              <User className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-1 text-xs text-slate-600 mb-4">
              <p>Email: <strong className="font-mono text-slate-900">abdullah@gu.edu.pk</strong></p>
              <p>Password: <strong className="font-mono text-slate-900">Student@123</strong></p>
              <p className="text-[11px] text-slate-400">Restricted strictly to personal profile, courses, and marks.</p>
            </div>
            <button
              onClick={() => demoLogin('student')}
              className="w-full py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Switch to Student
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleResetSeed}
        title="Reset & Reseed Academic Records?"
        message="This will overwrite current edits with the pristine 32-student, 10-faculty Ghazi University dataset. Are you sure you want to proceed?"
        confirmText="Confirm Database Reseed"
        isLoading={isResetting}
      />
    </div>
  );
};
