import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building2,
  Calendar,
  Award,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Faculty, Department } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  'Visiting Lecturer'
];

export const FacultyPage: React.FC = () => {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialForm = {
    employeeId: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    email: '',
    phone: '0300-1234567',
    designation: 'Lecturer' as Faculty['designation'],
    departmentId: '',
    qualification: 'MS Computer Science',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active' as Faculty['status']
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facRes, deptsRes] = await Promise.all([
        api.getFaculty({
          search,
          department: departmentFilter,
          designation: designationFilter
        }),
        api.getDepartments()
      ]);
      setFacultyList(facRes.faculty);
      setDepartments(deptsRes.departments);
      if (!formData.departmentId && deptsRes.departments.length > 0) {
        setFormData(prev => ({ ...prev, departmentId: deptsRes.departments[0].id }));
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to load faculty', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, departmentFilter, designationFilter]);

  const handleOpenAdd = () => {
    setSelectedFaculty(null);
    setFormData({
      ...initialForm,
      departmentId: departments[0]?.id || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fac: Faculty) => {
    setSelectedFaculty(fac);
    setFormData({
      employeeId: fac.employeeId,
      firstName: fac.firstName,
      lastName: fac.lastName,
      fatherName: fac.fatherName,
      email: fac.email,
      phone: fac.phone,
      designation: fac.designation,
      departmentId: fac.departmentId,
      qualification: fac.qualification,
      joiningDate: fac.joiningDate,
      status: fac.status
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (fac: Faculty) => {
    setSelectedFaculty(fac);
    setIsDeleteOpen(true);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.employeeId.trim()) errors.employeeId = 'Employee ID is required (e.g. GU-EMP-101).';
    if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!formData.email.trim()) errors.email = 'Valid academic email is required.';
    if (!formData.departmentId) errors.departmentId = 'Department is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (selectedFaculty) {
        const res = await api.updateFaculty(selectedFaculty.id, formData);
        showToast(res.message, 'success');
      } else {
        const res = await api.createFaculty(formData);
        showToast(res.message, 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to save faculty member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFaculty) return;
    setIsSubmitting(true);
    try {
      const res = await api.deleteFaculty(selectedFaculty.id);
      showToast(res.message, 'success');
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete faculty member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Faculty & Staff Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Academic professors, researchers, and instructors across all Ghazi University departments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Reload faculty"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-700/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty Member</span>
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
            placeholder="Search by Faculty Name, Employee ID (GU-EMP-101), or Email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-slate-50/50"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={e => setDepartmentFilter(e.target.value)}
          className="w-full md:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none"
        >
          <option value="all">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>
              {d.departmentCode} - {d.departmentName.replace('Department of ', '')}
            </option>
          ))}
        </select>

        <select
          value={designationFilter}
          onChange={e => setDesignationFilter(e.target.value)}
          className="w-full md:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none"
        >
          <option value="all">All Designations</option>
          {DESIGNATIONS.map(d => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Retrieving faculty records..." />
      ) : facultyList.length === 0 ? (
        <EmptyState
          title="No faculty members found"
          description="No faculty records match your criteria."
          actionText={isAdmin ? 'Add Faculty Member' : undefined}
          onAction={isAdmin ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {facultyList.map(fac => {
            const dept = departments.find(d => d.id === fac.departmentId);
            return (
              <div
                key={fac.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-base flex items-center justify-center border border-indigo-100">
                        {fac.firstName.charAt(0)}{fac.lastName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {fac.firstName} {fac.lastName}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">{fac.employeeId}</span>
                      </div>
                    </div>
                    <Badge variant={fac.status === 'Active' ? 'success' : 'warning'}>
                      {fac.status}
                    </Badge>
                  </div>

                  <div className="mt-3 inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold">
                    {fac.designation}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-semibold text-slate-800">{dept?.departmentName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Qualification:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[170px]" title={fac.qualification}>
                        {fac.qualification}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-mono text-blue-700 truncate max-w-[180px]">{fac.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Joining Date:</span>
                      <span className="text-slate-600">{fac.joiningDate}</span>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(fac)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 text-xs font-medium flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleOpenDelete(fac)}
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
        title={selectedFaculty ? 'Edit Faculty Record' : 'Register Faculty Member'}
        subtitle="Staff appointment profile and departmental assignment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="e.g. GU-EMP-111"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono uppercase ${
                  formErrors.employeeId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {formErrors.employeeId && <p className="text-[11px] text-rose-600 mt-1">{formErrors.employeeId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Dr. Muhammad"
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  formErrors.firstName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Imran"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Father Name
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="e.g. Muhammad Aslam"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="faculty@gu.edu.pk"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0300-1234567"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation *
              </label>
              <select
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                {DESIGNATIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Highest Qualification
              </label>
              <input
                type="text"
                value={formData.qualification}
                onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. Ph.D. Computer Science (FAST-NUCES)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Joining
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
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
              {isSubmitting ? 'Saving...' : selectedFaculty ? 'Update Faculty' : 'Save Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Faculty Member?"
        message={`Are you sure you want to delete ${selectedFaculty?.firstName} ${selectedFaculty?.lastName} (${selectedFaculty?.employeeId})?`}
        confirmText="Delete Record"
        isLoading={isSubmitting}
      />
    </div>
  );
};
