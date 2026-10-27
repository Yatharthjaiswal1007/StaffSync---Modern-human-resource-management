const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');
const Department = require('../models/Department');

const seedData = async () => {
  console.log('[Seeder] Starting database seeding...');

  // 1. Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Attendance.deleteMany({}),
    Leave.deleteMany({}),
    Announcement.deleteMany({}),
    Training.deleteMany({}),
    Department.deleteMany({}),
  ]);

  // 2. Seed Departments
  const departments = await Department.insertMany([
    { name: 'Engineering', code: 'ENG', description: 'Software engineering, QA, DevOps, and infrastructure' },
    { name: 'Human Resources', code: 'HR', description: 'People operations, talent acquisition, culture, and compliance' },
    { name: 'Marketing', code: 'MKT', description: 'Growth, content, digital marketing, and brand strategy' },
    { name: 'Finance', code: 'FIN', description: 'Accounting, payroll, auditing, and corporate treasury' },
    { name: 'Sales', code: 'SLS', description: 'Direct sales, client success, and enterprise partnerships' },
    { name: 'Operations', code: 'OPS', description: 'Logistics, office administration, and business workflow' },
  ]);

  // 3. Seed Users
  // Admin user
  const admin = await User.create({
    employeeId: 'EMP-1001',
    name: 'Eleanor Vance',
    email: 'admin@staffsync.com',
    password: 'password123',
    role: 'admin',
    department: 'Human Resources',
    designation: 'Head of Human Resources',
    phone: '+1 (555) 019-2834',
    salary: 115000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    address: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'IL', zip: '62704', country: 'USA' },
    emergencyContact: { name: 'Arthur Vance', relationship: 'Spouse', phone: '+1 (555) 019-2835' },
    leaveBalances: { casual: 12, sick: 10, annual: 18, maternityPaternity: 10, unpaid: 0 },
  });

  // Manager user (Engineering)
  const managerEng = await User.create({
    employeeId: 'EMP-1002',
    name: 'Marcus Brody',
    email: 'manager@staffsync.com',
    password: 'password123',
    role: 'manager',
    department: 'Engineering',
    designation: 'Engineering Director',
    phone: '+1 (555) 345-9871',
    salary: 135000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    reportingManager: admin._id,
    address: { street: '120 Market Street', city: 'San Francisco', state: 'CA', zip: '94103', country: 'USA' },
    emergencyContact: { name: 'Elena Brody', relationship: 'Sister', phone: '+1 (555) 345-9872' },
    leaveBalances: { casual: 10, sick: 9, annual: 15, maternityPaternity: 10, unpaid: 0 },
  });

  // Manager user (Marketing)
  const managerMkt = await User.create({
    employeeId: 'EMP-1003',
    name: 'Sarah Chen',
    email: 'sarah.mkt@staffsync.com',
    password: 'password123',
    role: 'manager',
    department: 'Marketing',
    designation: 'VP of Marketing',
    phone: '+1 (555) 432-8765',
    salary: 120000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    reportingManager: admin._id,
    address: { street: '88 Madison Ave', city: 'New York', state: 'NY', zip: '10016', country: 'USA' },
    emergencyContact: { name: 'David Chen', relationship: 'Brother', phone: '+1 (555) 432-8766' },
    leaveBalances: { casual: 11, sick: 8, annual: 14, maternityPaternity: 10, unpaid: 0 },
  });

  // Core Employee (Engineering)
  const employeeAlex = await User.create({
    employeeId: 'EMP-1004',
    name: 'Alex Rivera',
    email: 'employee@staffsync.com',
    password: 'password123',
    role: 'employee',
    department: 'Engineering',
    designation: 'Senior Full Stack Engineer',
    phone: '+1 (555) 678-1234',
    salary: 95000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    reportingManager: managerEng._id,
    address: { street: '450 Pine Tree Lane', city: 'Austin', state: 'TX', zip: '78701', country: 'USA' },
    emergencyContact: { name: 'Sofia Rivera', relationship: 'Spouse', phone: '+1 (555) 678-1235' },
    leaveBalances: { casual: 10, sick: 8, annual: 12, maternityPaternity: 10, unpaid: 0 },
  });

  // Additional Employees for realistic company representation
  const employeePriya = await User.create({
    employeeId: 'EMP-1005',
    name: 'Priya Sharma',
    email: 'priya.s@staffsync.com',
    password: 'password123',
    role: 'employee',
    department: 'Human Resources',
    designation: 'HR Operations Specialist',
    phone: '+1 (555) 789-3456',
    salary: 68000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    reportingManager: admin._id,
    address: { street: '310 Sunset Blvd', city: 'Chicago', state: 'IL', zip: '60601', country: 'USA' },
    leaveBalances: { casual: 12, sick: 10, annual: 15, maternityPaternity: 10, unpaid: 0 },
  });

  const employeeDavid = await User.create({
    employeeId: 'EMP-1006',
    name: 'David Kim',
    email: 'david.k@staffsync.com',
    password: 'password123',
    role: 'employee',
    department: 'Marketing',
    designation: 'Growth Marketing Manager',
    phone: '+1 (555) 890-4567',
    salary: 82000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    reportingManager: managerMkt._id,
    leaveBalances: { casual: 8, sick: 7, annual: 10, maternityPaternity: 10, unpaid: 0 },
  });

  const employeeJessica = await User.create({
    employeeId: 'EMP-1007',
    name: 'Jessica Taylor',
    email: 'jessica.t@staffsync.com',
    password: 'password123',
    role: 'employee',
    department: 'Finance',
    designation: 'Senior Financial Analyst',
    phone: '+1 (555) 901-5678',
    salary: 90000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    reportingManager: admin._id,
    leaveBalances: { casual: 11, sick: 9, annual: 14, maternityPaternity: 10, unpaid: 0 },
  });

  const employeeLiam = await User.create({
    employeeId: 'EMP-1008',
    name: 'Liam O\'Connor',
    email: 'liam.o@staffsync.com',
    password: 'password123',
    role: 'employee',
    department: 'Engineering',
    designation: 'DevOps & Cloud Engineer',
    phone: '+1 (555) 234-8901',
    salary: 98000,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    reportingManager: managerEng._id,
    leaveBalances: { casual: 10, sick: 10, annual: 15, maternityPaternity: 10, unpaid: 0 },
  });

  const allEmployees = [admin, managerEng, managerMkt, employeeAlex, employeePriya, employeeDavid, employeeJessica, employeeLiam];

  // 4. Seed Attendance for the past 10 days
  const attendanceRecords = [];
  for (let i = 9; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    for (const emp of allEmployees) {
      // Alex Rivera is clocked in today without clockOut if i === 0
      const isToday = i === 0;

      const randomMinutes = Math.floor(Math.random() * 45);
      const isLate = randomMinutes > 30;

      const clockIn = new Date(`${dateStr}T09:${String(randomMinutes).padStart(2, '0')}:00`);
      let clockOut = null;
      let workHours = 0;
      let status = isLate ? 'Late' : 'Present';

      if (!isToday || emp._id.toString() !== employeeAlex._id.toString()) {
        const outMinutes = Math.floor(Math.random() * 40);
        clockOut = new Date(`${dateStr}T17:${String(outMinutes).padStart(2, '0')}:00`);
        const diffMs = clockOut.getTime() - clockIn.getTime();
        workHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
      }

      const modes = ['Office', 'Remote', 'Hybrid'];
      const workMode = modes[Math.floor(Math.random() * modes.length)];

      attendanceRecords.push({
        user: emp._id,
        date: dateStr,
        clockIn,
        clockOut,
        workHours,
        status,
        workMode,
        location: workMode === 'Office' ? 'StaffSync HQ, Floor 4' : 'Remote Workplace',
      });
    }
  }

  await Attendance.insertMany(attendanceRecords);

  // 5. Seed Leaves
  await Leave.insertMany([
    {
      user: employeeAlex._id,
      leaveType: 'Annual',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      daysCount: 3,
      isHalfDay: false,
      reason: 'Family vacation and personal downtime.',
      status: 'Pending',
    },
    {
      user: employeeDavid._id,
      leaveType: 'Sick',
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      daysCount: 2,
      isHalfDay: false,
      reason: 'Recovering from viral fever and medical checkup.',
      status: 'Approved',
      reviewedBy: managerMkt._id,
      reviewNotes: 'Approved. Get well soon David!',
      reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      user: employeeJessica._id,
      leaveType: 'Casual',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      daysCount: 1,
      isHalfDay: false,
      reason: 'Attending family wedding ceremony.',
      status: 'Pending',
    },
    {
      user: employeeLiam._id,
      leaveType: 'Casual',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      daysCount: 1,
      isHalfDay: false,
      reason: 'Apartment relocation and lease signing.',
      status: 'Approved',
      reviewedBy: managerEng._id,
      reviewNotes: 'Approved.',
      reviewedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    },
  ]);

  // 6. Seed Announcements
  await Announcement.insertMany([
    {
      title: 'Company Annual Townhall & Roadmap 2026',
      content: 'Join us this Thursday at 3:00 PM EST in the Main Auditorium or via the Zoom livestream. The leadership team will present Q3 achievements, upcoming organizational milestones, and answer employee questions.',
      category: 'Company News',
      priority: 'High',
      targetDepartment: 'All',
      author: admin._id,
      isPinned: true,
    },
    {
      title: 'Updated Hybrid Work & Remote Office Guidelines',
      content: 'Effective next Monday, team members can select up to 3 remote days per week in coordination with their respective department heads. Please review the updated policy on the staff portal.',
      category: 'Policy',
      priority: 'Medium',
      targetDepartment: 'All',
      author: admin._id,
      isPinned: true,
    },
    {
      title: 'Q4 Engineering Hackathon Kickoff',
      content: 'The biannual internal engineering hackathon is starting next month! Teams of 2 to 4 engineers can pitch developer productivity and AI innovation projects. Exciting prizes awaits the winners.',
      category: 'Event',
      priority: 'Medium',
      targetDepartment: 'Engineering',
      author: managerEng._id,
      isPinned: false,
    },
    {
      title: 'Scheduled IT Maintenance & Single Sign-On Migration',
      content: 'Routine server maintenance and SSO certificate upgrades will take place this Saturday between 02:00 AM and 04:00 AM UTC. Intermittent connectivity to internal services may occur.',
      category: 'Urgent Alert',
      priority: 'High',
      targetDepartment: 'All',
      author: admin._id,
      isPinned: false,
    },
    {
      title: 'Upcoming Public Holiday: Thanksgiving Break',
      content: 'Please note that company offices will be closed on Thursday and Friday for the Thanksgiving holiday. Ensure critical sprint deadlines are planned accordingly.',
      category: 'Holiday',
      priority: 'Low',
      targetDepartment: 'All',
      author: admin._id,
      isPinned: false,
    },
  ]);

  // 7. Seed Trainings
  await Training.insertMany([
    {
      title: 'Cybersecurity Fundamentals & Phishing Defense',
      description: 'Essential corporate security training covering zero-trust architecture, multi-factor authentication best practices, and defending against sophisticated social engineering and phishing attacks.',
      category: 'Compliance & Safety',
      instructor: 'Dr. Gregory Finch (InfoSec Lead)',
      durationHours: 3,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'Active',
      modules: [
        { title: 'Identifying Spear-Phishing and Suspicious Links', durationMinutes: 45 },
        { title: 'Credential Security & Password Managers', durationMinutes: 45 },
        { title: 'Data Privacy Regulations (GDPR & SOC2)', durationMinutes: 60 },
      ],
      enrolledEmployees: [
        { user: employeeAlex._id, progress: 100, status: 'Completed', completedAt: new Date(), score: 98 },
        { user: employeeDavid._id, progress: 65, status: 'In Progress' },
        { user: employeeJessica._id, progress: 30, status: 'In Progress' },
        { user: employeeLiam._id, progress: 100, status: 'Completed', completedAt: new Date(), score: 95 },
      ],
    },
    {
      title: 'Modern Cloud Architecture & Microservices with Docker',
      description: 'Hands-on practical training on designing resilient microservices, containerization workflows, distributed tracing, and CI/CD pipelines in production Kubernetes clusters.',
      category: 'Technical',
      instructor: 'Marcus Brody & External DevOps Consultant',
      durationHours: 6,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Active',
      modules: [
        { title: 'Containerizing Node.js and React Applications', durationMinutes: 90 },
        { title: 'Cluster Orchestration & Horizontal Scaling', durationMinutes: 90 },
        { title: 'Zero-Downtime Deployment Strategies', durationMinutes: 90 },
      ],
      enrolledEmployees: [
        { user: employeeAlex._id, progress: 50, status: 'In Progress' },
        { user: employeeLiam._id, progress: 100, status: 'Completed', completedAt: new Date(), score: 100 },
      ],
    },
    {
      title: 'Effective Cross-Functional Leadership & Agile Communication',
      description: 'A masterclass designed for managers and aspiring tech leads to improve feedback mechanisms, run productive retrospectives, and resolve team conflict.',
      category: 'Leadership',
      instructor: 'Eleanor Vance',
      durationHours: 4,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: 'Active',
      modules: [
        { title: 'Active Listening & Constructive Feedback', durationMinutes: 60 },
        { title: 'Leading High-Performing Remote Teams', durationMinutes: 60 },
        { title: 'Negotiation & Stakeholder Alignment', durationMinutes: 60 },
      ],
      enrolledEmployees: [
        { user: managerEng._id, progress: 80, status: 'In Progress' },
        { user: managerMkt._id, progress: 100, status: 'Completed', completedAt: new Date(), score: 94 },
      ],
    },
  ]);

  console.log('[Seeder] Successfully seeded database with realistic HRMS data!');
};

// If run directly from CLI
if (require.main === module) {
  const { connectDB, closeDB } = require('../config/db');
  connectDB()
    .then(async () => {
      await seedData();
      await closeDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seeder Error]', err);
      process.exit(1);
    });
}

module.exports = seedData;
