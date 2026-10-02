import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit2, Trash2, GraduationCap, Building2, RefreshCw } from 'lucide-react';
import { api } from '../services/api.ts';
import { Course, Department, Faculty } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const CoursesPage: React.FC = () => {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialForm = {
    courseCode: '',
    courseName: '',
    creditHours: 3,
    departmentId: '',
    semester: 1,
    teacherId: '',
    description: '',
    status: 'Active' as 'Active' | 'Inactive'
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [crsRes, deptsRes, facRes] = await Promise.all([
        api.getCourses({
          search,
          department: departmentFilter,
          semester: semesterFilter
        }),
        api.getDepartments(),
        api.getFaculty()
      ]);
      setCourses(crsRes.courses);
      setDepartments(deptsRes.departments);
      setFaculty(facRes.faculty);

      if (!formData.departmentId && deptsRes.departments.length > 0) {
        setFormData(prev => ({
          ...prev,
          departmentId: deptsRes.departments[0].id,
          teacherId: facRes.faculty[0]?.id || ''
        }));
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, departmentFilter, semesterFilter]);

  const handleOpenAdd = () => {
    setSelectedCourse(null);
    setFormData({
      ...initialForm,
      departmentId: departments[0]?.id || '',
      teacherId: faculty[0]?.id || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (crs: Course) => {
    setSelectedCourse(crs);
    setFormData({
      courseCode: crs.courseCode,
      courseName: crs.courseName,
      creditHours: crs.creditHours,
      departmentId: crs.departmentId,
      semester: crs.semester,
      teacherId: crs.teacherId,
      description: crs.description,
      status: crs.status
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (crs: Course) => {
    setSelectedCourse(crs);
    setIsDeleteOpen(true);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.courseCode.trim()) errors.courseCode = 'Course code is required (e.g. CS-101).';
    if (!formData.courseName.trim()) errors.courseName = 'Course title is required.';
    if (!formData.departmentId) errors.departmentId = 'Department is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (selectedCourse) {
        const res = await api.updateCourse(selectedCourse.id, formData);
        showToast(res.message, 'success');
      } else {
        const res = await api.createCourse(formData);
        showToast(res.message, 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to save course', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;
    setIsSubmitting(true);
    try {
      const res = await api.deleteCourse(selectedCourse.id);
      showToast(res.message, 'success');
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to delete course', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Curriculum & Courses</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accredited course syllabus, credit hour allocations, and assigned lecturers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Reload courses"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-700/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
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
            placeholder="Search by Course Code (CS-301) or Course Name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-slate-50/50"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={e => setDepartmentFilter(e.target.value)}
          className="w-full md:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
        >
          <option value="all">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>
              {d.departmentCode} - {d.departmentName.replace('Department of ', '')}
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

      {/* Courses Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching syllabus courses..." />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="No courses match the active search filters."
          actionText={isAdmin ? 'Add Course' : undefined}
          onAction={isAdmin ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(crs => {
            const dept = departments.find(d => d.id === crs.departmentId);
            const teacher = faculty.find(f => f.id === crs.teacherId);
            return (
              <div
                key={crs.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-200">
                      {crs.courseCode}
                    </span>
                    <Badge variant={crs.status === 'Active' ? 'success' : 'neutral'}>
                      {crs.status}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{crs.courseName}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{crs.description}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-semibold text-slate-800">{dept?.departmentCode || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Credit Hours:</span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {crs.creditHours} CH
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Semester:</span>
                      <span className="font-medium text-slate-700">Semester {crs.semester}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Assigned Teacher:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                        {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(crs)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 text-xs font-medium flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleOpenDelete(crs)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCourse ? 'Edit Course' : 'Create New Course'}
        subtitle="HEC aligned course configuration and faculty assignment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                value={formData.courseCode}
                onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                placeholder="e.g. CS-101"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono uppercase font-bold ${
                  formErrors.courseCode ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {formErrors.courseCode && <p className="text-[11px] text-rose-600 mt-1">{formErrors.courseCode}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Credit Hours *
              </label>
              <select
                value={formData.creditHours}
                onChange={e => setFormData({ ...formData, creditHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                {[1, 2, 3, 4, 5].map(ch => (
                  <option key={ch} value={ch}>
                    {ch} Credit Hours
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              value={formData.courseName}
              onChange={e => setFormData({ ...formData, courseName: e.target.value })}
              placeholder="e.g. Object Oriented Programming"
              className={`w-full px-3 py-2 rounded-xl border text-xs ${
                formErrors.courseName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
            {formErrors.courseName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.courseName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department *
              </label>
              <select
                value={formData.departmentId}
                onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.departmentCode} - {d.departmentName.replace('Department of ', '')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester Offered
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Instructor (Faculty)
              </label>
              <select
                value={formData.teacherId}
                onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <option value="">Unassigned</option>
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.firstName} {f.lastName} ({f.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Outline / Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key concepts, lab components, and learning objectives..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
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
              {isSubmitting ? 'Saving...' : selectedCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Course?"
        message={`Are you sure you want to delete ${selectedCourse?.courseCode} - ${selectedCourse?.courseName}?`}
        confirmText="Delete Course"
        isLoading={isSubmitting}
      />
    </div>
  );
};
