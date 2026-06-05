const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // Get Subject
    const { data: subject, error: sErr } = await supabase
        .from('subjects')
        .select('id, title')
        .ilike('title', '%Microbiology, Virology, Parasitology and Immunology-2%')
        .maybeSingle();

    if (sErr || !subject) {
        console.error('❌ Subject not found:', sErr ? sErr.message : 'No match');
        return;
    }

    console.log(`Subject: ${subject.title} (${subject.id})`);

    // Get Topics
    const { data: topics, error: tErr } = await supabase
        .from('topics')
        .select('id, title')
        .eq('subject_id', subject.id);

    if (tErr) {
        console.error('❌ Error fetching topics:', tErr.message);
        return;
    }

    console.log('\nTopics in DB:');
    topics.forEach(t => {
        console.log(`- ${t.title} (ID: ${t.id}, order_index: ${t.order_index})`);
    });
}

run();
