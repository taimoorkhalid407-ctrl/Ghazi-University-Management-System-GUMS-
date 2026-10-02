# Ghazi University Management System (GUMS)

> **Academic Project – Ghazi University Management System**  
> *Inspired by Ghazi University, Dera Ghazi Khan, Punjab, Pakistan. This software is an educational full-stack academic management ERP project designed for university software engineering and database verification.*

---

## 1. Project Overview

**Ghazi University Management System (GUMS)** is a comprehensive, production-quality full-stack academic enterprise web application. It automates key university operational domains including student admissions, faculty registry, curriculum management, course enrollments, lecture attendance tracking, examination grading, automated GPA derivations, and administrative reporting.

The system features real-time **Frontend → Backend → Database → Response → UI Update** flows. Every CRUD operation is persistent: modifications, creations, and deletions survive browser refreshes and server restarts.

---

## 2. Key Features

### 🎓 1. Student Information System (SIS)
- Full CRUD operations (Add, View, Edit, Delete with confirmation dialog).
- Multi-parameter search by student name, roll number, email, or phone.
- Filter by Academic Department, Semester (1–8), Gender, and Enrollment Status.
- Client and server-side validation for Pakistani CNIC (`12345-1234567-1`) and Pakistani phone numbers.
- Uniqueness constraints on student roll numbers and academic emails.
- Detailed student dossier modal displaying bio-data, father name, enrolled courses, and exam transcript.

### 🏛️ 2. Academic Departments
- CRUD management for 8 faculties: Computer Science, Information Technology, Artificial Intelligence, Software Engineering, Business Administration, Mathematics, Physics, and English.
- Designated Head of Department (HOD) tracking, official emails, and phone extensions.
- Referential integrity guard preventing deletion of departments with active students.

### 👨‍🏫 3. Faculty & Staff Registry
- Comprehensive records for academic staff: Employee ID, designation (Professor, Associate Professor, Assistant Professor, Lecturer, Visiting Lecturer), qualification, and joining date.
- Search and departmental filters.

### 📚 4. Curriculum & Course Management
- HEC-aligned course directory with unique course codes (e.g., `CS-101`, `CS-301`, `AI-301`).
- Credit hour allocations (1 to 5 CH), semester assignment, and faculty instructor assignment.

### 📝 5. Enrollment Management
- Student course registration across academic semesters and sessions (e.g., *Spring 2024*).
- **Duplicate enrollment prevention**: Strict server check rejects duplicate registrations of the same student in the same course and semester.

### 📅 6. Lecture Attendance System
- Interactive class attendance marking by course and lecture date.
- Batch attendance sheet with "Mark All Present" shortcut.
- Status options: **Present**, **Absent**, and **Late**.
- **Automated Attendance Percentage Formula**:
  $$\text{Attendance \%} = \left(\frac{\text{Present Classes}}{\text{Total Classes}}\right) \times 100$$
- Visual indicators flagging students below the 75% HEC examination eligibility threshold.
- Duplicate attendance validation prevents orphaned double-entries for the same student, course, and date.

### 🏆 7. Examinations, Marks & GPA Derivations
- Multi-component assessment breakdown with strict boundary validations:
  - Quiz: max 15
  - Assignment: max 10
  - Midterm: max 25
  - Final Exam: max 40
  - Practical / Lab: max 10
- **Automated Derivations**:
  - **Total Marks** (out of 100)
  - **Percentage**
  - **Letter Grade**:
    - `A+` = 90–100 (4.00 GPA)
    - `A`  = 80–89 (3.70 GPA)
    - `B+` = 75–79 (3.30 GPA)
    - `B`  = 70–74 (3.00 GPA)
    - `C+` = 65–69 (2.50 GPA)
    - `C`  = 60–64 (2.00 GPA)
    - `D`  = 50–59 (1.00 GPA)
    - `F`  = Below 50 (0.00 GPA)
- Printable Official Transcript / Grade Slip modal.

### 📊 8. Executive Dashboard & Charts
- Dynamic database-calculated KPIs (never hardcoded):
  - Total Students & Active Students count
  - Gender Distribution (Male vs. Female)
  - Total Faculty, Departments, and Courses
  - Live Average Attendance % across all lecture sessions
  - Live Institutional Average GPA
- 4 interactive visual charts powered by Recharts:
  1. **Students by Department** (Bar Chart)
  2. **Student Enrollment Statistics by Cohort** (Area Trend)
  3. **Attendance Distribution** (Donut Chart: Present vs Absent vs Late)
  4. **GPA & Letter Grade Performance** (Curve Distribution)

### 📄 9. Institutional Reports & CSV Export
- 5 comprehensive institutional dossiers:
  1. Student Directory Report
  2. Department-wise Student Enrollment Report
  3. Class Attendance Analysis Report
  4. Examination Marks & Results Report
  5. Course Registration & Syllabus Summary
- Real-time client-side search and filters.
- **One-click CSV download** for spreadsheets and external audits.
- Print-optimized CSS layout for paper reports.

### 👤 10. Dedicated Student Portal
- When logged in as a student, access is securely scoped to their personal record:
  - Personal profile & bio-data
  - Enrolled courses list
  - Personal attendance percentages & eligibility badge
  - Official examination transcript with Cumulative GPA (CGPA)

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Recharts, Motion.
- **Backend**: Node.js, Express, TypeScript (`tsx`).
- **Database & Persistence**: Real file-backed persistent database (`data/gums_database.json`) with atomic write synchronization (`fs.writeFileSync` / temp swap), ensuring persistent storage across server restarts and browser reloads.
- **Authentication**: Role-Based Access Control (RBAC) with token sessions supporting Admin, Teacher, and Student roles.

---

## 4. Demo User Accounts

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gu.edu.pk` | `Admin@123` | Full access across all 10 modules and system configuration. |
| **Teacher** | `imran@gu.edu.pk` | `Teacher@123` | Access to Students, Courses, Attendance, Marks & Results, and Reports. |
| **Student** | `abdullah@gu.edu.pk` | `Student@123` | Scoped to own profile, enrolled courses, attendance, and exam results. |

*Quick 1-click demo login buttons are provided on the login page and header dropdown for rapid manual verification.*

---

## 5. Database Schema & Collections

Data is structured in normalized collections:
1. `users`: Credentials, name, role (`admin` \| `teacher` \| `student`), foreign keys (`studentId`, `facultyId`).
2. `students`: Bio-data, Pakistani CNIC, rollNumber, departmentId, program, semester, section, status.
3. `departments`: departmentCode, departmentName, hodName, email, phone, status.
4. `faculty`: employeeId, name, designation, departmentId, qualification, joiningDate, status.
5. `courses`: courseCode, courseName, creditHours, departmentId, semester, teacherId, status.
6. `enrollments`: studentId, courseId, semester, academicYear, status.
7. `attendance`: studentId, courseId, date, status (`Present` \| `Absent` \| `Late`), markedBy.
8. `marks`: studentId, courseId, quizMarks, assignmentMarks, midtermMarks, finalMarks, practicalMarks, totalMarks, percentage, grade, gpa.

---

## 6. Installation & Local Development

### Prerequisites
- Node.js (version 18 or higher)
- npm or pnpm

### Setup
```bash
# 1. Clone repository
git clone https://github.com/example/ghazi-university-management-system.git
cd ghazi-university-management-system

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
The application will boot on `http://localhost:3000`.

### Production Build & Launch
```bash
# Build production bundle
npm run build

# Start production server
npm start
```

---

## 7. How to Seed or Reset the Database

The application ships with realistic Pakistani university sample data pre-seeded (32 students, 10 faculty members, 8 departments, 15 courses, 50+ enrollments, attendance records, and examination grades).

To reset or restore the pristine dataset at any time:
1. Navigate to the **Settings** tab in the sidebar.
2. Under "Academic Database State", click **Reset / Re-Seed Database**.
3. Confirm in the dialog. The system will reload the complete realistic Ghazi University dataset.

---

## 8. System Testing & Verification

Please consult **[TESTING.md](./TESTING.md)** for the complete test case matrix (TC-01 through TC-26) covering login, validation, CRUD operations, duplicate prevention, GPA calculations, role permissions, and persistence tests.
