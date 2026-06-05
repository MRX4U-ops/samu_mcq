const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Service Role Key missing in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('🔍 Querying Microbiology 2 Subject...');
    const { data: subject, error: sErr } = await supabase
        .from('subjects')
        .select('id, title')
        .ilike('title', '%Microbiology, Virology, Parasitology and Immunology-2%')
        .maybeSingle();

    if (sErr || !subject) {
        console.error('❌ Subject not found:', sErr ? sErr.message : 'No match');
        process.exit(1);
    }
    console.log(`\n======================================================`);
    console.log(`✅ Found Subject: "${subject.title}"`);
    console.log(`   ID: ${subject.id}`);
    console.log(`======================================================`);

    console.log('🔍 Querying Topics...');
    const { data: topics, error: tErr } = await supabase
        .from('topics')
        .select('id, title')
        .eq('subject_id', subject.id)
        .order('title');

    if (tErr) {
        console.error('❌ Error fetching topics:', tErr.message);
        process.exit(1);
    }

    console.log(`✅ Found ${topics.length} topics. Fetching MCQ counts...\n`);

    for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        const { data: mcqs, error: mErr } = await supabase
            .from('mcqs')
            .select('task_type')
            .eq('topic_id', topic.id);

        if (mErr) {
            console.error(`❌ Error fetching MCQs for topic ${topic.title}:`, mErr.message);
            continue;
        }

        const testCount = mcqs.filter(m => m.task_type === 'test_question').length;
        const sitCount = mcqs.filter(m => m.task_type === 'situational_task').length;
        console.log(`[Topic ${i+1}] Title: "${topic.title}"`);
        console.log(`   UUID: ${topic.id}`);
        console.log(`   Stats: ${testCount} test questions, ${sitCount} situational tasks (Total: ${mcqs.length})\n`);
    }
}

inspect();
