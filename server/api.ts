import express, { Request, Response, NextFunction } from 'express';
import { dbService } from './db.ts';
import { User } from '../src/types/index.ts';

export const apiRouter = express.Router();

apiRouter.use(express.json());

// Validation helpers
const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
const PHONE_REGEX = /^(\+92|0092|0)?3\d{2}-?\d{7}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// =========================================================================
// AUTHENTICATION & AUTHORIZATION RBAC MIDDLEWARE
// =========================================================================

export interface AuthenticatedRequest extends Request {
  user?: User;
}

function parseAuthUser(req: Request): (User & { passwordHash?: string }) | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  try {
    // Attempt Base64 JSON token payload
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    if (parsed && parsed.userId) {
      const user = dbService.getUserById(parsed.userId);
      return user || null;
    }
  } catch {
    // Not base64 JSON, continue to legacy/direct token check
  }

  if (token.startsWith('gu-token-')) {
    // Format: gu-token-{userId}-{timestamp}
    const lastDash = token.lastIndexOf('-');
    if (lastDash > 9) {
      const userId = token.substring(9, lastDash);
      const user = dbService.getUserById(userId);
      if (user) return user;
    }
  }

  return null;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = parseAuthUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication token is required. Please sign in.'
    });
  }
  const { passwordHash: _, ...safeUser } = user;
  req.user = safeUser as User;
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access forbidden: Administrative privilege required.'
    });
  }
  next();
};

export const requireTeacherOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'teacher')) {
    return res.status(403).json({
      error: 'Access forbidden: Teacher or Administrative privilege required.'
    });
  }
  next();
};

// =========================================================================
// 1. USERS & AUTHENTICATION
// =========================================================================

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = dbService.getUserByEmail(email.trim());
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email address or password.' });
  }

  const { passwordHash: _, ...safeUser } = user;
  const token = Buffer.from(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      facultyId: user.facultyId,
      ts: Date.now()
    })
  ).toString('base64');

  return res.json({
    message: 'Login successful',
    user: safeUser,
    token
  });
});

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid academic email address.' });
  }

  const user = dbService.getUserByEmail(email.trim());
  if (!user) {
    return res.status(404).json({ error: 'No account registered with this email address.' });
  }

  return res.json({
    message: `Password reset instructions have been sent to ${email}. Check your academic mailbox.`
  });
});

apiRouter.get('/users', authenticate, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = dbService.getUsers();
    return res.json({ total: users.length, users });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to retrieve users.' });
  }
});

apiRouter.get('/users/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const isSelf = req.user?.id === req.params.id;
  const isAdmin = req.user?.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'Access forbidden: You can only view your own user account.' });
  }

  const user = dbService.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User record not found.' });
  }
  const { passwordHash: _, ...safeUser } = user;
  return res.json(safeUser);
});

apiRouter.post('/users', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { email, name, role, password, studentId, facultyId } = req.body;
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'User name is required.' });
  }
  if (!['admin', 'teacher', 'student'].includes(role)) {
    return res.status(400).json({ error: "Role must be 'admin', 'teacher', or 'student'." });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = dbService.getUserByEmail(email.trim());
  if (existing) {
    return res.status(400).json({ error: `User with email '${email}' already exists.` });
  }

  const created = dbService.addUser({
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role,
    passwordHash: password,
    studentId,
    facultyId
  });

  return res.status(201).json({ message: 'User created successfully.', user: created });
});

apiRouter.put('/users/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { email, name, role, password } = req.body;

  const isSelf = req.user?.id === id;
  const isAdmin = req.user?.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'Access forbidden: You cannot modify this account.' });
  }

  // Anti-privilege escalation: regular users cannot alter their role
  if (!isAdmin && role && role !== req.user?.role) {
    return res.status(403).json({ error: 'Access forbidden: Non-administrative users cannot change roles.' });
  }

  const existing = dbService.getUserById(id);
  if (!existing) {
    return res.status(404).json({ error: 'User record not found.' });
  }

  if (email && email.toLowerCase() !== existing.email.toLowerCase()) {
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }
    const duplicate = dbService.getUserByEmail(email);
    if (duplicate && duplicate.id !== id) {
      return res.status(400).json({ error: `User with email '${email}' already exists.` });
    }
  }

  const updates: any = {};
  if (email) updates.email = email.toLowerCase();
  if (name) updates.name = name.trim();
  if (isAdmin && role && ['admin', 'teacher', 'student'].includes(role)) updates.role = role;
  if (password && password.length >= 6) updates.passwordHash = password;

  const updated = dbService.updateUser(id, updates);
  return res.json({ message: 'User updated successfully.', user: updated });
});

apiRouter.delete('/users/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (id === 'usr-admin') {
    return res.status(400).json({ error: 'Cannot delete primary central administrator account.' });
  }
  const deleted = dbService.deleteUser(id);
  if (!deleted) {
    return res.status(404).json({ error: 'User record not found.' });
  }
  return res.json({ message: 'User deleted successfully.' });
});

// =========================================================================
// 2. DASHBOARD METRICS & CHARTS
// =========================================================================

apiRouter.get('/dashboard/stats', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = dbService.getDashboardStats();
    return res.json(stats);
  } catch (error) {
    console.error('Error computing dashboard stats:', error);
    return res.status(500).json({ error: 'Unable to compute dashboard statistics.' });
  }
});

// =========================================================================
// 3. STUDENTS CRUD & PII SECURITY
// =========================================================================

apiRouter.get('/students', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    // If student: Strictly return only the authenticated student's own record
    // Prevents unauthorized enumeration and peer PII scraping (CNIC, Phone, Address)
    if (req.user?.role === 'student') {
      const studentId = req.user.studentId;
      if (!studentId) {
        return res.json({ total: 0, students: [] });
      }
      const own = dbService.getStudentById(studentId);
      const list = own ? [own] : [];
      return res.json({ total: list.length, students: list });
    }

    // Admins and Teachers have authorized directory access
    let list = dbService.getStudents();
    const { search, department, semester, gender, status, sort } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        s =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          s.fatherName.toLowerCase().includes(q)
      );
    }

    if (department && typeof department === 'string' && department !== 'all') {
      list = list.filter(s => s.departmentId === department);
    }

    if (semester && typeof semester === 'string' && semester !== 'all') {
      list = list.filter(s => s.semester === parseInt(semester, 10));
    }

    if (gender && typeof gender === 'string' && gender !== 'all') {
      list = list.filter(s => s.gender === gender);
    }

    if (status && typeof status === 'string' && status !== 'all') {
      list = list.filter(s => s.status === status);
    }

    // Sorting
    if (sort === 'name_asc') {
      list.sort((a, b) => a.firstName.localeCompare(b.firstName));
    } else if (sort === 'name_desc') {
      list.sort((a, b) => b.firstName.localeCompare(a.firstName));
    } else if (sort === 'roll_asc') {
      list.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
    } else if (sort === 'roll_desc') {
      list.sort((a, b) => b.rollNumber.localeCompare(a.rollNumber));
    }

    return res.json({
      total: list.length,
      students: list
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ error: 'Unable to load students.' });
  }
});

apiRouter.get('/students/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  // Authorization check: Students can ONLY access their own student profile!
  if (req.user?.role === 'student' && req.user.studentId !== req.params.id) {
    return res.status(403).json({
      error: 'Access forbidden: You are not authorized to view another student\'s private academic records.'
    });
  }

  const student = dbService.getStudentById(req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  // Include student's department, enrollments, attendance, and marks
  const dept = dbService.getDepartmentById(student.departmentId);
  const enrollments = dbService.getEnrollments().filter(e => e.studentId === student.id);
  const enrolledCourses = enrollments.map(e => ({
    ...e,
    course: dbService.getCourseById(e.courseId)
  }));
  const attendance = dbService.getAttendance().filter(a => a.studentId === student.id);
  const marks = dbService.getMarks().filter(m => m.studentId === student.id).map(m => ({
    ...m,
    course: dbService.getCourseById(m.courseId)
  }));

  const attendanceSummary = dbService.getAttendanceSummary(undefined, student.id);

  return res.json({
    student,
    department: dept,
    enrolledCourses,
    attendance,
    marks,
    attendanceSummary
  });
});

apiRouter.post('/students', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;

  // Validation
  if (!data.firstName || !data.firstName.trim()) {
    return res.status(400).json({ error: 'Student first name is required.' });
  }
  if (!data.lastName || !data.lastName.trim()) {
    return res.status(400).json({ error: 'Student last name is required.' });
  }
  if (!data.fatherName || !data.fatherName.trim()) {
    return res.status(400).json({ error: 'Father name is required.' });
  }
  if (!data.gender || !['Male', 'Female'].includes(data.gender)) {
    return res.status(400).json({ error: "Gender must be 'Male' or 'Female'." });
  }
  if (!data.dateOfBirth || !DATE_REGEX.test(data.dateOfBirth)) {
    return res.status(400).json({ error: 'Valid Date of Birth is required (YYYY-MM-DD).' });
  }

  // Validate CNIC (Pakistani format 12345-1234567-1)
  if (!data.cnic || !CNIC_REGEX.test(data.cnic.trim())) {
    return res.status(400).json({ error: 'Valid Pakistani CNIC is required (Format: 32203-1234567-1).' });
  }
  const existingCnic = dbService.getStudents().find(s => s.cnic === data.cnic.trim());
  if (existingCnic) {
    return res.status(400).json({ error: `A student with CNIC '${data.cnic}' is already registered.` });
  }

  // Validate Email
  if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
    return res.status(400).json({ error: 'Valid academic email address is required.' });
  }
  const existingEmail = dbService.getStudents().find(
    s => s.email.toLowerCase() === data.email.trim().toLowerCase()
  );
  if (existingEmail) {
    return res.status(400).json({ error: `A student with email '${data.email}' already exists.` });
  }

  // Validate Phone
  if (!data.phone || !PHONE_REGEX.test(data.phone.trim().replace(/\s/g, ''))) {
    return res.status(400).json({ error: 'Valid Pakistani mobile number is required (Format: 0300-1234567).' });
  }

  // Validate Department
  if (!data.departmentId || !dbService.getDepartmentById(data.departmentId)) {
    return res.status(400).json({ error: 'Valid academic department selection is required.' });
  }

  // Validate Roll Number if provided
  if (data.rollNumber && data.rollNumber.trim()) {
    const existingRoll = dbService.getStudents().find(
      s => s.rollNumber.toLowerCase() === data.rollNumber.trim().toLowerCase()
    );
    if (existingRoll) {
      return res.status(400).json({ error: `Roll number '${data.rollNumber}' is already assigned.` });
    }
  }

  const created = dbService.addStudent({
    rollNumber: data.rollNumber ? data.rollNumber.trim().toUpperCase() : '',
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    fatherName: data.fatherName.trim(),
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    cnic: data.cnic.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    address: data.address ? data.address.trim() : 'Ghazi University Hostel, Dera Ghazi Khan',
    city: data.city ? data.city.trim() : 'Dera Ghazi Khan',
    province: data.province || 'Punjab',
    departmentId: data.departmentId,
    program: data.program ? data.program.trim() : 'BS Information Technology',
    semester: Number(data.semester) || 1,
    section: data.section || 'A',
    admissionDate: data.admissionDate || new Date().toISOString().split('T')[0],
    status: data.status || 'Active'
  });

  return res.status(201).json({
    message: 'Student enrolled successfully.',
    student: created
  });
});

apiRouter.put('/students/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const existing = dbService.getStudentById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  // Check unique constraints if fields changed
  if (data.cnic && data.cnic.trim() !== existing.cnic) {
    if (!CNIC_REGEX.test(data.cnic.trim())) {
      return res.status(400).json({ error: 'Valid Pakistani CNIC is required (Format: 32203-1234567-1).' });
    }
    const duplicate = dbService.getStudents().find(s => s.id !== id && s.cnic === data.cnic.trim());
    if (duplicate) {
      return res.status(400).json({ error: `A student with CNIC '${data.cnic}' is already registered.` });
    }
  }

  if (data.email && data.email.trim().toLowerCase() !== existing.email.toLowerCase()) {
    if (!EMAIL_REGEX.test(data.email.trim())) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }
    const duplicate = dbService.getStudents().find(
      s => s.id !== id && s.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (duplicate) {
      return res.status(400).json({ error: `A student with email '${data.email}' already exists.` });
    }
  }

  if (data.rollNumber && data.rollNumber.trim().toLowerCase() !== existing.rollNumber.toLowerCase()) {
    const duplicate = dbService.getStudents().find(
      s => s.id !== id && s.rollNumber.toLowerCase() === data.rollNumber.trim().toLowerCase()
    );
    if (duplicate) {
      return res.status(400).json({ error: `Roll number '${data.rollNumber}' is already assigned.` });
    }
  }

  if (data.phone && !PHONE_REGEX.test(data.phone.trim().replace(/\s/g, ''))) {
    return res.status(400).json({ error: 'Valid Pakistani mobile number is required.' });
  }

  if (data.departmentId && !dbService.getDepartmentById(data.departmentId)) {
    return res.status(400).json({ error: 'Selected department does not exist.' });
  }

  const updated = dbService.updateStudent(id, data);
  return res.json({
    message: 'Student details updated successfully.',
    student: updated
  });
});

apiRouter.delete('/students/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = dbService.deleteStudent(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Student record not found.' });
  }
  return res.json({ message: 'Student removed from university registry successfully.' });
});

// =========================================================================
// 4. DEPARTMENTS CRUD
// =========================================================================

apiRouter.get('/departments', authenticate, (_req: AuthenticatedRequest, res: Response) => {
  const departments = dbService.getDepartments();
  return res.json({ total: departments.length, departments });
});

apiRouter.get('/departments/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const dept = dbService.getDepartmentById(req.params.id);
  if (!dept) {
    return res.status(404).json({ error: 'Department not found.' });
  }
  const faculty = dbService.getFaculty().filter(f => f.departmentId === dept.id);
  const courses = dbService.getCourses().filter(c => c.departmentId === dept.id);
  const students = dbService.getStudents().filter(s => s.departmentId === dept.id);

  return res.json({
    department: dept,
    facultyCount: faculty.length,
    coursesCount: courses.length,
    studentsCount: students.length,
    faculty,
    courses
  });
});

apiRouter.post('/departments', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { departmentName, departmentCode, building, headOfDepartment, phone, email, description } = req.body;
  if (!departmentName || !departmentName.trim()) {
    return res.status(400).json({ error: 'Department name is required.' });
  }
  if (!departmentCode || !departmentCode.trim()) {
    return res.status(400).json({ error: 'Department code is required.' });
  }

  const existing = dbService.getDepartments().find(
    d => d.departmentCode.toLowerCase() === departmentCode.trim().toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ error: `Department with code '${departmentCode}' already exists.` });
  }

  const created = dbService.addDepartment({
    departmentName: departmentName.trim(),
    departmentCode: departmentCode.trim().toUpperCase(),
    hodName: headOfDepartment ? headOfDepartment.trim() : 'Dr. Academic Chair',
    phone: phone ? phone.trim() : '064-9260124',
    email: email ? email.trim().toLowerCase() : `${departmentCode.toLowerCase()}@gu.edu.pk`,
    status: 'Active',
    description: description ? description.trim() : ''
  });

  return res.status(201).json({
    message: 'Department added successfully.',
    department: created
  });
});

apiRouter.put('/departments/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const existing = dbService.getDepartmentById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Department not found.' });
  }

  if (data.departmentCode && data.departmentCode.trim().toLowerCase() !== existing.departmentCode.toLowerCase()) {
    const duplicate = dbService.getDepartments().find(
      d => d.id !== id && d.departmentCode.toLowerCase() === data.departmentCode.trim().toLowerCase()
    );
    if (duplicate) {
      return res.status(400).json({ error: `Department code '${data.departmentCode}' is already taken.` });
    }
  }

  const updated = dbService.updateDepartment(id, data);
  return res.json({ message: 'Department updated successfully.', department: updated });
});

apiRouter.delete('/departments/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = dbService.deleteDepartment(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Department not found.' });
  }
  return res.json({ message: 'Department deleted successfully.' });
});

// =========================================================================
// 5. FACULTY CRUD
// =========================================================================

apiRouter.get('/faculty', authenticate, (req: AuthenticatedRequest, res: Response) => {
  let list = dbService.getFaculty();
  const { search, department, designation } = req.query;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    list = list.filter(
      f =>
        f.firstName.toLowerCase().includes(q) ||
        f.lastName.toLowerCase().includes(q) ||
        f.employeeId.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q)
    );
  }

  if (department && typeof department === 'string' && department !== 'all') {
    list = list.filter(f => f.departmentId === department);
  }

  if (designation && typeof designation === 'string' && designation !== 'all') {
    list = list.filter(f => f.designation === designation);
  }

  return res.json({ total: list.length, faculty: list });
});

apiRouter.get('/faculty/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const member = dbService.getFacultyById(req.params.id);
  if (!member) {
    return res.status(404).json({ error: 'Faculty record not found.' });
  }
  const dept = dbService.getDepartmentById(member.departmentId);
  const assignedCourses = dbService.getCourses().filter(c => c.teacherId === member.id);

  return res.json({
    faculty: member,
    department: dept,
    assignedCourses
  });
});

apiRouter.post('/faculty', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  if (!data.firstName || !data.firstName.trim()) {
    return res.status(400).json({ error: 'Faculty first name is required.' });
  }
  if (!data.lastName || !data.lastName.trim()) {
    return res.status(400).json({ error: 'Faculty last name is required.' });
  }
  if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
    return res.status(400).json({ error: 'Valid academic email address is required.' });
  }
  if (!data.departmentId || !dbService.getDepartmentById(data.departmentId)) {
    return res.status(400).json({ error: 'Valid department selection is required.' });
  }

  const existingEmail = dbService.getFaculty().find(
    f => f.email.toLowerCase() === data.email.trim().toLowerCase()
  );
  if (existingEmail) {
    return res.status(400).json({ error: `Faculty with email '${data.email}' already exists.` });
  }

  const created = dbService.addFaculty({
    employeeId: data.employeeId ? data.employeeId.trim().toUpperCase() : '',
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    fatherName: data.fatherName ? data.fatherName.trim() : '',
    email: data.email.trim().toLowerCase(),
    phone: data.phone ? data.phone.trim() : '0300-1234567',
    designation: data.designation || 'Lecturer',
    departmentId: data.departmentId,
    qualification: data.qualification ? data.qualification.trim() : 'MS / M.Phil Computer Science',
    joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
    status: data.status || 'Active'
  });

  return res.status(201).json({
    message: 'Faculty member appointed successfully.',
    faculty: created
  });
});

apiRouter.put('/faculty/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const existing = dbService.getFacultyById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Faculty record not found.' });
  }

  if (data.employeeId && data.employeeId.trim().toLowerCase() !== existing.employeeId.toLowerCase()) {
    const duplicate = dbService.getFaculty().find(
      f => f.id !== id && f.employeeId.toLowerCase() === data.employeeId.trim().toLowerCase()
    );
    if (duplicate) {
      return res.status(400).json({ error: `Employee ID '${data.employeeId}' already exists.` });
    }
  }

  if (data.email && data.email.trim().toLowerCase() !== existing.email.toLowerCase()) {
    if (!EMAIL_REGEX.test(data.email)) {
      return res.status(400).json({ error: 'Valid faculty email address is required.' });
    }
    const duplicate = dbService.getFaculty().find(
      f => f.id !== id && f.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (duplicate) {
      return res.status(400).json({ error: `Email address '${data.email}' is already registered.` });
    }
  }

  if (data.departmentId && !dbService.getDepartmentById(data.departmentId)) {
    return res.status(400).json({ error: 'Assigned department does not exist.' });
  }

  const updated = dbService.updateFaculty(id, data);
  return res.json({ message: 'Faculty member updated successfully.', faculty: updated });
});

apiRouter.delete('/faculty/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = dbService.deleteFaculty(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Faculty record not found.' });
  }
  return res.json({ message: 'Faculty member deleted successfully.' });
});

// =========================================================================
// 6. COURSES CRUD
// =========================================================================

apiRouter.get('/courses', authenticate, (req: AuthenticatedRequest, res: Response) => {
  let list = dbService.getCourses();
  const { search, department, semester } = req.query;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    list = list.filter(
      c => c.courseName.toLowerCase().includes(q) || c.courseCode.toLowerCase().includes(q)
    );
  }

  if (department && typeof department === 'string' && department !== 'all') {
    list = list.filter(c => c.departmentId === department);
  }

  if (semester && typeof semester === 'string' && semester !== 'all') {
    list = list.filter(c => c.semester === parseInt(semester, 10));
  }

  return res.json({ total: list.length, courses: list });
});

apiRouter.get('/courses/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const course = dbService.getCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }
  const dept = dbService.getDepartmentById(course.departmentId);
  const teacher = dbService.getFacultyById(course.teacherId);
  const enrolledCount = dbService.getEnrollments().filter(e => e.courseId === course.id).length;

  return res.json({ course, department: dept, instructor: teacher, enrolledCount });
});

apiRouter.post('/courses', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  if (!data.courseCode || !data.courseCode.trim()) {
    return res.status(400).json({ error: 'Course code is required.' });
  }
  if (!data.courseName || !data.courseName.trim()) {
    return res.status(400).json({ error: 'Course name is required.' });
  }
  if (!data.departmentId || !dbService.getDepartmentById(data.departmentId)) {
    return res.status(400).json({ error: 'Valid department selection is required.' });
  }
  if (data.teacherId && !dbService.getFacultyById(data.teacherId)) {
    return res.status(400).json({ error: 'Selected instructor does not exist.' });
  }

  const existing = dbService.getCourses().find(
    c => c.courseCode.toLowerCase() === data.courseCode.trim().toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ error: `Course code '${data.courseCode}' already exists.` });
  }

  const created = dbService.addCourse({
    courseCode: data.courseCode.trim().toUpperCase(),
    courseName: data.courseName.trim(),
    creditHours: Math.min(6, Math.max(1, Number(data.creditHours) || 3)),
    departmentId: data.departmentId,
    semester: Math.min(8, Math.max(1, Number(data.semester) || 1)),
    teacherId: data.teacherId || '',
    description: data.description ? data.description.trim() : '',
    status: data.status || 'Active'
  });

  return res.status(201).json({
    message: 'Course created successfully.',
    course: created
  });
});

apiRouter.put('/courses/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const existing = dbService.getCourseById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Course not found.' });
  }

  if (data.courseCode && data.courseCode.trim().toLowerCase() !== existing.courseCode.toLowerCase()) {
    const duplicate = dbService.getCourses().find(
      c => c.id !== id && c.courseCode.toLowerCase() === data.courseCode.trim().toLowerCase()
    );
    if (duplicate) {
      return res.status(400).json({ error: `Course code '${data.courseCode}' already exists.` });
    }
  }

  if (data.departmentId && !dbService.getDepartmentById(data.departmentId)) {
    return res.status(400).json({ error: 'Assigned department does not exist.' });
  }

  const updated = dbService.updateCourse(id, data);
  return res.json({ message: 'Course updated successfully.', course: updated });
});

apiRouter.delete('/courses/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = dbService.deleteCourse(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Course not found.' });
  }
  return res.json({ message: 'Course deleted successfully.' });
});

// =========================================================================
// 7. ENROLLMENTS CRUD
// =========================================================================

apiRouter.get('/enrollments', authenticate, (req: AuthenticatedRequest, res: Response) => {
  let list = dbService.getEnrollments();
  const { studentId, courseId, semester } = req.query;

  // Students can ONLY view their own enrollments
  if (req.user?.role === 'student') {
    list = list.filter(e => e.studentId === req.user?.studentId);
  } else {
    if (studentId && typeof studentId === 'string') {
      list = list.filter(e => e.studentId === studentId);
    }
  }

  if (courseId && typeof courseId === 'string' && courseId !== 'all') {
    list = list.filter(e => e.courseId === courseId);
  }

  if (semester && typeof semester === 'string' && semester !== 'all') {
    list = list.filter(e => e.semester === parseInt(semester, 10));
  }

  const enriched = list.map(enr => {
    const student = dbService.getStudentById(enr.studentId);
    const course = dbService.getCourseById(enr.courseId);
    return {
      ...enr,
      studentName: student ? `${student.firstName} ${student.lastName}` : 'N/A',
      rollNumber: student ? student.rollNumber : 'N/A',
      courseName: course ? course.courseName : 'N/A',
      courseCode: course ? course.courseCode : 'N/A'
    };
  });

  return res.json({ total: enriched.length, enrollments: enriched });
});

apiRouter.get('/enrollments/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const enr = dbService.getEnrollmentById(req.params.id);
  if (!enr) {
    return res.status(404).json({ error: 'Enrollment record not found.' });
  }

  if (req.user?.role === 'student' && enr.studentId !== req.user?.studentId) {
    return res.status(403).json({ error: 'Access forbidden: You cannot view other students\' enrollments.' });
  }

  const student = dbService.getStudentById(enr.studentId);
  const course = dbService.getCourseById(enr.courseId);

  return res.json({
    ...enr,
    student,
    course
  });
});

apiRouter.post('/enrollments', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { studentId, courseId, semester, academicYear } = req.body;
  if (!studentId || !courseId) {
    return res.status(400).json({ error: 'Both Student and Course must be selected.' });
  }

  // Verify student exists
  const student = dbService.getStudentById(studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student record does not exist.' });
  }

  // Verify course exists
  const course = dbService.getCourseById(courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course does not exist.' });
  }

  // Prevent duplicate enrollment for same student and course in the same semester
  const semNum = Number(semester) || student.semester || 1;
  const existing = dbService.getEnrollments().find(
    e => e.studentId === studentId && e.courseId === courseId && Number(e.semester) === semNum
  );
  if (existing) {
    return res.status(400).json({
      error: 'Student is already enrolled in this course for the selected semester.'
    });
  }

  const created = dbService.addEnrollment({
    studentId,
    courseId,
    semester: semNum,
    academicYear: academicYear || '2024-2025',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'Enrolled'
  });

  return res.status(201).json({
    message: 'Student enrolled in course successfully.',
    enrollment: created
  });
});

apiRouter.put('/enrollments/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, semester, academicYear } = req.body;

  const existing = dbService.getEnrollmentById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Enrollment record not found.' });
  }

  const updated = dbService.updateEnrollment(id, {
    status: status || existing.status,
    semester: semester !== undefined ? Number(semester) : existing.semester,
    academicYear: academicYear || existing.academicYear
  });

  return res.json({ message: 'Enrollment updated successfully.', enrollment: updated });
});

apiRouter.delete('/enrollments/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = dbService.deleteEnrollment(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Enrollment record not found.' });
  }
  return res.json({ message: 'Enrollment removed successfully.' });
});

// =========================================================================
// 8. ATTENDANCE CRUD & PERCENTAGE CALCS
// =========================================================================

apiRouter.get('/attendance', authenticate, (req: AuthenticatedRequest, res: Response) => {
  let list = dbService.getAttendance();
  const { courseId, studentId, date, status } = req.query;

  // Student authorization: Students can ONLY query their own attendance
  if (req.user?.role === 'student') {
    if (studentId && studentId !== req.user.studentId) {
      return res.status(403).json({ error: 'Access forbidden: You cannot view other students\' attendance.' });
    }
    list = list.filter(a => a.studentId === req.user?.studentId);
  } else {
    if (studentId && typeof studentId === 'string') {
      list = list.filter(a => a.studentId === studentId);
    }
  }

  if (courseId && typeof courseId === 'string' && courseId !== 'all') {
    list = list.filter(a => a.courseId === courseId);
  }
  if (date && typeof date === 'string') {
    list = list.filter(a => a.date === date);
  }
  if (status && typeof status === 'string' && status !== 'all') {
    list = list.filter(a => a.status === status);
  }

  const enriched = list.map(rec => {
    const student = dbService.getStudentById(rec.studentId);
    const course = dbService.getCourseById(rec.courseId);
    return {
      ...rec,
      studentName: student ? `${student.firstName} ${student.lastName}` : 'N/A',
      rollNumber: student ? student.rollNumber : 'N/A',
      courseName: course ? course.courseName : 'N/A',
      courseCode: course ? course.courseCode : 'N/A'
    };
  });

  return res.json({ total: enriched.length, attendance: enriched });
});

apiRouter.get('/attendance/summary', authenticate, (req: AuthenticatedRequest, res: Response) => {
  let { courseId, studentId } = req.query;

  // Force studentId if student role
  if (req.user?.role === 'student') {
    studentId = req.user.studentId;
  }

  const summaries = dbService.getAttendanceSummary(
    courseId as string | undefined,
    studentId as string | undefined
  );
  return res.json(summaries);
});

apiRouter.get('/attendance/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const record = dbService.getAttendanceById(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Attendance record not found.' });
  }

  if (req.user?.role === 'student' && record.studentId !== req.user?.studentId) {
    return res.status(403).json({ error: 'Access forbidden: You cannot view other students\' attendance.' });
  }

  const student = dbService.getStudentById(record.studentId);
  const course = dbService.getCourseById(record.courseId);
  return res.json({ ...record, student, course });
});

// Teachers and Admins can record attendance. Students are STRICTLY FORBIDDEN!
apiRouter.post('/attendance', authenticate, requireTeacherOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { studentId, courseId, date, status, markedBy, remarks } = req.body;
  if (!studentId || !courseId || !date) {
    return res.status(400).json({ error: 'Student, Course, and Date are required.' });
  }
  if (!['Present', 'Absent', 'Late'].includes(status)) {
    return res.status(400).json({ error: "Status must be 'Present', 'Absent', or 'Late'." });
  }

  const saved = dbService.addAttendanceRecord({
    studentId,
    courseId,
    date,
    status,
    markedBy: markedBy || req.user?.name || 'Instructor',
    remarks
  });

  return res.status(201).json({ message: 'Attendance recorded successfully.', record: saved });
});

apiRouter.post('/attendance/batch', authenticate, requireTeacherOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { records } = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'Attendance records array is required.' });
  }

  // Validate items
  for (const r of records) {
    if (!r.studentId || !r.courseId || !r.date) {
      return res.status(400).json({ error: 'Each record must have studentId, courseId, and date.' });
    }
    if (!['Present', 'Absent', 'Late'].includes(r.status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'Present', 'Absent', or 'Late'." });
    }
  }

  try {
    const saved = dbService.recordAttendanceBatch(records);
    return res.json({
      message: `Attendance marked successfully for ${saved.length} students.`,
      records: saved
    });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return res.status(500).json({ error: 'Unable to save attendance records.' });
  }
});

apiRouter.put('/attendance/:id', authenticate, requireTeacherOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, remarks, markedBy } = req.body;

  if (status && !['Present', 'Absent', 'Late'].includes(status)) {
    return res.status(400).json({ error: "Status must be 'Present', 'Absent', or 'Late'." });
  }

  const updated = dbService.updateAttendance(id, {
    status,
    remarks,
    markedBy: markedBy || req.user?.name
  });

  if (!updated) {
    return res.status(404).json({ error: 'Attendance record not found.' });
  }

  return res.json({ message: 'Attendance record updated successfully.', record: updated });
});

// Deleting past official attendance records restricted strictly to Admin
apiRouter.delete('/attendance/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = dbService.deleteAttendance(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Attendance record not found.' });
  }
  return res.json({ message: 'Attendance record deleted successfully.' });
});

// =========================================================================
// 9. MARKS & RESULTS (AUTO-CALCULATIONS & SECURITY)
// =========================================================================

apiRouter.get('/marks', authenticate, (req: AuthenticatedRequest, res: Response) => {
  let list = dbService.getMarks();
  const { courseId, studentId, search } = req.query;

  // Student authorization: Students can ONLY view their own marks
  if (req.user?.role === 'student') {
    if (studentId && studentId !== req.user.studentId) {
      return res.status(403).json({ error: 'Access forbidden: You cannot view marks of other students.' });
    }
    list = list.filter(m => m.studentId === req.user?.studentId);
  } else {
    if (studentId && typeof studentId === 'string') {
      list = list.filter(m => m.studentId === studentId);
    }
  }

  if (courseId && typeof courseId === 'string' && courseId !== 'all') {
    list = list.filter(m => m.courseId === courseId);
  }

  const enriched = list.map(m => {
    const student = dbService.getStudentById(m.studentId);
    const course = dbService.getCourseById(m.courseId);
    return {
      ...m,
      studentName: student ? `${student.firstName} ${student.lastName}` : 'N/A',
      rollNumber: student ? student.rollNumber : 'N/A',
      courseName: course ? course.courseName : 'N/A',
      courseCode: course ? course.courseCode : 'N/A'
    };
  });

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    return res.json(
      enriched.filter(
        item =>
          item.studentName.toLowerCase().includes(q) ||
          item.rollNumber.toLowerCase().includes(q) ||
          item.courseCode.toLowerCase().includes(q)
      )
    );
  }

  return res.json(enriched);
});

apiRouter.get('/marks/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const mark = dbService.getMarkById(req.params.id);
  if (!mark) {
    return res.status(404).json({ error: 'Marks record not found.' });
  }

  if (req.user?.role === 'student' && mark.studentId !== req.user?.studentId) {
    return res.status(403).json({ error: 'Access forbidden: You cannot view grades of other students.' });
  }

  const student = dbService.getStudentById(mark.studentId);
  const course = dbService.getCourseById(mark.courseId);

  return res.json({
    ...mark,
    student,
    course
  });
});

// Teachers and Admins can record grades. Students are STRICTLY FORBIDDEN!
apiRouter.post('/marks', authenticate, requireTeacherOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  if (!data.studentId || !data.courseId) {
    return res.status(400).json({ error: 'Student and Course are required.' });
  }

  // Validate student and course exist
  if (!dbService.getStudentById(data.studentId)) {
    return res.status(404).json({ error: 'Student does not exist.' });
  }
  if (!dbService.getCourseById(data.courseId)) {
    return res.status(404).json({ error: 'Course does not exist.' });
  }

  // Prevent duplicate mark entry for same student & course
  const existing = dbService.getMarks().find(
    m => m.studentId === data.studentId && m.courseId === data.courseId
  );
  if (existing) {
    return res.status(400).json({
      error: 'Marks for this student in this course already exist. Please edit the existing record.'
    });
  }

  // Validate boundaries
  const quiz = Number(data.quizMarks) || 0;
  const assignment = Number(data.assignmentMarks) || 0;
  const midterm = Number(data.midtermMarks) || 0;
  const finalExam = Number(data.finalMarks) || 0;
  const practical = Number(data.practicalMarks) || 0;

  if (quiz < 0 || quiz > 15) return res.status(400).json({ error: 'Quiz marks must be between 0 and 15.' });
  if (assignment < 0 || assignment > 10) return res.status(400).json({ error: 'Assignment marks must be between 0 and 10.' });
  if (midterm < 0 || midterm > 25) return res.status(400).json({ error: 'Midterm marks must be between 0 and 25.' });
  if (finalExam < 0 || finalExam > 40) return res.status(400).json({ error: 'Final exam marks must be between 0 and 40.' });
  if (practical < 0 || practical > 10) return res.status(400).json({ error: 'Practical marks must be between 0 and 10.' });

  const created = dbService.addMark({
    studentId: data.studentId,
    courseId: data.courseId,
    quizMarks: quiz,
    assignmentMarks: assignment,
    midtermMarks: midterm,
    finalMarks: finalExam,
    practicalMarks: practical,
    academicSemester: data.academicSemester || 'Spring 2024'
  });

  return res.status(201).json({
    message: 'Marks recorded successfully with auto-calculated Grade and GPA.',
    mark: created
  });
});

apiRouter.put('/marks/:id', authenticate, requireTeacherOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const quiz = data.quizMarks !== undefined ? Number(data.quizMarks) : undefined;
  const assignment = data.assignmentMarks !== undefined ? Number(data.assignmentMarks) : undefined;
  const midterm = data.midtermMarks !== undefined ? Number(data.midtermMarks) : undefined;
  const finalExam = data.finalMarks !== undefined ? Number(data.finalMarks) : undefined;
  const practical = data.practicalMarks !== undefined ? Number(data.practicalMarks) : undefined;

  if (quiz !== undefined && (quiz < 0 || quiz > 15)) return res.status(400).json({ error: 'Quiz marks must be between 0 and 15.' });
  if (assignment !== undefined && (assignment < 0 || assignment > 10)) return res.status(400).json({ error: 'Assignment marks must be between 0 and 10.' });
  if (midterm !== undefined && (midterm < 0 || midterm > 25)) return res.status(400).json({ error: 'Midterm marks must be between 0 and 25.' });
  if (finalExam !== undefined && (finalExam < 0 || finalExam > 40)) return res.status(400).json({ error: 'Final exam marks must be between 0 and 40.' });
  if (practical !== undefined && (practical < 0 || practical > 10)) return res.status(400).json({ error: 'Practical marks must be between 0 and 10.' });

  const updated = dbService.updateMark(id, {
    quizMarks: quiz,
    assignmentMarks: assignment,
    midtermMarks: midterm,
    finalMarks: finalExam,
    practicalMarks: practical,
    academicSemester: data.academicSemester
  });

  if (!updated) {
    return res.status(404).json({ error: 'Marks record not found.' });
  }

  return res.json({
    message: 'Marks updated successfully.',
    mark: updated
  });
});

// Deleting submitted academic transcripts restricted strictly to Admin
apiRouter.delete('/marks/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = dbService.deleteMark(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Marks record not found.' });
  }
  return res.json({ message: 'Marks record deleted successfully.' });
});

// =========================================================================
// 10. SYSTEM & SEED RESET (Admin Only)
// =========================================================================

apiRouter.post('/system/reset-seed', authenticate, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const seed = dbService.resetToSeed();
    return res.json({
      message: 'Database successfully re-seeded with realistic Ghazi University academic records.',
      stats: {
        users: seed.users.length,
        students: seed.students.length,
        faculty: seed.faculty.length,
        departments: seed.departments.length,
        courses: seed.courses.length,
        enrollments: seed.enrollments.length,
        attendance: seed.attendance.length,
        marks: seed.marks.length
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return res.status(500).json({ error: 'Failed to reseed database.' });
  }
});
