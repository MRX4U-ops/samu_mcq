const { supabaseAdmin } = require('../src/config/supabase');

async function check() {
  const { data, error } = await supabaseAdmin.from('study_alarms').select('*').limit(1);
  if (error) {
    console.error('Error querying study_alarms:', error.message);
    if (error.message.includes('does not exist')) {
      console.log('❌ study_alarms table does not exist.');
    }
  } else {
    console.log('✅ study_alarms table exists. Data:', data);
  }

  const { data: exData, error: exError } = await supabaseAdmin.from('exam_reminders').select('*').limit(1);
  if (exError) {
    console.error('Error querying exam_reminders:', exError.message);
    if (exError.message.includes('does not exist')) {
      console.log('❌ exam_reminders table does not exist.');
    }
  } else {
    console.log('✅ exam_reminders table exists. Data:', exData);
  }
}

check();
