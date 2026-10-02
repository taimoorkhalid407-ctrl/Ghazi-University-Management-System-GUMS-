import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Filter,
  User,
  GraduationCap,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Student, Department } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import { Pagination } from '../components/common/Pagination.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const PAKISTANI_CITIES = [
  'Dera Ghazi Khan',
  'Multan',
  'Lahore',
  'Muzaffargarh',
  'Rajanpur',
  'Layyah',
  'Bahawalpur',
  'Rahim Yar Khan',
  'Faisalabad',
  'Sahiwal',
  'Islamabad',
  'Rawalpindi'
];

export const StudentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('roll_asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewDetails, setViewDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialFormData = {
    rollNumber: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    gender: 'Male' as 'Male' | 'Female',
    dateOfBirth: '2003-01-15',
    cnic: '32102-1234567-1',
    email: '',
    phone: '0300-1234567',
    address: 'Block A, Model Town',
    city: 'Dera Ghazi Khan',
    province: 'Punjab',
    departmentId: '',
    program: 'BS Computer Science',
    semester: 1,
    section: 'A',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended' | 'Graduated'
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, deptsRes] = await Promise.all([
        api.getStudents({
          search,
          department: departmentFilter,
          semester: semesterFilter,
          gender: genderFilter,
          status: statusFilter,
          sort: sortBy
        }),
        api.getDepartments()
      ]);

      setStudents(studentsRes.students);
      setDepartments(deptsRes.departments);
      if (!formData.departmentId && deptsRes.departments.length > 0) {
        setFormData(prev => ({ ...prev, departmentId: deptsRes.departments[0].id }));
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, departmentFilter, semesterFilter, genderFilter, statusFilter, sortBy]);

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.rollNumber.trim()) errors.rollNumber = 'Roll number is required.';
    if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!formData.fatherName.trim()) errors.fatherName = "Father's name is required.";

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Email address is invalid.';
    }

    if (!formData.cnic.trim()) {
      errors.cnic = 'CNIC is required.';
    } else if (!/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic.trim())) {
      errors.cnic = 'CNIC must match Pakistani format: 12345-1234567-1';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^(\+92|0)?3\d{2}-?\d{7}$/.test(formData.phone.trim().replace(/\s/g, ''))) {
      errors.phone = 'Phone must be a valid Pakistani mobile number (e.g. 0300-1234567).';
    }

    if (!formData.departmentId) errors.departmentId = 'Department selection is required.';
    if (!formData.program.trim()) errors.program = 'Degree program is required.';

    if (formData.semester < 1 || formData.semester > 8) {
      errors.semester = 'Semester must be between 1 and 8.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setSelectedStudent(null);
    setFormData({
      ...initialFormData,
      departmentId: departments[0]?.id || ''
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      rollNumber: student.rollNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      fatherName: student.fatherName,
      gender: student.gender as 'Male' | 'Female',
      dateOfBirth: student.dateOfBirth,
      cnic: student.cnic,
      email: student.email,
      phone: student.phone,
      address: student.address,
      city: student.city,
      province: student.province,
      departmentId: student.departmentId,
      program: student.program,
      semester: student.semester,
      section: student.section,
      admissionDate: student.admissionDate,
      status: student.status
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenView = async (student: Student) => {
    setSelectedStudent(student);
    setIsViewOpen(true);
    setLoadingDetails(true);
    try {
      const details = await api.getStudentById(student.id);
      setViewDetails(details);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load details', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenDelete = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (selectedStudent) {
        const res = await api.updateStudent(selectedStudent.id, formData);
        showToast(res.message, 'success');
      } else {
        const res = await api.createStudent(formData);
        showToast(res.message, 'success');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to save student. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      const res = await api.deleteStudent(selectedStudent.id);
      showToast(res.message, 'success');
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Unable to delete student.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination slicing
  const totalStudents = students.length;
  const paginatedStudents = students.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Information System (SIS)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full academic registry of undergraduate and graduate students at Ghazi University
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Reload students"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-700/20"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Name, Roll No (BSCS-2022-001), Email, or Phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={e => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.departmentCode} - {d.departmentName.replace('Department of ', '')}
              </option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={semesterFilter}
            onChange={e => {
              setSemesterFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={e => {
              setGenderFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
            <option value="Graduated">Graduated</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="roll_asc">Sort: Roll No (Asc)</option>
            <option value="roll_desc">Sort: Roll No (Desc)</option>
            <option value="name_asc">Sort: Name (A-Z)</option>
            <option value="name_desc">Sort: Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching students from Firestore database..." />
        ) : paginatedStudents.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No students found"
              description="No student records match your active search or filter criteria."
              actionText={isAdmin ? 'Add New Student' : undefined}
              onAction={isAdmin ? handleOpenAdd : undefined}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Roll Number</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Father Name</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Program</th>
                    <th className="py-3.5 px-4">Semester</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.map(student => {
                    const dept = departments.find(d => d.id === student.departmentId);
                    return (
                      <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                          {student.rollNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400">{student.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{student.fatherName}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">
                            {dept ? dept.departmentCode : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 truncate max-w-[140px]" title={student.program}>
                          {student.program}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                            Sem {student.semester} - {student.section}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{student.phone}</td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              student.status === 'Active'
                                ? 'success'
                                : student.status === 'Graduated'
                                ? 'info'
                                : student.status === 'Suspended'
                                ? 'danger'
                                : 'neutral'
                            }
                          >
                            {student.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenView(student)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="View student profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(student)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                                  title="Edit student"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenDelete(student)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                  title="Delete student"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={totalStudents}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={selectedStudent ? 'Edit Student Record' : 'Register New Student'}
        subtitle={
          selectedStudent
            ? `Updating records for Roll No: ${selectedStudent.rollNumber}`
            : 'Enter complete Pakistani academic information'
        }
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                placeholder="e.g. BSCS-2024-001"
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  formErrors.rollNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.rollNumber && <p className="text-[11px] text-rose-600 mt-1">{formErrors.rollNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Muhammad"
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  formErrors.firstName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.firstName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Abdullah"
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  formErrors.lastName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.lastName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Father Name *
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="e.g. Muhammad Ashraf"
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  formErrors.fatherName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.fatherName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.fatherName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CNIC (Pakistani Format) *
              </label>
              <input
                type="text"
                value={formData.cnic}
                onChange={e => setFormData({ ...formData, cnic: e.target.value })}
                placeholder="12345-1234567-1"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${
                  formErrors.cnic ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.cnic && <p className="text-[11px] text-rose-600 mt-1">{formErrors.cnic}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@gu.edu.pk"
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  formErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.email && <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Phone *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0300-1234567"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${
                  formErrors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formErrors.phone && <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                Degree Program *
              </label>
              <input
                type="text"
                value={formData.program}
                onChange={e => setFormData({ ...formData, program: e.target.value })}
                placeholder="e.g. BS Computer Science"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Semester *
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
                  Section *
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={e => setFormData({ ...formData, section: e.target.value })}
                  placeholder="A"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
              <select
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                {PAKISTANI_CITIES.map(c => (
                  <option key={c} value={c}>
                    {c}
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
                <option value="Suspended">Suspended</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Residential Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Model Town Block B"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Saving to Database...' : selectedStudent ? 'Update Student' : 'Save Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Student Profile'}
        subtitle={selectedStudent ? `Roll Number: ${selectedStudent.rollNumber} • ${selectedStudent.program}` : ''}
        maxWidth="3xl"
      >
        {loadingDetails ? (
          <LoadingSpinner message="Retrieving student academic records..." />
        ) : viewDetails && selectedStudent ? (
          <div className="space-y-6">
            {/* Header Identity Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white font-bold text-xl flex items-center justify-center">
                  {selectedStudent.firstName.charAt(0)}{selectedStudent.lastName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedStudent.rollNumber} • {selectedStudent.studentId}
                  </p>
                  <p className="text-xs text-blue-700 font-medium">
                    {viewDetails.department?.departmentName || selectedStudent.program}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={selectedStudent.status === 'Active' ? 'success' : 'neutral'}>
                  {selectedStudent.status}
                </Badge>
                <span className="text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  Semester {selectedStudent.semester} ({selectedStudent.section})
                </span>
              </div>
            </div>

            {/* Profile Field Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-slate-400 block mb-0.5">Father's Name</span>
                <span className="font-semibold text-slate-800">{selectedStudent.fatherName}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-slate-400 block mb-0.5">CNIC Number</span>
                <span className="font-mono font-semibold text-slate-800">{selectedStudent.cnic}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-slate-400 block mb-0.5">Academic Email</span>
                <span className="font-semibold text-blue-700">{selectedStudent.email}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-slate-400 block mb-0.5">Phone Contact</span>
                <span className="font-mono font-semibold text-slate-800">{selectedStudent.phone}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-slate-400 block mb-0.5">City & Province</span>
                <span className="font-semibold text-slate-800">{selectedStudent.city}, {selectedStudent.province}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-slate-400 block mb-0.5">Admission Date</span>
                <span className="font-semibold text-slate-800">{selectedStudent.admissionDate}</span>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Enrolled Courses ({viewDetails.enrolledCourses?.length || 0})
              </h5>
              <div className="space-y-1.5">
                {viewDetails.enrolledCourses?.map((enr: any) => (
                  <div key={enr.id} className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-blue-800 mr-2">
                        {enr.course?.courseCode}
                      </span>
                      <span className="text-slate-800 font-medium">{enr.course?.courseName}</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      {enr.course?.creditHours} Cr. Hrs • {enr.academicYear}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance & Marks Summaries */}
            {viewDetails.marks?.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Academic Results Summary
                </h5>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Course</th>
                        <th className="p-2.5">Total Marks</th>
                        <th className="p-2.5">Percentage</th>
                        <th className="p-2.5">Grade</th>
                        <th className="p-2.5">GPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewDetails.marks.map((m: any) => (
                        <tr key={m.id}>
                          <td className="p-2.5 font-medium">{m.course?.courseCode} - {m.course?.courseName}</td>
                          <td className="p-2.5">{m.totalMarks} / 100</td>
                          <td className="p-2.5">{m.percentage}%</td>
                          <td className="p-2.5 font-bold text-blue-700">{m.grade}</td>
                          <td className="p-2.5 font-bold text-emerald-700">{m.gpa.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record?"
        message={`Are you sure you want to permanently delete ${selectedStudent?.firstName} ${selectedStudent?.lastName} (Roll No: ${selectedStudent?.rollNumber})? This will also remove their associated enrollments, attendance, and marks.`}
        confirmText="Yes, Delete Record"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
