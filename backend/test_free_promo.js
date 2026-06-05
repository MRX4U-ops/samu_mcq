const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env');
  process.exit(1);
}

// Admin client for user creation & verification/cleanup
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const tempEmail = `test_${Math.random().toString(36).substring(2, 10)}@example.com`;
const tempPassword = 'SuperSecretTestPassword123!';
let tempUserId = null;
let accessToken = null;

async function runTest() {
  try {
    console.log(`1. Creating a temporary test user: ${tempEmail}`);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true
    });

    if (authError) throw authError;
    tempUserId = authData.user.id;
    console.log(`   ✅ Test user created with ID: ${tempUserId}`);

    console.log('2. Signing in as the test user to get JWT access token...');
    // We use the anon key defined in src/config/supabase.js (sb_publishable_MrxugWrfei7zCHAPkr4KaA_ChQFj6mk)
    const anonKey = 'sb_publishable_MrxugWrfei7zCHAPkr4KaA_ChQFj6mk';
    const supabaseClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: tempEmail,
      password: tempPassword
    });

    if (loginError) throw loginError;
    accessToken = loginData.session.access_token;
    console.log('   ✅ Signed in successfully. Access token retrieved.');

    console.log('3. Starting the local backend server programmatically...');
    // Require the server to start it on port 5000
    require('./src/server.js');
    
    // Wait a brief moment to ensure server is listening
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('4. Making a POST request to /api/payments/claim-free-promo with TRH100...');
    const response = await axios.post(
      'http://localhost:5000/api/payments/claim-free-promo',
      { promoCode: 'TRH100' },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    console.log('   ✅ Response received status:', response.status);
    console.log('   ✅ Response body:', response.data);

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    console.log('5. Verifying database records via Supabase Admin...');
    
    // Verify payment request
    const { data: payments, error: payErr } = await supabaseAdmin
      .from('payment_requests')
      .select('*')
      .eq('user_id', tempUserId);

    if (payErr) throw payErr;
    console.log('   Payments in DB:', payments);
    if (payments.length !== 1 || payments[0].status !== 'approved' || Number(payments[0].amount) !== 0) {
      throw new Error('Payment request was not properly created or approved with amount 0.');
    }
    console.log('   ✅ Payment request check passed.');

    // Verify subscription
    const { data: sub, error: subErr } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', tempUserId)
      .single();

    if (subErr) throw subErr;
    console.log('   Subscription in DB:', sub);
    if (sub.status !== 'active') {
      throw new Error('Subscription status is not active.');
    }
    
    const diffTime = new Date(sub.end_date) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log(`   Subscription active for: ${diffDays} days`);
    if (diffDays < 88 || diffDays > 91) {
      throw new Error(`Subscription end date should be 90 days, but got diff of ${diffDays} days`);
    }
    console.log('   ✅ Subscription check passed.');

    // Verify promo code usage
    const { data: promo, error: promoErr } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', 'TRH100')
      .single();

    if (promoErr) throw promoErr;
    console.log('   Promo code usage in DB:', promo.current_usage);
    console.log('   ✅ Promo code usage check passed.');

    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    process.exitCode = 1;
  } finally {
    console.log('6. Cleaning up test data...');
    if (tempUserId) {
      // Delete payment requests
      await supabaseAdmin.from('payment_requests').delete().eq('user_id', tempUserId);
      // Delete subscription
      await supabaseAdmin.from('subscriptions').delete().eq('user_id', tempUserId);
      // Delete user profile
      await supabaseAdmin.from('profiles').delete().eq('id', tempUserId);
      // Delete user auth
      await supabaseAdmin.auth.admin.deleteUser(tempUserId);
      console.log('   🧹 Cleanup complete.');
    }
    process.exit();
  }
}

runTest();
