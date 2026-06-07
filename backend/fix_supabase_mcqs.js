const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUBJECT_ID = 'b3454f82-8aa2-49c0-b8c5-bb25bcaf9c10';

const cleanOptionText = (opt) => {
  if (typeof opt !== 'string') return opt;
  let cleaned = opt.replace(/^[\*\s\\"'`\/]+/, '');
  cleaned = cleaned.replace(/^[a-zA-Z][\.\)\-]\s*/, '');
  cleaned = cleaned.replace(/^[\*\s\\"'`\/]+/, '');
  cleaned = cleaned.replace(/[\*\s\\"'`\/]+$/, '');
  return cleaned || opt;
};

const isOptionStr = (str) => {
  const clean = str.trim().replace(/^[\*\s\\#_~`'"()\-0-9]+/, '');
  return /^[a-d][\.\)\-\s]/i.test(clean);
};

async function run() {
  console.log('Fetching topics for Medical Biology...');
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id, title')
    .eq('subject_id', SUBJECT_ID);

  if (topicsError) {
    console.error('Error fetching topics:', topicsError);
    return;
  }

  console.log(`Found ${topics.length} topics. Fetching MCQs...`);
  const topicIds = topics.map(t => t.id);

  const { data: mcqs, error: mcqsError } = await supabase
    .from('mcqs')
    .select('*')
    .in('topic_id', topicIds);

  if (mcqsError) {
    console.error('Error fetching MCQs:', mcqsError);
    return;
  }

  console.log(`Fetched ${mcqs.length} MCQs. Processing...`);

  let updatedCount = 0;

  for (const mcq of mcqs) {
    let options = [...(mcq.options || [])];
    let question = mcq.question || '';
    let correctIndex = mcq.correct_index || 0;
    let needsUpdate = false;

    // 1. Check if options length is 5 (question text in options)
    if (options.length === 5) {
      // Find which option is not a valid option string
      const nonOptionIndices = [];
      options.forEach((opt, idx) => {
        if (!isOptionStr(opt)) {
          nonOptionIndices.push(idx);
        }
      });

      let questionIdx = -1;
      if (nonOptionIndices.length === 1) {
        questionIdx = nonOptionIndices[0];
      } else {
        // Fallback: the longest string is the question
        let maxLen = -1;
        options.forEach((opt, idx) => {
          if (opt.length > maxLen) {
            maxLen = opt.length;
            questionIdx = idx;
          }
        });
      }

      if (questionIdx !== -1) {
        question = options[questionIdx];
        options.splice(questionIdx, 1);
        needsUpdate = true;
      }
    }

    // 2. Identify the correct option and clean it
    let correctVal = null;
    let correctOptIdx = -1;

    // Search for option containing asterisks
    options.forEach((opt, idx) => {
      if (opt.includes('*') || opt.includes('**')) {
        correctOptIdx = idx;
      }
    });

    if (correctOptIdx === -1) {
      // Fallback: use correct_index or default to 0
      correctOptIdx = (correctIndex < options.length) ? correctIndex : 0;
    }

    correctVal = options[correctOptIdx];

    // Clean all options
    const cleanedOptions = options.map(cleanOptionText);
    const cleanedCorrectVal = cleanOptionText(correctVal);

    // Rearrange options so correct answer is at index 0
    const finalOptions = [cleanedCorrectVal];
    cleanedOptions.forEach((opt, idx) => {
      if (idx !== correctOptIdx) {
        finalOptions.push(opt);
      }
    });

    // Make sure we have exactly 4 options
    while (finalOptions.length < 4) {
      finalOptions.push('');
    }
    if (finalOptions.length > 4) {
      finalOptions.length = 4;
    }

    // Check if we actually changed anything
    const origOptionsJson = JSON.stringify(mcq.options);
    const newOptionsJson = JSON.stringify(finalOptions);

    if (
      origOptionsJson !== newOptionsJson ||
      mcq.question !== question ||
      mcq.correct_index !== 0
    ) {
      needsUpdate = true;
    }

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('mcqs')
        .update({
          question: question,
          options: finalOptions,
          correct_index: 0
        })
        .eq('id', mcq.id);

      if (updateError) {
        console.error(`Error updating MCQ ${mcq.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`Done! Updated ${updatedCount} MCQs in Supabase.`);
}

run().catch(console.error);
