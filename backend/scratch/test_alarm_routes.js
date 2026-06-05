const axios = require('axios');
const { supabaseAdmin } = require('../src/config/supabase');

async function runTests() {
  console.log('--- RUNNING ENDPOINT TESTS ---');
  
  // 1. Fetch a user ID from Supabase
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .limit(1);
    
  if (profileError || !profiles || profiles.length === 0) {
    console.error('Could not fetch test user profile:', profileError?.message || 'No profiles found');
    return;
  }
  
  const testUserId = profiles[0].id;
  const testUserEmail = profiles[0].email;
  console.log(`Using test user: ${testUserEmail} (${testUserId})`);
  
  const headers = { 'user-id': testUserId };
  const BASE_URL = 'http://localhost:5000/api/users';
  
  try {
    // 2. Test GET /alarms
    console.log('\nTesting GET /alarms...');
    const getAlarmsRes = await axios.get(`${BASE_URL}/alarms`, { headers });
    console.log('GET /alarms Response status:', getAlarmsRes.status);
    console.log('GET /alarms Response data:', getAlarmsRes.data);
    
    // 3. Test POST /alarms (will trigger fallback if table is not created yet, which is expected and fine)
    console.log('\nTesting POST /alarms...');
    const newAlarm = {
      title: 'Practice Pharmacology',
      time: '09:00 PM',
      repeat_type: 'custom',
      days_of_week: ['Mon', 'Wed', 'Fri'],
      ringtone_enabled: true,
      vibration_enabled: true
    };
    const postAlarmRes = await axios.post(`${BASE_URL}/alarms`, newAlarm, { headers });
    console.log('POST /alarms Response status:', postAlarmRes.status);
    console.log('POST /alarms Response data:', postAlarmRes.data);
    
    // 4. Test GET /exams
    console.log('\nTesting GET /exams...');
    const getExamsRes = await axios.get(`${BASE_URL}/exams`, { headers });
    console.log('GET /exams Response status:', getExamsRes.status);
    console.log('GET /exams Response data:', getExamsRes.data);
    
    // 5. Test POST /exams
    console.log('\nTesting POST /exams...');
    const newExam = {
      subject: 'Microbiology Final CBT',
      exam_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      notes: 'Prepare modules 1 and 2 thoroughly'
    };
    const postExamRes = await axios.post(`${BASE_URL}/exams`, newExam, { headers });
    console.log('POST /exams Response status:', postExamRes.status);
    console.log('POST /exams Response data:', postExamRes.data);
    
    console.log('\n--- TESTS COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('Test failed with error:', error.response?.data || error.message);
  }
}

runTests();
