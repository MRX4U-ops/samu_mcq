const { supabaseAdmin } = require('../src/config/supabase');
const { s_2_10 } = require('../../mobile-app/src/data/repository/course2/s-2-10.js');

const TOPIC_ID = '56d847c3-e627-4cb4-84a5-deac4b0c7d5d';

async function verify() {
  console.log('--- Checking local s-2-10.js ---');
  const localQuestions = s_2_10['t-s-2-10-15'];
  if (!localQuestions) {
    console.error('❌ Local topic t-s-2-10-15 not found!');
  } else {
    console.log(`✅ Local topic t-s-2-10-15 has ${localQuestions.length} questions.`);
    let ok = true;
    localQuestions.forEach((q, idx) => {
      if (q.correctIndex !== 0) {
        console.error(`❌ Question ${idx + 1} has correctIndex = ${q.correctIndex} (expected 0)`);
        ok = false;
      }
      if (!q.options || q.options.length !== 4) {
        console.error(`❌ Question ${idx + 1} has ${q.options ? q.options.length : 0} options (expected 4)`);
        ok = false;
      }
    });
    if (ok) console.log('✅ All local questions have correct index 0 and 4 options.');
  }

  console.log('\n--- Checking Supabase Database ---');
  const { data: dbQuestions, error } = await supabaseAdmin
    .from('mcqs')
    .select('*')
    .eq('topic_id', TOPIC_ID);

  if (error) {
    console.error('❌ Error fetching from Supabase:', error);
  } else {
    console.log(`✅ Database has ${dbQuestions.length} questions for Topic 15.`);
    let ok = true;
    dbQuestions.forEach((q, idx) => {
      if (q.correct_index !== 0) {
        console.error(`❌ DB Question ${idx + 1} (id: ${q.id}) has correct_index = ${q.correct_index} (expected 0)`);
        ok = false;
      }
      if (!q.options || q.options.length !== 4) {
        console.error(`❌ DB Question ${idx + 1} has ${q.options ? q.options.length : 0} options (expected 4)`);
        ok = false;
      }
    });
    if (ok) console.log('✅ All DB questions have correct index 0 and 4 options.');
    
    // Compare Local vs DB questions
    if (localQuestions && dbQuestions.length === localQuestions.length) {
      let match = true;
      for (let i = 0; i < localQuestions.length; i++) {
        const lq = localQuestions[i];
        // Note: DB doesn't have a guaranteed order unless sorted by question or created_at, but we can match them by question text
        const dq = dbQuestions.find(d => d.question === lq.question);
        if (!dq) {
          console.error(`❌ Could not find DB match for question: "${lq.question}"`);
          match = false;
        } else {
          // Compare options
          for(let oIdx=0; oIdx<4; oIdx++) {
            if (dq.options[oIdx] !== lq.options[oIdx]) {
              console.error(`❌ Option mismatch for question "${lq.question}": DB option[${oIdx}]="${dq.options[oIdx]}", Local option[${oIdx}]="${lq.options[oIdx]}"`);
              match = false;
            }
          }
        }
      }
      if (match) {
        console.log('✅ All local questions match the DB questions perfectly!');
      } else {
        console.error('❌ Mismatches found between local and DB questions!');
      }
    } else {
      console.error(`❌ Length mismatch: Local count = ${localQuestions ? localQuestions.length : 0}, DB count = ${dbQuestions.length}`);
    }
  }
}

verify();
