import {
  Student,
  Faculty,
  Department,
  Course,
  Enrollment,
  AttendanceRecord,
  MarkRecord,
  DashboardStats,
  AttendanceSummary,
  User
} from '../types/index.ts';

const BASE_URL = '/api';

function getAuthHeaders(hasBody: boolean = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  try {
    const session = localStorage.getItem('gums_auth_session');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed?.token) {
        headers['Authorization'] = `Bearer ${parsed.token}`;
      }
    }
  } catch (e) {
    // Ignore JSON parse errors from local store
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  let data: any;
  try {
    data = await response.json();
  } catch {
    const text = await response.text().catch(() => '');
    if (!response.ok) {
      throw new Error(`Server error (${response.status}): ${text || response.statusText}`);
    }
    return {} as T;
  }
  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(res);
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/stats`, {
        headers: getAuthHeaders()
      });
      return await handleResponse<DashboardStats>(res);
    } catch (err: unknown) {
      // Graceful fallback without custom headers to avoid any preflight network blocks
      try {
        const fallbackRes = await fetch(`${BASE_URL}/dashboard/stats`);
        return await handleResponse<DashboardStats>(fallbackRes);
      } catch {
        throw err;
      }
    }
  },

  // Students
  async getStudents(params?: {
    search?: string;
    department?: string;
    semester?: string | number;
    gender?: string;
    status?: string;
    sort?: string;
  }): Promise<{ total: number; students: Student[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
    }
    const res = await fetch(`${BASE_URL}/students?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getStudentById(id: string): Promise<{
    student: Student;
    department?: Department;
    enrolledCourses: (Enrollment & { course?: Course })[];
    attendance: AttendanceRecord[];
    marks: (MarkRecord & { course?: Course })[];
    attendanceSummary: AttendanceSummary[];
  }> {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createStudent(student: Partial<Student>): Promise<{ message: string; student: Student }> {
    const res = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(student)
    });
    return handleResponse(res);
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<{ message: string; student: Student }> {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  async deleteStudent(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Departments
  async getDepartments(): Promise<{ total: number; departments: Department[] }> {
    const res = await fetch(`${BASE_URL}/departments`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createDepartment(data: Partial<Department>): Promise<{ message: string; department: Department }> {
    const res = await fetch(`${BASE_URL}/departments`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<{ message: string; department: Department }> {
    const res = await fetch(`${BASE_URL}/departments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteDepartment(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Faculty
  async getFaculty(params?: { search?: string; department?: string; designation?: string }): Promise<{ total: number; faculty: Faculty[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
    }
    const res = await fetch(`${BASE_URL}/faculty?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createFaculty(data: Partial<Faculty>): Promise<{ message: string; faculty: Faculty }> {
    const res = await fetch(`${BASE_URL}/faculty`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateFaculty(id: string, data: Partial<Faculty>): Promise<{ message: string; faculty: Faculty }> {
    const res = await fetch(`${BASE_URL}/faculty/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteFaculty(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/faculty/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Courses
  async getCourses(params?: { search?: string; department?: string; semester?: number | string }): Promise<{ total: number; courses: Course[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
    }
    const res = await fetch(`${BASE_URL}/courses?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createCourse(data: Partial<Course>): Promise<{ message: string; course: Course }> {
    const res = await fetch(`${BASE_URL}/courses`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<{ message: string; course: Course }> {
    const res = await fetch(`${BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteCourse(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Enrollments
  async getEnrollments(params?: { studentId?: string; courseId?: string; semester?: number | string }): Promise<{ total: number; enrollments: (Enrollment & { studentName?: string; rollNumber?: string; courseName?: string; courseCode?: string })[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
    }
    const res = await fetch(`${BASE_URL}/enrollments?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createEnrollment(data: { studentId: string; courseId: string; semester: number; academicYear?: string }): Promise<{ message: string; enrollment: Enrollment }> {
    const res = await fetch(`${BASE_URL}/enrollments`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteEnrollment(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/enrollments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Attendance
  async getAttendance(params?: { courseId?: string; studentId?: string; date?: string; status?: string }): Promise<{ total: number; attendance: (AttendanceRecord & { studentName?: string; rollNumber?: string; courseName?: string; courseCode?: string })[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
    }
    const res = await fetch(`${BASE_URL}/attendance?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getAttendanceSummary(courseId?: string, studentId?: string): Promise<AttendanceSummary[]> {
    const query = new URLSearchParams();
    if (courseId) query.append('courseId', courseId);
    if (studentId) query.append('studentId', studentId);
    const res = await fetch(`${BASE_URL}/attendance/summary?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async recordAttendanceBatch(records: { studentId: string; courseId: string; date: string; status: 'Present' | 'Absent' | 'Late'; markedBy: string; remarks?: string }[]): Promise<{ message: string; records: AttendanceRecord[] }> {
    const res = await fetch(`${BASE_URL}/attendance/batch`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ records })
    });
    return handleResponse(res);
  },

  async deleteAttendance(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/attendance/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Marks
  async getMarks(params?: { courseId?: string; studentId?: string; search?: string }): Promise<(MarkRecord & { studentName?: string; rollNumber?: string; courseName?: string; courseCode?: string })[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
    }
    const res = await fetch(`${BASE_URL}/marks?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createMark(data: Partial<MarkRecord>): Promise<{ message: string; mark: MarkRecord }> {
    const res = await fetch(`${BASE_URL}/marks`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateMark(id: string, data: Partial<MarkRecord>): Promise<{ message: string; mark: MarkRecord }> {
    const res = await fetch(`${BASE_URL}/marks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteMark(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/marks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // System
  async resetSeed(): Promise<{ message: string; stats: Record<string, number> }> {
    const res = await fetch(`${BASE_URL}/system/reset-seed`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};
