const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing from env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Subject IDs
const SUBJECT_1_ID = '177b387b-0941-4281-89dc-6a18a0e4656d'; // Microbiology-1
const SUBJECT_2_ID = 'f83d725b-9deb-468f-98d3-19a46cb51306'; // Microbiology-2

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function runComparison() {
  console.log('Fetching database MCQs...');
  
  // 1. Fetch topics for Subject 1 & 2
  const { data: topics, error: topicsErr } = await supabase
    .from('topics')
    .select('id, title, subject_id')
    .in('subject_id', [SUBJECT_1_ID, SUBJECT_2_ID]);
    
  if (topicsErr) {
    console.error('Error fetching topics:', topicsErr);
    process.exit(1);
  }
  
  const topicMap = {};
  topics.forEach(t => {
    topicMap[t.id] = t;
  });
  
  const topicIds = topics.map(t => t.id);
  console.log(`Found ${topics.length} topics across Microbiology 1 & 2.`);
  
  // 2. Fetch all MCQs for these topics
  // Since there are 600 MCQs, we can fetch them in one query or in pages if needed, but 600 is small enough for one query.
  const { data: dbMCQs, error: mcqsErr } = await supabase
    .from('mcqs')
    .select('*')
    .in('topic_id', topicIds);
    
  if (mcqsErr) {
    console.error('Error fetching MCQs:', mcqsErr);
    process.exit(1);
  }
  
  console.log(`Fetched ${dbMCQs.length} MCQs from database.`);
  
  // 3. Load parsed clipboard MCQs
  const clipboardMCQs = JSON.parse(fs.readFileSync('c:/samu_mcq/backend/scratch/parsed_clipboard.json', 'utf8'));
  console.log(`Loaded ${clipboardMCQs.length} MCQs from parsed clipboard.`);
  
  // 4. Index database MCQs by normalized question text
  const dbIndexed = {};
  dbMCQs.forEach(mcq => {
    const normQ = normalizeText(mcq.question);
    if (!dbIndexed[normQ]) {
      dbIndexed[normQ] = [];
    }
    dbIndexed[normQ].push(mcq);
  });
  
  // 5. Compare each clipboard MCQ against DB
  const exactMatches = [];
  const modifiedQuestions = [];
  const newQuestions = [];
  
  clipboardMCQs.forEach(clipQ => {
    const normQ = normalizeText(clipQ.question);
    const matches = dbIndexed[normQ];
    
    if (!matches || matches.length === 0) {
      newQuestions.push(clipQ);
      return;
    }
    
    // Check if there is a match in matches list (there could be duplicates in DB, though rare)
    let foundExact = false;
    let foundModified = null;
    
    for (const dbQ of matches) {
      // Clean and normalize correct options
      // Note: dbQ.options[0] is the correct option in DB (since correct_index is 0)
      const dbCorrectOpt = normalizeText(dbQ.options[0]);
      const clipCorrectOpt = normalizeText(clipQ.options[0]);
      
      const dbAllOptsNormalized = dbQ.options.map(normalizeText).sort().join('|');
      const clipAllOptsNormalized = clipQ.options.map(normalizeText).sort().join('|');
      
      const isCorrectOptSame = dbCorrectOpt === clipCorrectOpt;
      const isAllOptsSame = dbAllOptsNormalized === clipAllOptsNormalized;
      
      if (isCorrectOptSame && isAllOptsSame) {
        foundExact = true;
        exactMatches.push({ clipQ, dbQ });
        break;
      } else {
        foundModified = {
          clipQ,
          dbQ,
          reason: !isCorrectOptSame ? 'Different correct answer' : 'Different options set'
        };
      }
    }
    
    if (!foundExact) {
      if (foundModified) {
        modifiedQuestions.push(foundModified);
      } else {
        newQuestions.push(clipQ);
      }
    }
  });
  
  // 6. Find questions in DB that are missing from clipboard
  const clipNormalizedSet = new Set(clipboardMCQs.map(q => normalizeText(q.question)));
  const missingFromClipboard = dbMCQs.filter(dbQ => !clipNormalizedSet.has(normalizeText(dbQ.question)));
  
  // 7. Compile report summary
  console.log('\n=================== COMPARISON SUMMARY ===================');
  console.log(`Total Questions in Clipboard:   ${clipboardMCQs.length}`);
  console.log(`Total Questions in DB (M1 & M2):${dbMCQs.length}`);
  console.log(`Exact Matches:                 ${exactMatches.length}`);
  console.log(`Modified Questions:            ${modifiedQuestions.length}`);
  console.log(`New Questions (Not in DB):     ${newQuestions.length}`);
  console.log(`DB Questions Missing in Clip:  ${missingFromClipboard.length}`);
  console.log('==========================================================\n');
  
  // Write detailed results to JSON for review
  const report = {
    summary: {
      totalClipboard: clipboardMCQs.length,
      totalDB: dbMCQs.length,
      exactMatchesCount: exactMatches.length,
      modifiedCount: modifiedQuestions.length,
      newCount: newQuestions.length,
      missingCount: missingFromClipboard.length
    },
    newQuestions: newQuestions.map(q => ({
      question: q.question,
      options: q.options,
      correctOption: q.options[0]
    })),
    modifiedQuestions: modifiedQuestions.map(m => ({
      question: m.clipQ.question,
      reason: m.reason,
      clipboard: {
        options: m.clipQ.options,
        correctOption: m.clipQ.options[0]
      },
      database: {
        options: m.dbQ.options,
        correctOption: m.dbQ.options[0]
      }
    })),
    missingFromClipboard: missingFromClipboard.map(q => ({
      question: q.question,
      options: q.options,
      correctOption: q.options[0]
    }))
  };
  
  fs.writeFileSync('c:/samu_mcq/backend/scratch/comparison_report.json', JSON.stringify(report, null, 2), 'utf8');
  console.log('Saved detailed comparison report to comparison_report.json');
}

runComparison();
