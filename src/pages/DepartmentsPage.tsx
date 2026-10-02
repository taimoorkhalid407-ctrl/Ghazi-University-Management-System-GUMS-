import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Mail, Phone, RefreshCw } from 'lucide-react';
import { api } from '../services/api.ts';
import { Department } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const DepartmentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    departmentCode: '',
    departmentName: '',
    hodName: '',
    email: '',
    phone: '064-9260100',
    status: 'Active' as 'Active' | 'Inactive',
    description: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.getDepartments();
      setDepartments(res.departments);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to fetch departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setSelectedDept(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setSelectedDept(dept);
    setFormData({
      departmentCode: dept.departmentCode,
      departmentName: dept.departmentName,
      hodName: dept.hodName,
      email: dept.email,
      phone: dept.phone,
      status: dept.status,
      description: dept.description || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (dept: Department) => {
    setSelectedDept(dept);
    setIsDeleteOpen(true);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.departmentCode.trim()) errors.departmentCode = 'Department code is required.';
    if (!formData.departmentName.trim()) errors.departmentName = 'Department name is required.';
    if (!formData.hodName.trim()) errors.hodName = 'Head of Department name is required.';
    if (!formData.email.trim()) errors.email = 'Department email is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (selectedDept) {
        const res = await api.updateDepartment(selectedDept.id, formData);
        showToast(res.message, 'success');
      } else {
        const res = await api.createDepartment(formData);
        showToast(res.message, 'success');
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to save department', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDept) return;
    setIsSubmitting(true);
    try {
      const res = await api.deleteDepartment(selectedDept.id);
      showToast(res.message, 'success');
      setIsDeleteOpen(false);
      fetchDepartments();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete department', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Departments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure faculties, academic schools, and designated Heads of Department (HOD)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDepartments}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Reload departments"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-700/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <LoadingSpinner message="Loading academic departments..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map(dept => (
            <div
              key={dept.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-bold text-base flex items-center justify-center border border-blue-100">
                    {dept.departmentCode}
                  </div>
                  <Badge variant={dept.status === 'Active' ? 'success' : 'neutral'}>
                    {dept.status}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{dept.departmentName}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dept.description || 'Undergraduate and postgraduate research faculty.'}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Head of Department:</span>
                    <span className="font-semibold text-slate-800">{dept.hodName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email:
                    </span>
                    <span className="font-mono text-blue-700">{dept.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone:
                    </span>
                    <span className="font-mono text-slate-700">{dept.phone}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 text-xs font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleOpenDelete(dept)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDept ? 'Edit Academic Department' : 'Create Academic Department'}
        subtitle="Configure department credentials and assigned administration"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department Code *
              </label>
              <input
                type="text"
                value={formData.departmentCode}
                onChange={e => setFormData({ ...formData, departmentCode: e.target.value })}
                placeholder="e.g. CS"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold uppercase ${
                  formErrors.departmentCode ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {formErrors.departmentCode && <p className="text-[11px] text-rose-600 mt-1">{formErrors.departmentCode}</p>}
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
              Department Name *
            </label>
            <input
              type="text"
              value={formData.departmentName}
              onChange={e => setFormData({ ...formData, departmentName: e.target.value })}
              placeholder="e.g. Department of Computer Science"
              className={`w-full px-3 py-2 rounded-xl border text-xs ${
                formErrors.departmentName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
            {formErrors.departmentName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.departmentName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Head of Department (HOD) *
            </label>
            <input
              type="text"
              value={formData.hodName}
              onChange={e => setFormData({ ...formData, hodName: e.target.value })}
              placeholder="e.g. Dr. Muhammad Imran"
              className={`w-full px-3 py-2 rounded-xl border text-xs ${
                formErrors.hodName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
            {formErrors.hodName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.hodName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="cs@gu.edu.pk"
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  formErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {formErrors.email && <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Contact
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="064-9260100"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Objectives
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Overview of academic programs offered..."
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
              {isSubmitting ? 'Saving...' : selectedDept ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department?"
        message={`Are you sure you want to delete ${selectedDept?.departmentName}? Departments cannot be removed if active students are assigned.`}
        confirmText="Delete Department"
        isLoading={isSubmitting}
      />
    </div>
  );
};
