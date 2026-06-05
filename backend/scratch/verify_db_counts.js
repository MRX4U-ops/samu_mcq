const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const subjectId = 'f83d725b-9deb-468f-98d3-19a46cb51306';

    const { data: topics, error: tErr } = await supabase
        .from('topics')
        .select('id, title')
        .eq('subject_id', subjectId);

    if (tErr) {
        console.error('❌ Error fetching topics:', tErr.message);
        return;
    }

    console.log('Verifying MCQ counts per topic in DB:');
    for (const topic of topics) {
        const { count, error: cErr } = await supabase
            .from('mcqs')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);

        if (cErr) {
            console.error(`❌ Error counting MCQs for topic ${topic.title}:`, cErr.message);
        } else {
            console.log(`- "${topic.title}": ${count} MCQs`);
        }
    }
}

run();
