# StaffSync — Modern Human Resource Management System

![StaffSync HRMS](https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80)

[![Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev)
[![Node](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.2+-646CFF.svg)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **StaffSync** is an enterprise-grade, modern, and centralized Human Resource Management System (HRMS) built with the MERN stack. It digitizes workforce administration, streamlines attendance and shift clocks, automates leave review workflows, broadcasts organization notices, tracks professional training tracks, and delivers interactive visual HR analytics.

---

## 🌟 Key Features & Functional Modules

### 1. 🛡️ Three Distinct User Roles (Role-Based Access Control)
- **👑 HR Administrator:** Complete organizational governance, staff directory creation and deactivation, global attendance oversight and regularization, leave approval authority, company announcement publishing, training course management, and corporate analytics.
- **💼 Team Manager:** Departmental leadership, team attendance monitoring, direct report leave approval/rejection queue with supervisor comments, training progress supervision, and department-level insights.
- **💻 Staff Employee:** Shift punch clock (Office/Remote/Hybrid modes), live duration counter, personal attendance history with monthly work hours stats, 1-click leave requests with balance deductions, interactive course progression tracking, and company noticeboard.

### 2. ⚡ Immediate One-Click Demo Access
The login portal features pre-configured 1-click demo buttons allowing instant evaluation without manual typing:
- **HR Admin:** `admin@staffsync.com` / `password123` (Eleanor Vance — Full System Privileges)
- **Team Manager:** `manager@staffsync.com` / `password123` (Marcus Brody — Engineering Director)
- **Staff Employee:** `employee@staffsync.com` / `password123` (Alex Rivera — Senior Software Engineer)

---

### 3. 👥 Staff Directory & Employee Management
- Searchable & filterable directory by **Name**, **Employee ID**, **Email**, **Department**, **Role**, and **Status**.
- **Dual View Modes:** Responsive Card Grid view and high-density Table view.
- **Comprehensive Profile Modal:** Detailed view showing department, designation, salary, join date, contact info, residential address, emergency contact, and leave balance quotas.
- **Employee Creation & Editing (Admin/Manager):** Full validation and automatic employee ID generation (`EMP-XXXX`).

---

### 4. ⏱️ Automated Attendance & Shift Punch Clock
- **Interactive Shift Clock Card:** 1-click **Clock In** and **Clock Out** with live timestamps and automatic work duration calculation.
- **Work Mode Selection:** Office, Remote, or Hybrid tags with location notes.
- **Lateness & Half-Day Detection:** Automatic classification based on shift arrival time and total duration.
- **My Attendance History:** Monthly work hours, on-time percentage, late count, and daily log table.
- **HR Attendance Regularization:** Administrators can adjust or manually create shift logs.
- **Export to CSV:** Instant download of filtered attendance records for payroll auditing.

---

### 5. 🌴 Leave & Time-Off Management
- **Leave Allowances:** Tracks Casual, Sick, Annual, and Parental balances per employee.
- **Application Portal:** Dynamic date range picker, duration calculator, half-day toggling, and reason specification with real-time balance validation.
- **Review & Approval Queue:** Managers and Admins review pending requests with **Approve** / **Reject** decisions and supervisor remarks.
- **Automated Deduction:** Approved leaves automatically update employee balance pools.

---

### 6. 📢 Company Notice Board & Broadcasts
- Categorized announcements: *Company News*, *Policy*, *Event*, *Holiday*, and *Urgent Alert*.
- Urgency indicators (High / Medium / Low) and pinned notice highlights.
- Audience targeting: Broadcast to all staff or targeted specific departments.

---

### 7. 🎓 Training & Professional Development
- Course catalog with estimated duration, syllabus modules, instructor profiles, and completion deadlines.
- Interactive learning progress slider and module completion checkpoints.
- Automatic **Certified** badge issuance upon 100% course completion.

---

### 8. 📊 HR Analytics & Reporting (Recharts)
- **Weekly Attendance Trends:** Dynamic Bar Chart comparing on-time vs. late attendance over the last 7 days.
- **Department Headcount Breakdown:** Donut/Pie Chart with custom color palette.
- **Custom CSV Report Generator:** Filter by date range and department to export clean audit spreadsheets.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React, Recharts, React Hot Toast |
| **Backend** | Node.js, Express.js, RESTful APIs, JWT (jsonwebtoken), bcryptjs, Morgan |
| **Database** | MongoDB, Mongoose ODM (includes embedded `mongodb-memory-server` zero-config fallback) |
| **Testing** | Node.js Integration Test Suite (`server/test_api.js`) |

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+ recommended)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/Yatharthjaiswal1007/StaffSync---Modern-human-resource-management.git
cd StaffSync---Modern-human-resource-management
```

### 2. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install-all
```
*(Or install individually: `cd server && npm install`, then `cd ../client && npm install`)*

### 3. Environment Configuration
The backend comes pre-configured with sensible defaults:
- `server/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/staffsync
JWT_SECRET=staffsync_super_secret_jwt_key_2026
```
> **Zero-Setup Database:** If a local MongoDB server is not running on port 27017, StaffSync will automatically launch an embedded in-memory MongoDB instance and auto-seed realistic demo data on the first run! You can also supply a MongoDB Atlas connection string in `MONGODB_URI`.

### 4. Run the Full Application
```bash
# Starts both Backend (Port 5000) and Frontend (Port 3000) concurrently
npm run dev
```

Open your browser at:
👉 **http://localhost:3000**

---

## 🧪 Automated Integration Tests

To run the automated API verification test suite:
```bash
cd server
npm test
```
The test verifies:
- API Health Status
- Demo Accounts Retrieval
- HR Admin, Manager, and Employee JWT authentication
- Role-based dashboard analytics endpoints
- Attendance clock-in & status checks
- Leave application & balance deductions
- Notice board retrieval

---

## 📁 Repository Structure

```text
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/layout/  # Navbar, Sidebar, Layout
│   │   ├── context/            # AuthContext (state & JWT persistence)
│   │   ├── pages/              # Login, Dashboard, Employees, Attendance, Leaves, Announcements, Training, Reports, Profile
│   │   ├── services/           # Axios API client with interceptors
│   │   ├── App.jsx             # Routes & role guards
│   │   ├── index.css           # Tailwind directives & styles
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Express + Node.js Backend
│   ├── config/                 # DB connection with in-memory fallback
│   ├── controllers/            # Auth, Employees, Attendance, Leaves, Announcements, Training, Reports
│   ├── middleware/             # JWT auth protection & role authorizers
│   ├── models/                 # User, Attendance, Leave, Announcement, Training, Department
│   ├── routes/                 # REST API endpoints
│   ├── utils/                  # Rich database seeder
│   ├── server.js               # Express application entrypoint
│   ├── test_api.js             # Integration test suite
│   └── package.json
│
├── package.json                # Root orchestration & scripts
├── .gitignore
└── README.md
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/demo-accounts` | Public | Retrieve pre-configured demo logins |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update contact details & address |
| `PUT` | `/api/auth/change-password` | Private | Change account password |
| `GET` | `/api/employees` | Private | Search & filter staff directory |
| `POST` | `/api/employees` | Admin | Register new employee |
| `PUT` | `/api/employees/:id` | Admin/Manager | Update employee info & status |
| `DELETE` | `/api/employees/:id` | Admin | Remove employee |
| `POST` | `/api/attendance/clock-in` | Private | Record shift start |
| `POST` | `/api/attendance/clock-out` | Private | Record shift completion & hours |
| `GET` | `/api/attendance/today` | Private | Retrieve today's punch status |
| `GET` | `/api/attendance/my` | Private | Retrieve personal attendance logs |
| `GET` | `/api/attendance/all` | Admin/Manager | View organizational attendance |
| `POST` | `/api/attendance/regularize`| Admin | Manually adjust/record shift |
| `POST` | `/api/leaves/apply` | Private | Submit time-off request |
| `GET` | `/api/leaves/my` | Private | Get personal leave history & balances |
| `GET` | `/api/leaves/all` | Admin/Manager | Review leave approval queue |
| `PUT` | `/api/leaves/:id/review` | Admin/Manager | Approve or reject leave request |
| `GET` | `/api/announcements` | Private | View company notices & broadcasts |
| `POST` | `/api/announcements` | Admin/Manager | Publish new company announcement |
| `GET` | `/api/training` | Private | List training courses & progress |
| `POST` | `/api/training/:id/enroll` | Private | Enroll in training module |
| `PUT` | `/api/training/:id/progress`| Private | Update course progression |
| `GET` | `/api/reports/dashboard` | Private | Role-tailored HR analytics metrics |
| `GET` | `/api/reports/attendance-export` | Admin/Manager | Export attendance logs to CSV |

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
