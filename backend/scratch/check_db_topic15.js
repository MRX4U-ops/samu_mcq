const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const subjectId = 'f83d725b-9deb-468f-98d3-19a46cb51306';

    const { data: topic, error: tErr } = await supabase
        .from('topics')
        .select('id, title')
        .eq('subject_id', subjectId)
        .eq('title', 'Topic 15')
        .maybeSingle();

    if (tErr || !topic) {
        console.error('❌ Topic 15 not found:', tErr ? tErr.message : 'No match');
        return;
    }

    console.log(`Topic: ${topic.title} (${topic.id})`);

    const { data: mcqs, error: mErr } = await supabase
        .from('mcqs')
        .select('id, question')
        .eq('topic_id', topic.id);

    if (mErr) {
        console.error('❌ Error fetching MCQs:', mErr.message);
        return;
    }

    console.log('\nQuestions in DB:');
    mcqs.forEach((m, idx) => {
        console.log(`${idx + 1}: ${m.question}`);
    });
}

run();
