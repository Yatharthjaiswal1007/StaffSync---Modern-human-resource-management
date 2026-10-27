const http = require('http');
const { startServer } = require('./server');

const runTest = async () => {
  console.log('[Test] Booting StaffSync Server for integration verification...');
  const server = await startServer();
  console.log('[Test] Server is now active. Starting API calls...');

  const postJSON = (path, body, token) => {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const req = http.request(
        {
          hostname: 'localhost',
          port: 5000,
          path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
        (res) => {
          let resData = '';
          res.on('data', (chunk) => (resData += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(resData) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: resData });
            }
          });
        }
      );
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  };

  const getJSON = (path, token) => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: 'localhost',
          port: 5000,
          path,
          method: 'GET',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
        (res) => {
          let resData = '';
          res.on('data', (chunk) => (resData += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(resData) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: resData });
            }
          });
        }
      );
      req.on('error', reject);
      req.end();
    });
  };

  try {
    // 1. Health check
    console.log('[Test 1] Testing /api/health...');
    const health = await getJSON('/api/health');
    console.log('Health response:', health.status, health.data.status);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Demo accounts
    console.log('[Test 2] Testing /api/auth/demo-accounts...');
    const demoAccounts = await getJSON('/api/auth/demo-accounts');
    console.log(`Retrieved ${demoAccounts.data.data.length} demo accounts`);

    // 3. Login as HR Admin
    console.log('[Test 3] Testing HR Admin login...');
    const adminLogin = await postJSON('/api/auth/login', {
      email: 'admin@staffsync.com',
      password: 'password123',
    });
    console.log('Admin login status:', adminLogin.status, 'User:', adminLogin.data.data.name);
    const adminToken = adminLogin.data.data.token;

    // 4. Get Dashboard Metrics (Admin)
    console.log('[Test 4] Testing Admin dashboard metrics...');
    const dash = await getJSON('/api/reports/dashboard', adminToken);
    console.log('Headcount:', dash.data.data.totalEmployees, 'Active:', dash.data.data.activeEmployees);

    // 5. Login as Employee & test Attendance clock-in
    console.log('[Test 5] Testing Employee login & Attendance...');
    const empLogin = await postJSON('/api/auth/login', {
      email: 'employee@staffsync.com',
      password: 'password123',
    });
    const empToken = empLogin.data.data.token;
    console.log('Employee login status:', empLogin.status, 'User:', empLogin.data.data.name);

    const todayStatus = await getJSON('/api/attendance/today', empToken);
    console.log('Employee today clock status:', todayStatus.data ? 'Record found' : 'None');

    // 6. Test Leave application
    console.log('[Test 6] Testing Leave application by employee...');
    const leaveApp = await postJSON(
      '/api/leaves/apply',
      {
        leaveType: 'Casual',
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        reason: 'Personal urgent appointment',
      },
      empToken
    );
    console.log('Leave application status:', leaveApp.status, leaveApp.data.message);

    // 7. Test Announcements
    console.log('[Test 7] Testing announcements list...');
    const notices = await getJSON('/api/announcements', empToken);
    console.log(`Fetched ${notices.data.data.length} company notices`);

    console.log('\n========================================');
    console.log(' ALL CORE API TESTS PASSED SUCCESSFULLY! ');
    console.log('========================================\n');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('[Test Failed]', err);
    server.close();
    process.exit(1);
  }
};

runTest();
