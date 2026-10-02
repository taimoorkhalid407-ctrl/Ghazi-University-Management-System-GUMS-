import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Trash2, BookOpen, User, RefreshCw } from 'lucide-react';
import { api } from '../services/api.ts';
import { Student, Course, Enrollment } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const EnrollmentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [courseFilter, setCourseFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialForm = {
    studentId: '',
    courseId: '',
    semester: 1,
    academicYear: 'Spring 2024'
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrRes, stuRes, crsRes] = await Promise.all([
        api.getEnrollments({
          courseId: courseFilter !== 'all' ? courseFilter : undefined,
          semester: semesterFilter !== 'all' ? semesterFilter : undefined
        }),
        api.getStudents(),
        api.getCourses()
      ]);

      setEnrollments(enrRes.enrollments);
      setStudents(stuRes.students);
      setCourses(crsRes.courses);

      if (!formData.studentId && stuRes.students.length > 0) {
        setFormData(prev => ({
          ...prev,
          studentId: stuRes.students[0].id,
          courseId: crsRes.courses[0]?.id || ''
        }));
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to load enrollments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseFilter, semesterFilter]);

  const handleOpenAdd = () => {
    setFormData({
      studentId: students[0]?.id || '',
      courseId: courses[0]?.id || '',
      semester: 1,
      academicYear: 'Spring 2024'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (enr: any) => {
    setSelectedEnrollment(enr);
    setIsDeleteOpen(true);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.studentId) errors.studentId = 'Student selection is required.';
    if (!formData.courseId) errors.courseId = 'Course selection is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await api.createEnrollment(formData);
      showToast(res.message, 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to enroll student', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEnrollment) return;
    setIsSubmitting(true);
    try {
      const res = await api.deleteEnrollment(selectedEnrollment.id);
      showToast(res.message, 'success');
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to remove enrollment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search filter applied locally
  const filteredEnrollments = enrollments.filter(e => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.studentName?.toLowerCase().includes(q) ||
      e.rollNumber?.toLowerCase().includes(q) ||
      e.courseCode?.toLowerCase().includes(q) ||
      e.courseName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Course Enrollment Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Student course registrations and semester credit validations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Reload enrollments"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-700/20"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Student Name, Roll No, or Course..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-slate-50/50"
          />
        </div>

        <select
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
          className="w-full md:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
        >
          <option value="all">All Courses</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.courseCode} - {c.courseName}
            </option>
          ))}
        </select>

        <select
          value={semesterFilter}
          onChange={e => setSemesterFilter(e.target.value)}
          className="w-full md:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
        >
          <option value="all">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading enrollments..." />
        ) : filteredEnrollments.length === 0 ? (
          <EmptyState
            title="No enrollments found"
            description="No student enrollments found matching the criteria."
            actionText={isAdmin ? 'Enroll Student' : undefined}
            onAction={isAdmin ? handleOpenAdd : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Enrollment ID</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Session</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnrollments.map(enr => (
                  <tr key={enr.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      {enr.enrollmentId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{enr.studentName}</div>
                      <div className="font-mono text-[11px] text-blue-700">{enr.rollNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{enr.courseName}</div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {enr.courseCode} ({enr.creditHours} CH)
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                        Semester {enr.semester}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{enr.academicYear}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success">{enr.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenDelete(enr)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Drop enrollment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enroll Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enroll Student in Course"
        subtitle="Registers student for semester course examination and attendance"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Student *
            </label>
            <select
              value={formData.studentId}
              onChange={e => setFormData({ ...formData, studentId: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border text-xs ${
                formErrors.studentId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.rollNumber} - {s.firstName} {s.lastName} (Sem {s.semester})
                </option>
              ))}
            </select>
            {formErrors.studentId && <p className="text-[11px] text-rose-600 mt-1">{formErrors.studentId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Course *
            </label>
            <select
              value={formData.courseId}
              onChange={e => setFormData({ ...formData, courseId: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border text-xs ${
                formErrors.courseId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} - {c.courseName} ({c.creditHours} Credit Hours)
                </option>
              ))}
            </select>
            {formErrors.courseId && <p className="text-[11px] text-rose-600 mt-1">{formErrors.courseId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Session
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="Spring 2024"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Enrollment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Drop Enrollment?"
        message={`Are you sure you want to remove the enrollment for ${selectedEnrollment?.studentName} in ${selectedEnrollment?.courseCode}?`}
        confirmText="Confirm Drop"
        isLoading={isSubmitting}
      />
    </div>
  );
};
