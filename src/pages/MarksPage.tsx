import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
  Printer,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.ts';
import { MarkRecord, Course, Student } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const MarksPage: React.FC = () => {
  const { showToast } = useToast();
  const { isAdmin, isTeacher } = useAuth();

  const [marksList, setMarksList] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [courseFilter, setCourseFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [selectedMark, setSelectedMark] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialForm = {
    studentId: '',
    courseId: '',
    quizMarks: 12,
    assignmentMarks: 8,
    midtermMarks: 20,
    finalMarks: 32,
    practicalMarks: 8,
    academicSemester: 'Spring 2024'
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [marksRes, crsRes, stuRes] = await Promise.all([
        api.getMarks({
          courseId: courseFilter !== 'all' ? courseFilter : undefined,
          search
        }),
        api.getCourses(),
        api.getStudents()
      ]);

      setMarksList(marksRes);
      setCourses(crsRes.courses);
      setStudents(stuRes.students);

      if (!formData.studentId && stuRes.students.length > 0) {
        setFormData(prev => ({
          ...prev,
          studentId: stuRes.students[0].id,
          courseId: crsRes.courses[0]?.id || ''
        }));
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to load examination marks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseFilter, search]);

  const handleOpenAdd = () => {
    setSelectedMark(null);
    setFormData({
      studentId: students[0]?.id || '',
      courseId: courses[0]?.id || '',
      quizMarks: 12,
      assignmentMarks: 8,
      midtermMarks: 20,
      finalMarks: 32,
      practicalMarks: 8,
      academicSemester: 'Spring 2024'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mark: any) => {
    setSelectedMark(mark);
    setFormData({
      studentId: mark.studentId,
      courseId: mark.courseId,
      quizMarks: mark.quizMarks,
      assignmentMarks: mark.assignmentMarks,
      midtermMarks: mark.midtermMarks,
      finalMarks: mark.finalMarks,
      practicalMarks: mark.practicalMarks,
      academicSemester: mark.academicSemester || 'Spring 2024'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (mark: any) => {
    setSelectedMark(mark);
    setIsDeleteOpen(true);
  };

  const handleOpenTranscript = (mark: any) => {
    setSelectedMark(mark);
    setIsTranscriptOpen(true);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.studentId) errors.studentId = 'Student selection is required.';
    if (!formData.courseId) errors.courseId = 'Course selection is required.';

    if (formData.quizMarks < 0 || formData.quizMarks > 15) errors.quizMarks = 'Max 15 marks allowed.';
    if (formData.assignmentMarks < 0 || formData.assignmentMarks > 10) errors.assignmentMarks = 'Max 10 marks allowed.';
    if (formData.midtermMarks < 0 || formData.midtermMarks > 25) errors.midtermMarks = 'Max 25 marks allowed.';
    if (formData.finalMarks < 0 || formData.finalMarks > 40) errors.finalMarks = 'Max 40 marks allowed.';
    if (formData.practicalMarks < 0 || formData.practicalMarks > 10) errors.practicalMarks = 'Max 10 marks allowed.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (selectedMark) {
        const res = await api.updateMark(selectedMark.id, formData);
        showToast(res.message, 'success');
      } else {
        const res = await api.createMark(formData);
        showToast(res.message, 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to record examination marks.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMark) return;
    setIsSubmitting(true);
    try {
      const res = await api.deleteMark(selectedMark.id);
      showToast(res.message, 'success');
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to delete mark record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview derived values in the form
  const computedTotal =
    (Number(formData.quizMarks) || 0) +
    (Number(formData.assignmentMarks) || 0) +
    (Number(formData.midtermMarks) || 0) +
    (Number(formData.finalMarks) || 0) +
    (Number(formData.practicalMarks) || 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Examinations, Marks & Results</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated GPA derivation: Quiz (15) + Assignment (10) + Midterm (25) + Final (40) + Practical (10)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Reload marks"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {(isAdmin || isTeacher) && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-700/20"
            >
              <Plus className="w-4 h-4" />
              <span>Record Assessment Marks</span>
            </button>
          )}
        </div>
      </div>

      {/* Academic Disclaimer Note */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center justify-between">
        <span>
          <strong>Notice:</strong> Grading scale and GPA calculations (A+ = 4.0, A = 3.7, B+ = 3.3, B = 3.0, C+ = 2.5, C = 2.0, D = 1.0, F = 0.0) follow Ghazi University academic project criteria.
        </span>
        <span className="font-semibold text-[11px] bg-blue-200/60 px-2 py-0.5 rounded">HEC Standard</span>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search results by Student Name, Roll Number, or Course..."
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
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Calculating GPA & grades from database..." />
        ) : marksList.length === 0 ? (
          <EmptyState
            title="No examination marks recorded"
            description="Record student scores for quiz, midterm, or final examinations."
            actionText={(isAdmin || isTeacher) ? 'Record Assessment Marks' : undefined}
            onAction={(isAdmin || isTeacher) ? handleOpenAdd : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Roll Number</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-3 text-center">Quiz (15)</th>
                  <th className="py-3.5 px-3 text-center">Assign (10)</th>
                  <th className="py-3.5 px-3 text-center">Mid (25)</th>
                  <th className="py-3.5 px-3 text-center">Final (40)</th>
                  <th className="py-3.5 px-3 text-center">Prac (10)</th>
                  <th className="py-3.5 px-3 text-center">Total (100)</th>
                  <th className="py-3.5 px-3 text-center">Grade</th>
                  <th className="py-3.5 px-3 text-center">GPA</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marksList.map(m => (
                  <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                      {m.rollNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{m.studentName}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{m.courseCode}</span>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{m.courseName}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">{m.quizMarks}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{m.assignmentMarks}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{m.midtermMarks}</td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold">{m.finalMarks}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{m.practicalMarks}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-blue-950 bg-blue-50/50">
                      {m.totalMarks}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`font-black px-2 py-0.5 rounded text-xs ${
                          m.grade.startsWith('A')
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.grade.startsWith('B')
                            ? 'bg-blue-100 text-blue-800'
                            : m.grade.startsWith('C')
                            ? 'bg-amber-100 text-amber-800'
                            : m.grade === 'D'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {m.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-slate-900">
                      {m.gpa.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenTranscript(m)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                          title="Print official result card"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(isAdmin || isTeacher) && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(m)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50"
                              title="Edit marks"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(m)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete marks"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Assessment Marks Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMark ? 'Edit Examination Marks' : 'Record Assessment Marks'}
        subtitle="Automatic derivations: Total Marks, Percentage, Academic Letter Grade, and GPA"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student *
              </label>
              <select
                value={formData.studentId}
                disabled={!!selectedMark}
                onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs disabled:bg-slate-100"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.rollNumber} - {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course *
              </label>
              <select
                value={formData.courseId}
                disabled={!!selectedMark}
                onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs disabled:bg-slate-100"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.courseCode} - {c.courseName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Assessment Breakdown
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Quiz (Max 15)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={formData.quizMarks}
                  onChange={e => setFormData({ ...formData, quizMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
                {formErrors.quizMarks && <p className="text-[10px] text-rose-600">{formErrors.quizMarks}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Assign (Max 10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.assignmentMarks}
                  onChange={e => setFormData({ ...formData, assignmentMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Midterm (Max 25)
                </label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={formData.midtermMarks}
                  onChange={e => setFormData({ ...formData, midtermMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Final (Max 40)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={formData.finalMarks}
                  onChange={e => setFormData({ ...formData, finalMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Practical (Max 10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.practicalMarks}
                  onChange={e => setFormData({ ...formData, practicalMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Real-time Calculation Indicator */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Calculated Total Score:</span>
              <div className="flex items-center gap-3">
                <span className="text-base font-black text-blue-900">{computedTotal} / 100</span>
                <span className="text-xs font-bold text-slate-500">({computedTotal}%)</span>
              </div>
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
              {isSubmitting ? 'Computing & Saving...' : 'Save Marks'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Result Card / Transcript Modal */}
      <Modal
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        title="Official Examination Transcript"
        subtitle="Ghazi University Examination Department"
        maxWidth="lg"
      >
        {selectedMark && (
          <div className="space-y-6">
            <div className="border border-slate-300 p-6 rounded-2xl bg-white shadow-xs">
              <div className="text-center pb-4 border-b border-slate-200">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Ghazi University, Dera Ghazi Khan
                </h3>
                <p className="text-xs text-slate-500">Controller of Examinations • Official Grade Slip</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200">
                <div>
                  <span className="text-slate-400 block">Student Name:</span>
                  <span className="font-bold text-slate-900">{selectedMark.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Roll Number:</span>
                  <span className="font-mono font-bold text-blue-900">{selectedMark.rollNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Course Title:</span>
                  <span className="font-bold text-slate-800">{selectedMark.courseName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Course Code:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedMark.courseCode}</span>
                </div>
              </div>

              <div className="py-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold text-left">
                      <th className="pb-2">Evaluation Component</th>
                      <th className="pb-2 text-right">Max Marks</th>
                      <th className="pb-2 text-right">Marks Obtained</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="py-1.5">Quiz Assessments</td><td className="text-right">15</td><td className="text-right font-bold">{selectedMark.quizMarks}</td></tr>
                    <tr><td className="py-1.5">Assignments & Homework</td><td className="text-right">10</td><td className="text-right font-bold">{selectedMark.assignmentMarks}</td></tr>
                    <tr><td className="py-1.5">Midterm Examination</td><td className="text-right">25</td><td className="text-right font-bold">{selectedMark.midtermMarks}</td></tr>
                    <tr><td className="py-1.5">Final Terminal Exam</td><td className="text-right">40</td><td className="text-right font-bold">{selectedMark.finalMarks}</td></tr>
                    <tr><td className="py-1.5">Practical / Lab Work</td><td className="text-right">10</td><td className="text-right font-bold">{selectedMark.practicalMarks}</td></tr>
                    <tr className="border-t-2 border-slate-900 font-bold bg-slate-50">
                      <td className="py-2">Aggregate Total</td>
                      <td className="text-right">100</td>
                      <td className="text-right text-blue-950 font-black">{selectedMark.totalMarks}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-3 text-center bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase">Percentage</span>
                  <span className="text-lg font-black text-slate-900">{selectedMark.percentage}%</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase">Letter Grade</span>
                  <span className="text-lg font-black text-blue-700">{selectedMark.grade}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase">Semester GPA</span>
                  <span className="text-lg font-black text-emerald-700">{selectedMark.gpa.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Card</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Examination Mark Record?"
        message={`Are you sure you want to delete the result of ${selectedMark?.studentName} in ${selectedMark?.courseCode}?`}
        confirmText="Confirm Delete"
        isLoading={isSubmitting}
      />
    </div>
  );
};
