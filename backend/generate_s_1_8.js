const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUBJECT_ID = 'b3454f82-8aa2-49c0-b8c5-bb25bcaf9c10';

async function run() {
  const { data: topics } = await supabase.from('topics').select('id, title').eq('subject_id', SUBJECT_ID);
  
  const ids = topics.map(t=>t.id);
  const { data: mcqs } = await supabase.from('mcqs').select('*').in('topic_id', ids);
  
  const repo = {};
  
  for (const t of topics) {
    const match = t.title.match(/Topic (\d+)/i);
    if (!match) continue;
    const topicNum = parseInt(match[1], 10);
    // Topic 1 corresponds to t-s-1-8-0 in the app
    const key = `t-s-1-8-${topicNum - 1}`;
    
    const topicMcqs = mcqs.filter(m => m.topic_id === t.id);
    const testQs = topicMcqs.filter(m => m.task_type === 'test_question').map(m => ({
      question: m.question,
      options: m.options
    }));
    
    const sitQs = topicMcqs.filter(m => m.task_type === 'situational_task' || m.task_type === 'situational').map(m => {
      let options = [...m.options];
      if (m.correct_index !== undefined && m.correct_index !== 0 && m.correct_index < options.length) {
        const temp = options[0];
        options[0] = options[m.correct_index];
        options[m.correct_index] = temp;
      }
      return {
        question: m.question,
        options: options
      };
    });
    
    repo[key] = {
      test: testQs,
      situational: sitQs
    };
  }
  
  const content = `export const s_1_8 = ${JSON.stringify(repo, null, 2)};\n`;
  const outPath = path.join(__dirname, '../mobile-app/src/data/repository/course1/s-1-8.js');
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`Generated ${outPath} successfully.`);
}

run().catch(console.error);
