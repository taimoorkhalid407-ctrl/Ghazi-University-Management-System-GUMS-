import fs from 'fs';
import path from 'path';
import {
  Department,
  Faculty,
  Course,
  Student,
  Enrollment,
  AttendanceRecord,
  MarkRecord,
  User,
  DashboardStats,
  AttendanceSummary
} from '../src/types/index.ts';

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  departments: Department[];
  faculty: Faculty[];
  courses: Course[];
  students: Student[];
  enrollments: Enrollment[];
  attendance: AttendanceRecord[];
  marks: MarkRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'gums_database.json');

// Helper to calculate Grade and GPA based on Academic Project rules
export function calculateGradeAndGpa(totalMarks: number): { grade: string; gpa: number } {
  // A+ = 90-100 (4.0)
  // A  = 80-89  (3.7)
  // B+ = 75-79  (3.3)
  // B  = 70-74  (3.0)
  // C+ = 65-69  (2.5)
  // C  = 60-64  (2.0)
  // D  = 50-59  (1.0)
  // F  = below 50 (0.0)
  if (totalMarks >= 90) return { grade: 'A+', gpa: 4.0 };
  if (totalMarks >= 80) return { grade: 'A', gpa: 3.7 };
  if (totalMarks >= 75) return { grade: 'B+', gpa: 3.3 };
  if (totalMarks >= 70) return { grade: 'B', gpa: 3.0 };
  if (totalMarks >= 65) return { grade: 'C+', gpa: 2.5 };
  if (totalMarks >= 60) return { grade: 'C', gpa: 2.0 };
  if (totalMarks >= 50) return { grade: 'D', gpa: 1.0 };
  return { grade: 'F', gpa: 0.0 };
}

// Generate Realistic Pakistani Seed Data
export function getInitialSeedData(): DatabaseSchema {
  const departments: Department[] = [
    {
      id: 'dep-1',
      departmentId: 'DEP-001',
      departmentCode: 'CS',
      departmentName: 'Department of Computer Science',
      hodName: 'Dr. Muhammad Imran',
      email: 'cs@gu.edu.pk',
      phone: '064-9260135',
      status: 'Active',
      description: 'Department offering BSCS, MSCS, and PhD in Computer Science with advanced computing labs.'
    },
    {
      id: 'dep-2',
      departmentId: 'DEP-002',
      departmentCode: 'IT',
      departmentName: 'Department of Information Technology',
      hodName: 'Dr. Muhammad Faisal',
      email: 'it@gu.edu.pk',
      phone: '064-9260136',
      status: 'Active',
      description: 'Specializing in Enterprise Systems, Cloud Computing, and Network Security.'
    },
    {
      id: 'dep-3',
      departmentId: 'DEP-003',
      departmentCode: 'AI',
      departmentName: 'Department of Artificial Intelligence',
      hodName: 'Dr. Ayesha Bukhari',
      email: 'ai@gu.edu.pk',
      phone: '064-9260137',
      status: 'Active',
      description: 'Cutting edge research in Machine Learning, Deep Neural Networks, and Robotics.'
    },
    {
      id: 'dep-4',
      departmentId: 'DEP-004',
      departmentCode: 'SE',
      departmentName: 'Department of Software Engineering',
      hodName: 'Dr. Abdul Basit',
      email: 'se@gu.edu.pk',
      phone: '064-9260138',
      status: 'Active',
      description: 'Accredited program emphasizing software architecture, DevOps, and agile methodologies.'
    },
    {
      id: 'dep-5',
      departmentId: 'DEP-005',
      departmentCode: 'BBA',
      departmentName: 'Department of Business Administration',
      hodName: 'Dr. Sana Malik',
      email: 'bba@gu.edu.pk',
      phone: '064-9260139',
      status: 'Active',
      description: 'Focusing on corporate leadership, finance, banking, and marketing.'
    },
    {
      id: 'dep-6',
      departmentId: 'DEP-006',
      departmentCode: 'MATH',
      departmentName: 'Department of Mathematics',
      hodName: 'Dr. Tariq Mehmood',
      email: 'math@gu.edu.pk',
      phone: '064-9260140',
      status: 'Active',
      description: 'Pure and applied mathematics supporting university-wide STEM faculties.'
    },
    {
      id: 'dep-7',
      departmentId: 'DEP-007',
      departmentCode: 'PHY',
      departmentName: 'Department of Physics',
      hodName: 'Dr. Usman Ahmad',
      email: 'physics@gu.edu.pk',
      phone: '064-9260141',
      status: 'Active',
      description: 'Materials science, solid-state physics, and computational physics.'
    },
    {
      id: 'dep-8',
      departmentId: 'DEP-008',
      departmentCode: 'ENG',
      departmentName: 'Department of English',
      hodName: 'Dr. Maryam Nawaz',
      email: 'english@gu.edu.pk',
      phone: '064-9260142',
      status: 'Active',
      description: 'English Linguistics, Literature, and professional communication skills.'
    }
  ];

  const faculty: Faculty[] = [
    {
      id: 'fac-1',
      facultyId: 'FAC-001',
      employeeId: 'GU-EMP-101',
      firstName: 'Dr. Muhammad',
      lastName: 'Imran',
      fatherName: 'Muhammad Aslam',
      email: 'imran@gu.edu.pk',
      phone: '0300-8765431',
      designation: 'Professor',
      departmentId: 'dep-1',
      qualification: 'Ph.D. Computer Science (FAST-NUCES)',
      joiningDate: '2016-08-15',
      status: 'Active'
    },
    {
      id: 'fac-2',
      facultyId: 'FAC-002',
      employeeId: 'GU-EMP-102',
      firstName: 'Dr. Abdul',
      lastName: 'Basit',
      fatherName: 'Ghulam Qadir',
      email: 'basit@gu.edu.pk',
      phone: '0301-7654321',
      designation: 'Associate Professor',
      departmentId: 'dep-4',
      qualification: 'Ph.D. Software Engineering (NUST)',
      joiningDate: '2018-02-01',
      status: 'Active'
    },
    {
      id: 'fac-3',
      facultyId: 'FAC-003',
      employeeId: 'GU-EMP-103',
      firstName: 'Dr. Muhammad',
      lastName: 'Faisal',
      fatherName: 'Allah Ditta',
      email: 'faisal@gu.edu.pk',
      phone: '0302-6543210',
      designation: 'Associate Professor',
      departmentId: 'dep-2',
      qualification: 'Ph.D. Information Technology (PU)',
      joiningDate: '2017-09-10',
      status: 'Active'
    },
    {
      id: 'fac-4',
      facultyId: 'FAC-004',
      employeeId: 'GU-EMP-104',
      firstName: 'Dr. Ayesha',
      lastName: 'Bukhari',
      fatherName: 'Syed Qasim Ali',
      email: 'ayesha.bukhari@gu.edu.pk',
      phone: '0303-5432109',
      designation: 'Assistant Professor',
      departmentId: 'dep-3',
      qualification: 'Ph.D. Artificial Intelligence (LUMS)',
      joiningDate: '2020-01-15',
      status: 'Active'
    },
    {
      id: 'fac-5',
      facultyId: 'FAC-005',
      employeeId: 'GU-EMP-105',
      firstName: 'Dr. Sana',
      lastName: 'Malik',
      fatherName: 'Malik Khuda Bakhsh',
      email: 'sana.malik@gu.edu.pk',
      phone: '0304-4321098',
      designation: 'Associate Professor',
      departmentId: 'dep-5',
      qualification: 'Ph.D. Management Sciences (IBA Karachi)',
      joiningDate: '2019-03-20',
      status: 'Active'
    },
    {
      id: 'fac-6',
      facultyId: 'FAC-006',
      employeeId: 'GU-EMP-106',
      firstName: 'Muhammad',
      lastName: 'Waqas',
      fatherName: 'Muhammad Ramzan',
      email: 'waqas@gu.edu.pk',
      phone: '0305-3210987',
      designation: 'Lecturer',
      departmentId: 'dep-1',
      qualification: 'MS Computer Science (COMSATS)',
      joiningDate: '2021-08-01',
      status: 'Active'
    },
    {
      id: 'fac-7',
      facultyId: 'FAC-007',
      employeeId: 'GU-EMP-107',
      firstName: 'Muhammad',
      lastName: 'Bilal',
      fatherName: 'Muhammad Sadiq',
      email: 'bilal.math@gu.edu.pk',
      phone: '0306-2109876',
      designation: 'Lecturer',
      departmentId: 'dep-6',
      qualification: 'M.Phil Mathematics (QAU Islamabad)',
      joiningDate: '2021-11-15',
      status: 'Active'
    },
    {
      id: 'fac-8',
      facultyId: 'FAC-008',
      employeeId: 'GU-EMP-108',
      firstName: 'Usman',
      lastName: 'Ahmad',
      fatherName: 'Ahmad Bakhsh',
      email: 'usman.phy@gu.edu.pk',
      phone: '0307-1098765',
      designation: 'Assistant Professor',
      departmentId: 'dep-7',
      qualification: 'Ph.D. Physics (BZU Multan)',
      joiningDate: '2019-09-01',
      status: 'Active'
    },
    {
      id: 'fac-9',
      facultyId: 'FAC-009',
      employeeId: 'GU-EMP-109',
      firstName: 'Maryam',
      lastName: 'Nawaz',
      fatherName: 'Nawazish Ali',
      email: 'maryam.eng@gu.edu.pk',
      phone: '0308-0987654',
      designation: 'Lecturer',
      departmentId: 'dep-8',
      qualification: 'M.Phil English Linguistics (NUML)',
      joiningDate: '2022-02-10',
      status: 'Active'
    },
    {
      id: 'fac-10',
      facultyId: 'FAC-010',
      employeeId: 'GU-EMP-110',
      firstName: 'Farhan',
      lastName: 'Tariq',
      fatherName: 'Tariq Mehmood',
      email: 'farhan.tariq@gu.edu.pk',
      phone: '0309-9876543',
      designation: 'Visiting Lecturer',
      departmentId: 'dep-1',
      qualification: 'MS Computer Science (FAST)',
      joiningDate: '2023-09-01',
      status: 'Active'
    }
  ];

  const courses: Course[] = [
    {
      id: 'crs-1',
      courseId: 'CRS-001',
      courseCode: 'CS-101',
      courseName: 'Programming Fundamentals',
      creditHours: 4,
      departmentId: 'dep-1',
      semester: 1,
      teacherId: 'fac-6',
      description: 'Introduction to structured programming using C++ and basic algorithm design.',
      status: 'Active'
    },
    {
      id: 'crs-2',
      courseId: 'CRS-002',
      courseCode: 'CS-201',
      courseName: 'Object Oriented Programming',
      creditHours: 4,
      departmentId: 'dep-1',
      semester: 2,
      teacherId: 'fac-1',
      description: 'OOP concepts: classes, inheritance, polymorphism, templates, and abstract data types.',
      status: 'Active'
    },
    {
      id: 'crs-3',
      courseId: 'CRS-003',
      courseCode: 'CS-301',
      courseName: 'Database Systems',
      creditHours: 4,
      departmentId: 'dep-1',
      semester: 4,
      teacherId: 'fac-1',
      description: 'Relational model, SQL, normalization, concurrency, and transaction processing.',
      status: 'Active'
    },
    {
      id: 'crs-4',
      courseId: 'CRS-004',
      courseCode: 'CS-302',
      courseName: 'Computer Networks',
      creditHours: 3,
      departmentId: 'dep-1',
      semester: 5,
      teacherId: 'fac-3',
      description: 'OSI and TCP/IP models, routing protocols, transport layer, and network security.',
      status: 'Active'
    },
    {
      id: 'crs-5',
      courseId: 'CRS-005',
      courseCode: 'CS-401',
      courseName: 'Artificial Intelligence',
      creditHours: 3,
      departmentId: 'dep-3',
      semester: 6,
      teacherId: 'fac-4',
      description: 'State space search, heuristics, knowledge representation, and expert systems.',
      status: 'Active'
    },
    {
      id: 'crs-6',
      courseId: 'CRS-006',
      courseCode: 'CS-402',
      courseName: 'Machine Learning',
      creditHours: 3,
      departmentId: 'dep-3',
      semester: 7,
      teacherId: 'fac-4',
      description: 'Supervised and unsupervised learning, decision trees, SVM, and deep neural nets.',
      status: 'Active'
    },
    {
      id: 'crs-7',
      courseId: 'CRS-007',
      courseCode: 'CS-403',
      courseName: 'Web Engineering',
      creditHours: 3,
      departmentId: 'dep-1',
      semester: 6,
      teacherId: 'fac-10',
      description: 'Modern web application architecture, React, Node.js, and cloud deployments.',
      status: 'Active'
    },
    {
      id: 'crs-8',
      courseId: 'CRS-008',
      courseCode: 'CS-404',
      courseName: 'Software Engineering',
      creditHours: 3,
      departmentId: 'dep-4',
      semester: 4,
      teacherId: 'fac-2',
      description: 'Software development lifecycle, requirements engineering, design patterns, and testing.',
      status: 'Active'
    },
    {
      id: 'crs-9',
      courseId: 'CRS-009',
      courseCode: 'IT-201',
      courseName: 'Data Structures & Algorithms',
      creditHours: 4,
      departmentId: 'dep-2',
      semester: 3,
      teacherId: 'fac-3',
      description: 'Arrays, linked lists, stacks, queues, trees, graphs, sorting, and complexity analysis.',
      status: 'Active'
    },
    {
      id: 'crs-10',
      courseId: 'CRS-010',
      courseCode: 'AI-301',
      courseName: 'Deep Learning & Computer Vision',
      creditHours: 3,
      departmentId: 'dep-3',
      semester: 7,
      teacherId: 'fac-4',
      description: 'Convolutional neural networks, transformers, image segmentation, and object detection.',
      status: 'Active'
    },
    {
      id: 'crs-11',
      courseId: 'CRS-011',
      courseCode: 'SE-302',
      courseName: 'Software Quality Assurance',
      creditHours: 3,
      departmentId: 'dep-4',
      semester: 5,
      teacherId: 'fac-2',
      description: 'Automated testing, unit testing, integration testing, CI/CD, and ISO standards.',
      status: 'Active'
    },
    {
      id: 'crs-12',
      courseId: 'CRS-012',
      courseCode: 'BA-101',
      courseName: 'Principles of Management',
      creditHours: 3,
      departmentId: 'dep-5',
      semester: 1,
      teacherId: 'fac-5',
      description: 'Foundations of management theory, planning, organizational behavior, and leadership.',
      status: 'Active'
    },
    {
      id: 'crs-13',
      courseId: 'CRS-013',
      courseCode: 'MT-101',
      courseName: 'Calculus & Analytical Geometry',
      creditHours: 3,
      departmentId: 'dep-6',
      semester: 1,
      teacherId: 'fac-7',
      description: 'Limits, derivatives, integrals, infinite series, and geometric applications.',
      status: 'Active'
    },
    {
      id: 'crs-14',
      courseId: 'CRS-014',
      courseCode: 'PH-101',
      courseName: 'Applied Physics',
      creditHours: 3,
      departmentId: 'dep-7',
      semester: 1,
      teacherId: 'fac-8',
      description: 'Electromagnetism, semiconductors, laser optics, and quantum basics.',
      status: 'Active'
    },
    {
      id: 'crs-15',
      courseId: 'CRS-015',
      courseCode: 'EN-101',
      courseName: 'Functional English',
      creditHours: 3,
      departmentId: 'dep-8',
      semester: 1,
      teacherId: 'fac-9',
      description: 'Reading comprehension, academic writing, presentation skills, and grammar.',
      status: 'Active'
    }
  ];

  // 32 Realistic Pakistani Students
  const rawStudentData = [
    { roll: 'BSCS-2022-001', first: 'Muhammad', last: 'Abdullah', father: 'Muhammad Ashraf', gender: 'Male', cnic: '32102-1489201-1', email: 'abdullah@gu.edu.pk', phone: '0300-1122334', city: 'Dera Ghazi Khan', dept: 'dep-1', prog: 'BS Computer Science', sem: 4, sec: 'A' },
    { roll: 'BSCS-2022-002', first: 'Muhammad', last: 'Hamza', father: 'Muhammad Farooq', gender: 'Male', cnic: '32102-2345678-3', email: 'hamza.farooq@gu.edu.pk', phone: '0301-2233445', city: 'Dera Ghazi Khan', dept: 'dep-1', prog: 'BS Computer Science', sem: 4, sec: 'A' },
    { roll: 'BSCS-2022-003', first: 'Abdul', last: 'Rehman', father: 'Abdul Sattar', gender: 'Male', cnic: '32103-3456789-5', email: 'rehman.sattar@gu.edu.pk', phone: '0302-3344556', city: 'Multan', dept: 'dep-1', prog: 'BS Computer Science', sem: 4, sec: 'A' },
    { roll: 'BSCS-2022-004', first: 'Muhammad', last: 'Usman', father: 'Tariq Mehmood', gender: 'Male', cnic: '32102-4567890-7', email: 'usman.tariq@gu.edu.pk', phone: '0303-4455667', city: 'Muzaffargarh', dept: 'dep-1', prog: 'BS Computer Science', sem: 4, sec: 'A' },
    { roll: 'BSCS-2022-005', first: 'Ali', last: 'Raza', father: 'Ghulam Raza', gender: 'Male', cnic: '32101-5678901-9', email: 'ali.raza@gu.edu.pk', phone: '0304-5566778', city: 'Rajanpur', dept: 'dep-1', prog: 'BS Computer Science', sem: 4, sec: 'B' },
    { roll: 'BSCS-2022-006', first: 'Hassan', last: 'Khan', father: 'Sher Khan', gender: 'Male', cnic: '32102-6789012-1', email: 'hassan.khan@gu.edu.pk', phone: '0305-6677889', city: 'Dera Ghazi Khan', dept: 'dep-1', prog: 'BS Computer Science', sem: 4, sec: 'B' },
    { roll: 'BSCS-2022-007', first: 'Muhammad', last: 'Ahsan', father: 'Ahsan Ullah', gender: 'Male', cnic: '32103-7890123-3', email: 'ahsan.ullah@gu.edu.pk', phone: '0306-7788990', city: 'Layyah', dept: 'dep-1', prog: 'BS Computer Science', sem: 4, sec: 'B' },
    { roll: 'BSCS-2022-008', first: 'Ahmad', last: 'Nawaz', father: 'Rab Nawaz', gender: 'Male', cnic: '32102-8901234-5', email: 'ahmad.nawaz@gu.edu.pk', phone: '0307-8899001', city: 'Dera Ghazi Khan', dept: 'dep-1', prog: 'BS Computer Science', sem: 4, sec: 'A' },
    { roll: 'BSCS-2022-009', first: 'Fatima', last: 'Zahra', father: 'Syed Sajid Ali', gender: 'Female', cnic: '32102-9012345-2', email: 'fatima.zahra@gu.edu.pk', phone: '0308-9900112', city: 'Dera Ghazi Khan', dept: 'dep-1', prog: 'BS Computer Science', sem: 4, sec: 'A' },
    { roll: 'BSCS-2022-010', first: 'Ayesha', last: 'Noor', father: 'Noor Muhammad', gender: 'Female', cnic: '32102-0123456-4', email: 'ayesha.noor@gu.edu.pk', phone: '0309-1011121', city: 'Multan', dept: 'dep-1', prog: 'BS Computer Science', sem: 4, sec: 'A' },
    { roll: 'BSCS-2022-011', first: 'Hira', last: 'Khan', father: 'Nasir Khan', gender: 'Female', cnic: '32101-1234567-6', email: 'hira.khan@gu.edu.pk', phone: '0310-2122232', city: 'Rajanpur', dept: 'dep-1', prog: 'BS Computer Science', sem: 4, sec: 'B' },
    { roll: 'BSCS-2022-012', first: 'Maryam', last: 'Bibi', father: 'Khuda Bakhsh', gender: 'Female', cnic: '32102-2345678-8', email: 'maryam.bibi@gu.edu.pk', phone: '0311-3233343', city: 'Dera Ghazi Khan', dept: 'dep-1', prog: 'BS Computer Science', sem: 4, sec: 'B' },
    { roll: 'BSIT-2022-001', first: 'Sana', last: 'Iqbal', father: 'Muhammad Iqbal', gender: 'Female', cnic: '32103-3456789-0', email: 'sana.iqbal@gu.edu.pk', phone: '0312-4344454', city: 'Layyah', dept: 'dep-2', prog: 'BS Information Technology', sem: 4, sec: 'A' },
    { roll: 'BSIT-2022-002', first: 'Iqra', last: 'Malik', father: 'Malik Zafar', gender: 'Female', cnic: '32102-4567890-2', email: 'iqra.malik@gu.edu.pk', phone: '0313-5455565', city: 'Muzaffargarh', dept: 'dep-2', prog: 'BS Information Technology', sem: 4, sec: 'A' },
    { roll: 'BSIT-2022-003', first: 'Bilal', last: 'Ahmed', father: 'Ahmed Din', gender: 'Male', cnic: '32102-5678901-3', email: 'bilal.ahmed@gu.edu.pk', phone: '0314-6566676', city: 'Dera Ghazi Khan', dept: 'dep-2', prog: 'BS Information Technology', sem: 4, sec: 'A' },
    { roll: 'BSIT-2022-004', first: 'Usman', last: 'Tariq', father: 'Muhammad Tariq', gender: 'Male', cnic: '32102-6789012-5', email: 'usman.tariq2@gu.edu.pk', phone: '0315-7677787', city: 'Dera Ghazi Khan', dept: 'dep-2', prog: 'BS Information Technology', sem: 4, sec: 'B' },
    { roll: 'BSAI-2023-001', first: 'Zainab', last: 'Tariq', father: 'Tariq Mehmood', gender: 'Female', cnic: '32102-7890123-4', email: 'zainab.tariq@gu.edu.pk', phone: '0316-8788898', city: 'Multan', dept: 'dep-3', prog: 'BS Artificial Intelligence', sem: 2, sec: 'A' },
    { roll: 'BSAI-2023-002', first: 'Khadija', last: 'Tul Kubra', father: 'Hafiz Abdul Jabbar', gender: 'Female', cnic: '32102-8901234-6', email: 'khadija.kubra@gu.edu.pk', phone: '0317-9899909', city: 'Dera Ghazi Khan', dept: 'dep-3', prog: 'BS Artificial Intelligence', sem: 2, sec: 'A' },
    { roll: 'BSAI-2023-003', first: 'Shahzaib', last: 'Khan', father: 'Jahangir Khan', gender: 'Male', cnic: '32101-9012345-7', email: 'shahzaib.khan@gu.edu.pk', phone: '0318-0900010', city: 'Rajanpur', dept: 'dep-3', prog: 'BS Artificial Intelligence', sem: 2, sec: 'A' },
    { roll: 'BSAI-2023-004', first: 'Zeeshan', last: 'Ali', father: 'Liaqat Ali', gender: 'Male', cnic: '32102-0123456-9', email: 'zeeshan.ali@gu.edu.pk', phone: '0319-1011123', city: 'Dera Ghazi Khan', dept: 'dep-3', prog: 'BS Artificial Intelligence', sem: 2, sec: 'A' },
    { roll: 'BSSE-2022-001', first: 'Hamza', last: 'Saeed', father: 'Saeed Ahmad', gender: 'Male', cnic: '32102-1234567-3', email: 'hamza.saeed@gu.edu.pk', phone: '0320-2122234', city: 'Dera Ghazi Khan', dept: 'dep-4', prog: 'BS Software Engineering', sem: 4, sec: 'A' },
    { roll: 'BSSE-2022-002', first: 'Saad', last: 'Munir', father: 'Munir Hussain', gender: 'Male', cnic: '32103-2345678-5', email: 'saad.munir@gu.edu.pk', phone: '0321-3233345', city: 'Multan', dept: 'dep-4', prog: 'BS Software Engineering', sem: 4, sec: 'A' },
    { roll: 'BSSE-2022-003', first: 'Nimra', last: 'Shafiq', father: 'Muhammad Shafiq', gender: 'Female', cnic: '32102-3456789-4', email: 'nimra.shafiq@gu.edu.pk', phone: '0322-4344456', city: 'Dera Ghazi Khan', dept: 'dep-4', prog: 'BS Software Engineering', sem: 4, sec: 'A' },
    { roll: 'BSSE-2022-004', first: 'Laiba', last: 'Javed', father: 'Javed Akhtar', gender: 'Female', cnic: '32101-4567890-6', email: 'laiba.javed@gu.edu.pk', phone: '0323-5455567', city: 'Rajanpur', dept: 'dep-4', prog: 'BS Software Engineering', sem: 4, sec: 'A' },
    { roll: 'BBA-2023-001', first: 'Farhan', last: 'Qureshi', father: 'Khalid Qureshi', gender: 'Male', cnic: '32102-5678901-7', email: 'farhan.qureshi@gu.edu.pk', phone: '0324-6566678', city: 'Bahawalpur', dept: 'dep-5', prog: 'BBA (Hons)', sem: 2, sec: 'A' },
    { roll: 'BBA-2023-002', first: 'Mahnoor', last: 'Fatima', father: 'Asghar Ali', gender: 'Female', cnic: '32102-6789012-8', email: 'mahnoor.fatima@gu.edu.pk', phone: '0325-7677789', city: 'Dera Ghazi Khan', dept: 'dep-5', prog: 'BBA (Hons)', sem: 2, sec: 'A' },
    { roll: 'BSMT-2024-001', first: 'Danish', last: 'Kareem', father: 'Abdul Kareem', gender: 'Male', cnic: '32103-7890123-9', email: 'danish.kareem@gu.edu.pk', phone: '0326-8788890', city: 'Layyah', dept: 'dep-6', prog: 'BS Mathematics', sem: 1, sec: 'A' },
    { roll: 'BSMT-2024-002', first: 'Alina', last: 'Babar', father: 'Babar Azam', gender: 'Female', cnic: '32102-8901234-0', email: 'alina.babar@gu.edu.pk', phone: '0327-9899901', city: 'Dera Ghazi Khan', dept: 'dep-6', prog: 'BS Mathematics', sem: 1, sec: 'A' },
    { roll: 'BSPH-2024-001', first: 'Waqar', last: 'Younas', father: 'Younas Khan', gender: 'Male', cnic: '32102-9012345-9', email: 'waqar.younas@gu.edu.pk', phone: '0328-0900012', city: 'Muzaffargarh', dept: 'dep-7', prog: 'BS Physics', sem: 1, sec: 'A' },
    { roll: 'BSPH-2024-002', first: 'Sumaira', last: 'Parveen', father: 'Ghulam Rasool', gender: 'Female', cnic: '32102-0123456-2', email: 'sumaira.parveen@gu.edu.pk', phone: '0329-1011124', city: 'Dera Ghazi Khan', dept: 'dep-7', prog: 'BS Physics', sem: 1, sec: 'A' },
    { roll: 'BSEN-2024-001', first: 'Tayyab', last: 'Mustafa', father: 'Ghulam Mustafa', gender: 'Male', cnic: '32102-1234567-5', email: 'tayyab.mustafa@gu.edu.pk', phone: '0330-2122235', city: 'Dera Ghazi Khan', dept: 'dep-8', prog: 'BS English', sem: 1, sec: 'A' },
    { roll: 'BSEN-2024-002', first: 'Javeria', last: 'Rehman', father: 'Atta Ur Rehman', gender: 'Female', cnic: '32101-2345678-6', email: 'javeria.rehman@gu.edu.pk', phone: '0331-3233346', city: 'Rajanpur', dept: 'dep-8', prog: 'BS English', sem: 1, sec: 'A' }
  ];

  const students: Student[] = rawStudentData.map((s, idx) => ({
    id: `stu-${idx + 1}`,
    studentId: `STU-${(idx + 1).toString().padStart(3, '0')}`,
    rollNumber: s.roll,
    firstName: s.first,
    lastName: s.last,
    fatherName: s.father,
    gender: s.gender as 'Male' | 'Female',
    dateOfBirth: `200${2 + (idx % 3)}-0${1 + (idx % 9)}-${10 + (idx % 18)}`,
    cnic: s.cnic,
    email: s.email,
    phone: s.phone,
    address: `House #${12 + idx}, Block ${String.fromCharCode(65 + (idx % 8))}, Model Town`,
    city: s.city,
    province: 'Punjab',
    departmentId: s.dept,
    program: s.prog,
    semester: s.sem,
    section: s.sec,
    admissionDate: s.sem >= 4 ? '2022-09-15' : s.sem === 2 ? '2023-09-15' : '2024-09-15',
    status: 'Active',
    profileImage: undefined,
    createdAt: new Date().toISOString()
  }));

  // Enrollments: Connect students to their semester courses
  const enrollments: Enrollment[] = [];
  let enrCounter = 1;

  // Enroll CS Semester 4 students (stu-1 through stu-12) into CS-301 (crs-3) and CS-404 (crs-8)
  for (let i = 1; i <= 12; i++) {
    enrollments.push({
      id: `enr-${enrCounter}`,
      enrollmentId: `ENR-${enrCounter.toString().padStart(3, '0')}`,
      studentId: `stu-${i}`,
      courseId: 'crs-3', // CS-301 Database Systems
      semester: 4,
      academicYear: 'Spring 2024',
      enrollmentDate: '2024-02-10',
      status: 'Enrolled',
      createdAt: '2024-02-10T09:00:00.000Z'
    });
    enrCounter++;

    enrollments.push({
      id: `enr-${enrCounter}`,
      enrollmentId: `ENR-${enrCounter.toString().padStart(3, '0')}`,
      studentId: `stu-${i}`,
      courseId: 'crs-8', // CS-404 Software Engineering
      semester: 4,
      academicYear: 'Spring 2024',
      enrollmentDate: '2024-02-10',
      status: 'Enrolled',
      createdAt: '2024-02-10T09:00:00.000Z'
    });
    enrCounter++;
  }

  // Enroll IT students (stu-13 to stu-16) into IT-201 (crs-9)
  for (let i = 13; i <= 16; i++) {
    enrollments.push({
      id: `enr-${enrCounter}`,
      enrollmentId: `ENR-${enrCounter.toString().padStart(3, '0')}`,
      studentId: `stu-${i}`,
      courseId: 'crs-9',
      semester: 4,
      academicYear: 'Spring 2024',
      enrollmentDate: '2024-02-10',
      status: 'Enrolled'
    });
    enrCounter++;
  }

  // Enroll AI students (stu-17 to stu-20) into CS-201 (crs-2)
  for (let i = 17; i <= 20; i++) {
    enrollments.push({
      id: `enr-${enrCounter}`,
      enrollmentId: `ENR-${enrCounter.toString().padStart(3, '0')}`,
      studentId: `stu-${i}`,
      courseId: 'crs-2',
      semester: 2,
      academicYear: 'Spring 2024',
      enrollmentDate: '2024-02-10',
      status: 'Enrolled'
    });
    enrCounter++;
  }

  // Enroll SE students (stu-21 to stu-24) into CS-301 (crs-3) and CS-404 (crs-8)
  for (let i = 21; i <= 24; i++) {
    enrollments.push({
      id: `enr-${enrCounter}`,
      enrollmentId: `ENR-${enrCounter.toString().padStart(3, '0')}`,
      studentId: `stu-${i}`,
      courseId: 'crs-3',
      semester: 4,
      academicYear: 'Spring 2024',
      enrollmentDate: '2024-02-10',
      status: 'Enrolled'
    });
    enrCounter++;
  }

  // Enroll BBA students into BA-101
  for (let i = 25; i <= 26; i++) {
    enrollments.push({
      id: `enr-${enrCounter}`,
      enrollmentId: `ENR-${enrCounter.toString().padStart(3, '0')}`,
      studentId: `stu-${i}`,
      courseId: 'crs-12',
      semester: 2,
      academicYear: 'Spring 2024',
      enrollmentDate: '2024-02-10',
      status: 'Enrolled'
    });
    enrCounter++;
  }

  // Enroll Semester 1 students (Math, Physics, English) into MT-101, PH-101, EN-101
  for (let i = 27; i <= 32; i++) {
    enrollments.push({
      id: `enr-${enrCounter}`,
      enrollmentId: `ENR-${enrCounter.toString().padStart(3, '0')}`,
      studentId: `stu-${i}`,
      courseId: 'crs-15', // Functional English
      semester: 1,
      academicYear: 'Fall 2024',
      enrollmentDate: '2024-09-20',
      status: 'Enrolled'
    });
    enrCounter++;
  }

  // Realistic Attendance Records for CS-301 (Database Systems)
  const attendance: AttendanceRecord[] = [];
  let attCounter = 1;
  const sampleDates = ['2024-03-01', '2024-03-04', '2024-03-08', '2024-03-11', '2024-03-15'];

  // Create attendance for students 1 through 10 for CS-301 across dates
  sampleDates.forEach((date, dateIdx) => {
    for (let s = 1; s <= 10; s++) {
      // Create high attendance rate for realism
      let status: 'Present' | 'Absent' | 'Late' = 'Present';
      if ((s + dateIdx) % 7 === 0) status = 'Absent';
      else if ((s + dateIdx) % 11 === 0) status = 'Late';

      attendance.push({
        id: `att-${attCounter}`,
        attendanceId: `ATT-${attCounter.toString().padStart(4, '0')}`,
        studentId: `stu-${s}`,
        courseId: 'crs-3',
        date,
        status,
        markedBy: 'Dr. Muhammad Imran',
        remarks: status === 'Late' ? 'Arrived 15 mins late' : undefined,
        createdAt: `${date}T10:00:00.000Z`
      });
      attCounter++;
    }
  });

  // Marks Records for CS-301 and other courses
  const marks: MarkRecord[] = [];
  let markCounter = 1;

  // Students 1 to 12 marks in CS-301
  for (let s = 1; s <= 12; s++) {
    // Generate realistic distributed scores
    const quiz = Math.min(15, 11 + ((s * 3) % 5));
    const assignment = Math.min(10, 8 + (s % 3));
    const midterm = Math.min(25, 18 + ((s * 7) % 8));
    const finalExam = Math.min(40, 28 + ((s * 5) % 13));
    const practical = Math.min(10, 8 + (s % 3));
    const total = quiz + assignment + midterm + finalExam + practical;
    const percentage = Math.round((total / 100) * 100);
    const { grade, gpa } = calculateGradeAndGpa(total);

    marks.push({
      id: `mrk-${markCounter}`,
      markId: `MRK-${markCounter.toString().padStart(3, '0')}`,
      studentId: `stu-${s}`,
      courseId: 'crs-3',
      quizMarks: quiz,
      assignmentMarks: assignment,
      midtermMarks: midterm,
      finalMarks: finalExam,
      practicalMarks: practical,
      totalMarks: total,
      percentage,
      grade,
      gpa,
      academicSemester: 'Spring 2024',
      createdAt: '2024-06-15T12:00:00.000Z'
    });
    markCounter++;
  }

  // Preconfigured Users
  const users: (User & { passwordHash: string })[] = [
    {
      id: 'usr-admin',
      email: 'admin@gu.edu.pk',
      name: 'Central Administrator',
      role: 'admin',
      passwordHash: 'Admin@123',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-teacher',
      email: 'imran@gu.edu.pk',
      name: 'Dr. Muhammad Imran',
      role: 'teacher',
      facultyId: 'fac-1',
      passwordHash: 'Teacher@123',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-student',
      email: 'abdullah@gu.edu.pk',
      name: 'Muhammad Abdullah',
      role: 'student',
      studentId: 'stu-1',
      passwordHash: 'Student@123',
      createdAt: new Date().toISOString()
    }
  ];

  return {
    users,
    departments,
    faculty,
    courses,
    students,
    enrollments,
    attendance,
    marks
  };
}

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Verify key tables exist
        if (parsed.students && parsed.faculty && parsed.departments && parsed.courses) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading database file, resetting to initial seed:', err);
    }

    // Default seed
    const initial = getInitialSeedData();
    this.saveData(initial);
    return initial;
  }

  public saveData(dataToSave?: DatabaseSchema) {
    if (dataToSave) {
      this.data = dataToSave;
    }
    this.ensureDirectory();
    // Atomic write to prevent file corruption
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public resetToSeed(): DatabaseSchema {
    const seed = getInitialSeedData();
    this.saveData(seed);
    return seed;
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.data.users.map(({ passwordHash: _, ...safe }) => safe);
  }

  public getUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public addUser(userData: {
    email: string;
    name: string;
    role: 'admin' | 'teacher' | 'student';
    passwordHash: string;
    studentId?: string;
    facultyId?: string;
  }): User {
    const newUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      email: userData.email.toLowerCase(),
      name: userData.name,
      role: userData.role,
      passwordHash: userData.passwordHash,
      studentId: userData.studentId,
      facultyId: userData.facultyId,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveData();
    const { passwordHash: _, ...safe } = newUser;
    return safe;
  }

  public updateUser(id: string, updates: Partial<User & { passwordHash?: string }>): User | null {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.saveData();
    const { passwordHash: _, ...safe } = this.data.users[index];
    return safe;
  }

  public deleteUser(id: string): boolean {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.data.users.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- Departments ---
  public getDepartments(): Department[] {
    return this.data.departments;
  }

  public getDepartmentById(id: string): Department | undefined {
    return this.data.departments.find(d => d.id === id || d.departmentId === id);
  }

  public addDepartment(dep: Omit<Department, 'id' | 'departmentId'>): Department {
    const count = this.data.departments.length + 1;
    const newDep: Department = {
      ...dep,
      id: `dep-${Date.now()}`,
      departmentId: `DEP-${count.toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    this.data.departments.push(newDep);
    this.saveData();
    return newDep;
  }

  public updateDepartment(id: string, updates: Partial<Department>): Department | null {
    const index = this.data.departments.findIndex(d => d.id === id);
    if (index === -1) return null;
    this.data.departments[index] = { ...this.data.departments[index], ...updates };
    this.saveData();
    return this.data.departments[index];
  }

  public deleteDepartment(id: string): boolean {
    const index = this.data.departments.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.data.departments.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- Faculty ---
  public getFaculty(): Faculty[] {
    return this.data.faculty;
  }

  public getFacultyById(id: string): Faculty | undefined {
    return this.data.faculty.find(f => f.id === id || f.facultyId === id);
  }

  public addFaculty(fac: Omit<Faculty, 'id' | 'facultyId'>): Faculty {
    const count = this.data.faculty.length + 1;
    const newFac: Faculty = {
      ...fac,
      id: `fac-${Date.now()}`,
      facultyId: `FAC-${count.toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    this.data.faculty.push(newFac);

    // Auto-create or link user account for faculty
    const existingUser = this.getUserByEmail(fac.email);
    if (!existingUser) {
      this.addUser({
        email: fac.email,
        name: `${fac.firstName} ${fac.lastName}`,
        role: 'teacher',
        facultyId: newFac.id,
        passwordHash: 'Teacher@123'
      });
    }

    this.saveData();
    return newFac;
  }

  public updateFaculty(id: string, updates: Partial<Faculty>): Faculty | null {
    const index = this.data.faculty.findIndex(f => f.id === id);
    if (index === -1) return null;
    const oldEmail = this.data.faculty[index].email;
    this.data.faculty[index] = { ...this.data.faculty[index], ...updates };

    // Update associated user if email or name changed
    const user = this.data.users.find(u => u.facultyId === id || u.email.toLowerCase() === oldEmail.toLowerCase());
    if (user) {
      if (updates.email) user.email = updates.email.toLowerCase();
      if (updates.firstName || updates.lastName) {
        user.name = `${updates.firstName || this.data.faculty[index].firstName} ${updates.lastName || this.data.faculty[index].lastName}`;
      }
    }

    this.saveData();
    return this.data.faculty[index];
  }

  public deleteFaculty(id: string): boolean {
    const index = this.data.faculty.findIndex(f => f.id === id);
    if (index === -1) return false;
    const fac = this.data.faculty[index];
    this.data.faculty.splice(index, 1);
    // Unassign from courses
    this.data.courses.forEach(c => {
      if (c.teacherId === id) c.teacherId = '';
    });
    // Remove linked user account
    this.data.users = this.data.users.filter(u => u.facultyId !== id && u.email.toLowerCase() !== fac.email.toLowerCase());
    this.saveData();
    return true;
  }

  // --- Courses ---
  public getCourses(): Course[] {
    return this.data.courses;
  }

  public getCourseById(id: string): Course | undefined {
    return this.data.courses.find(c => c.id === id || c.courseId === id || c.courseCode.toLowerCase() === id.toLowerCase());
  }

  public addCourse(crs: Omit<Course, 'id' | 'courseId'>): Course {
    const count = this.data.courses.length + 1;
    const newCrs: Course = {
      ...crs,
      id: `crs-${Date.now()}`,
      courseId: `CRS-${count.toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    this.data.courses.push(newCrs);
    this.saveData();
    return newCrs;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | null {
    const index = this.data.courses.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.courses[index] = { ...this.data.courses[index], ...updates };
    this.saveData();
    return this.data.courses[index];
  }

  public deleteCourse(id: string): boolean {
    const index = this.data.courses.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.data.courses.splice(index, 1);
    // Cascade cleanup: remove linked enrollments, attendance, and marks
    this.data.enrollments = this.data.enrollments.filter(e => e.courseId !== id);
    this.data.attendance = this.data.attendance.filter(a => a.courseId !== id);
    this.data.marks = this.data.marks.filter(m => m.courseId !== id);
    this.saveData();
    return true;
  }

  // --- Students ---
  public getStudents(): Student[] {
    return this.data.students;
  }

  public getStudentById(id: string): Student | undefined {
    return this.data.students.find(s => s.id === id || s.studentId === id || s.rollNumber.toLowerCase() === id.toLowerCase());
  }

  public addStudent(studentData: Omit<Student, 'id' | 'studentId'>): Student {
    const count = this.data.students.length + 1;
    const newStudent: Student = {
      ...studentData,
      id: `stu-${Date.now()}`,
      studentId: `STU-${count.toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.students.unshift(newStudent);

    // Auto-create or link user account for student
    const existingUser = this.getUserByEmail(studentData.email);
    if (!existingUser) {
      this.addUser({
        email: studentData.email,
        name: `${studentData.firstName} ${studentData.lastName}`,
        role: 'student',
        studentId: newStudent.id,
        passwordHash: 'Student@123'
      });
    }

    this.saveData();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student | null {
    const index = this.data.students.findIndex(s => s.id === id);
    if (index === -1) return null;
    const oldEmail = this.data.students[index].email;
    this.data.students[index] = {
      ...this.data.students[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Update associated user if email or name changed
    const user = this.data.users.find(u => u.studentId === id || u.email.toLowerCase() === oldEmail.toLowerCase());
    if (user) {
      if (updates.email) user.email = updates.email.toLowerCase();
      if (updates.firstName || updates.lastName) {
        user.name = `${updates.firstName || this.data.students[index].firstName} ${updates.lastName || this.data.students[index].lastName}`;
      }
    }

    this.saveData();
    return this.data.students[index];
  }

  public deleteStudent(id: string): boolean {
    const index = this.data.students.findIndex(s => s.id === id);
    if (index === -1) return false;
    const student = this.data.students[index];
    this.data.students.splice(index, 1);
    // Cascade cleanup: remove student's enrollments, attendance, marks, and user account
    this.data.enrollments = this.data.enrollments.filter(e => e.studentId !== id);
    this.data.attendance = this.data.attendance.filter(a => a.studentId !== id);
    this.data.marks = this.data.marks.filter(m => m.studentId !== id);
    this.data.users = this.data.users.filter(u => u.studentId !== id && u.email.toLowerCase() !== student.email.toLowerCase());
    this.saveData();
    return true;
  }

  // --- Enrollments ---
  public getEnrollments(): Enrollment[] {
    return this.data.enrollments;
  }

  public getEnrollmentById(id: string): Enrollment | undefined {
    return this.data.enrollments.find(e => e.id === id || e.enrollmentId === id);
  }

  public addEnrollment(enrollmentData: Omit<Enrollment, 'id' | 'enrollmentId'>): Enrollment {
    const count = this.data.enrollments.length + 1;
    const newEnrollment: Enrollment = {
      ...enrollmentData,
      id: `enr-${Date.now()}`,
      enrollmentId: `ENR-${count.toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    this.data.enrollments.push(newEnrollment);
    this.saveData();
    return newEnrollment;
  }

  public updateEnrollment(id: string, updates: Partial<Enrollment>): Enrollment | null {
    const index = this.data.enrollments.findIndex(e => e.id === id);
    if (index === -1) return null;
    this.data.enrollments[index] = { ...this.data.enrollments[index], ...updates };
    this.saveData();
    return this.data.enrollments[index];
  }

  public deleteEnrollment(id: string): boolean {
    const index = this.data.enrollments.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.data.enrollments.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- Attendance ---
  public getAttendance(): AttendanceRecord[] {
    return this.data.attendance;
  }

  public getAttendanceById(id: string): AttendanceRecord | undefined {
    return this.data.attendance.find(a => a.id === id || a.attendanceId === id);
  }

  public addAttendanceRecord(rec: Omit<AttendanceRecord, 'id' | 'attendanceId'>): AttendanceRecord {
    // Check if existing record for student + course + date
    const existingIdx = this.data.attendance.findIndex(
      a => a.studentId === rec.studentId && a.courseId === rec.courseId && a.date === rec.date
    );

    if (existingIdx !== -1) {
      this.data.attendance[existingIdx].status = rec.status;
      this.data.attendance[existingIdx].markedBy = rec.markedBy;
      this.data.attendance[existingIdx].remarks = rec.remarks;
      this.saveData();
      return this.data.attendance[existingIdx];
    } else {
      const count = this.data.attendance.length + 1;
      const newRecord: AttendanceRecord = {
        ...rec,
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        attendanceId: `ATT-${count.toString().padStart(4, '0')}`,
        createdAt: new Date().toISOString()
      };
      this.data.attendance.push(newRecord);
      this.saveData();
      return newRecord;
    }
  }

  public recordAttendanceBatch(records: Omit<AttendanceRecord, 'id' | 'attendanceId'>[]): AttendanceRecord[] {
    const created: AttendanceRecord[] = [];
    records.forEach(rec => {
      const record = this.addAttendanceRecord(rec);
      created.push(record);
    });
    return created;
  }

  public updateAttendance(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | null {
    const index = this.data.attendance.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.data.attendance[index] = { ...this.data.attendance[index], ...updates };
    this.saveData();
    return this.data.attendance[index];
  }

  public deleteAttendance(id: string): boolean {
    const index = this.data.attendance.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.data.attendance.splice(index, 1);
    this.saveData();
    return true;
  }

  public getAttendanceSummary(courseId?: string, studentId?: string): AttendanceSummary[] {
    const summaries: AttendanceSummary[] = [];

    // Filter relevant students and courses
    const targetStudents = studentId ? this.data.students.filter(s => s.id === studentId) : this.data.students;

    targetStudents.forEach(student => {
      // Find courses student is enrolled in
      const studentEnrollments = this.data.enrollments.filter(e => e.studentId === student.id);
      studentEnrollments.forEach(enr => {
        if (courseId && enr.courseId !== courseId) return;

        const course = this.data.courses.find(c => c.id === enr.courseId);
        if (!course) return;

        const records = this.data.attendance.filter(a => a.studentId === student.id && a.courseId === enr.courseId);
        const totalClasses = records.length;
        const present = records.filter(a => a.status === 'Present').length;
        const absent = records.filter(a => a.status === 'Absent').length;
        const late = records.filter(a => a.status === 'Late').length;
        const percentage = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0;

        summaries.push({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          rollNumber: student.rollNumber,
          courseId: course.id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          totalClasses,
          present,
          absent,
          late,
          percentage
        });
      });
    });

    return summaries;
  }

  // --- Marks & Results ---
  public getMarks(): MarkRecord[] {
    return this.data.marks;
  }

  public getMarkById(id: string): MarkRecord | undefined {
    return this.data.marks.find(m => m.id === id || m.markId === id);
  }

  public addMark(markData: Omit<MarkRecord, 'id' | 'markId' | 'totalMarks' | 'percentage' | 'grade' | 'gpa'>): MarkRecord {
    const totalMarks = (markData.quizMarks || 0) +
                       (markData.assignmentMarks || 0) +
                       (markData.midtermMarks || 0) +
                       (markData.finalMarks || 0) +
                       (markData.practicalMarks || 0);

    const percentage = Math.round((totalMarks / 100) * 100);
    const { grade, gpa } = calculateGradeAndGpa(totalMarks);

    const count = this.data.marks.length + 1;
    const newMark: MarkRecord = {
      ...markData,
      id: `mrk-${Date.now()}`,
      markId: `MRK-${count.toString().padStart(3, '0')}`,
      totalMarks,
      percentage,
      grade,
      gpa,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.marks.push(newMark);
    this.saveData();
    return newMark;
  }

  public updateMark(id: string, updates: Partial<MarkRecord>): MarkRecord | null {
    const index = this.data.marks.findIndex(m => m.id === id);
    if (index === -1) return null;

    const current = this.data.marks[index];
    const quiz = updates.quizMarks !== undefined ? updates.quizMarks : current.quizMarks;
    const assignment = updates.assignmentMarks !== undefined ? updates.assignmentMarks : current.assignmentMarks;
    const midterm = updates.midtermMarks !== undefined ? updates.midtermMarks : current.midtermMarks;
    const finalExam = updates.finalMarks !== undefined ? updates.finalMarks : current.finalMarks;
    const practical = updates.practicalMarks !== undefined ? updates.practicalMarks : current.practicalMarks;

    const totalMarks = quiz + assignment + midterm + finalExam + practical;
    const percentage = Math.round((totalMarks / 100) * 100);
    const { grade, gpa } = calculateGradeAndGpa(totalMarks);

    this.data.marks[index] = {
      ...current,
      ...updates,
      quizMarks: quiz,
      assignmentMarks: assignment,
      midtermMarks: midterm,
      finalMarks: finalExam,
      practicalMarks: practical,
      totalMarks,
      percentage,
      grade,
      gpa,
      updatedAt: new Date().toISOString()
    };

    this.saveData();
    return this.data.marks[index];
  }

  public deleteMark(id: string): boolean {
    const index = this.data.marks.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.data.marks.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- Real Dynamic Dashboard Statistics ---
  public getDashboardStats(): DashboardStats {
    const totalStudents = this.data.students.length;
    const totalFaculty = this.data.faculty.length;
    const totalDepartments = this.data.departments.length;
    const totalCourses = this.data.courses.length;

    const activeStudents = this.data.students.filter(s => s.status === 'Active').length;
    const maleStudents = this.data.students.filter(s => s.gender === 'Male').length;
    const femaleStudents = this.data.students.filter(s => s.gender === 'Female').length;

    // Attendance calculation from records
    let averageAttendance = 85;
    if (this.data.attendance.length > 0) {
      const presentCount = this.data.attendance.filter(a => a.status === 'Present').length;
      averageAttendance = Math.round((presentCount / this.data.attendance.length) * 100);
    }

    // Average GPA from marks records
    let averageGpa = 3.25;
    if (this.data.marks.length > 0) {
      const sumGpa = this.data.marks.reduce((acc, m) => acc + m.gpa, 0);
      averageGpa = Number((sumGpa / this.data.marks.length).toFixed(2));
    }

    // Students by department
    const departmentStats = this.data.departments.map(dept => {
      const count = this.data.students.filter(s => s.departmentId === dept.id).length;
      return {
        name: dept.departmentName.replace('Department of ', ''),
        code: dept.departmentCode,
        studentCount: count
      };
    });

    // Enrollment statistics across semesters
    const semesterCountMap: Record<string, number> = {};
    this.data.students.forEach(s => {
      const key = `Semester ${s.semester}`;
      semesterCountMap[key] = (semesterCountMap[key] || 0) + 1;
    });
    const enrollmentStats = Object.keys(semesterCountMap).sort().map(sem => ({
      semester: sem,
      count: semesterCountMap[sem]
    }));

    // Attendance distribution
    const presentTotal = this.data.attendance.filter(a => a.status === 'Present').length;
    const absentTotal = this.data.attendance.filter(a => a.status === 'Absent').length;
    const lateTotal = this.data.attendance.filter(a => a.status === 'Late').length;

    const attendanceDistribution = [
      { name: 'Present', value: presentTotal, color: '#16A34A' },
      { name: 'Absent', value: absentTotal, color: '#DC2626' },
      { name: 'Late', value: lateTotal, color: '#EAB308' }
    ];

    // GPA distribution
    const gradeBuckets: Record<string, number> = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'F': 0 };
    this.data.marks.forEach(m => {
      if (gradeBuckets[m.grade] !== undefined) {
        gradeBuckets[m.grade]++;
      }
    });

    const gpaDistribution = Object.keys(gradeBuckets).map(grade => ({
      grade,
      count: gradeBuckets[grade]
    }));

    return {
      totalStudents,
      totalFaculty,
      totalDepartments,
      totalCourses,
      activeStudents,
      maleStudents,
      femaleStudents,
      averageAttendance,
      averageGpa,
      departmentStats,
      enrollmentStats,
      attendanceDistribution,
      gpaDistribution
    };
  }
}

export const dbService = new DatabaseService();
