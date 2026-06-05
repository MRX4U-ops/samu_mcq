const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Querying Supabase for questions containing "Blood culture"...');
    const { data: q1, error: e1 } = await supabase
        .from('mcqs')
        .select('id, question, options, correct_index, topic_id')
        .ilike('question', '%Blood culture%');

    if (e1) {
        console.error('Error querying q1:', e1);
    } else {
        console.log(`Found ${q1.length} questions matching "Blood culture":`);
        q1.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`Topic ID: ${row.topic_id}`);
            console.log(`Question: ${row.question}`);
            console.log(`Options:`, row.options);
            console.log(`Correct Index: ${row.correct_index}`);
            console.log('---');
        });
    }

    console.log('\nChecking all MCQs for option containing "sexually-active"...');
    const { data: q2, error: e2 } = await supabase
        .from('mcqs')
        .select('id, question, options, correct_index, topic_id');

    if (e2) {
        console.error('Error querying all:', e2);
        return;
    }

    const matched = q2.filter(row => row.options && row.options.some(opt => opt.includes('sexually-active')));
    console.log(`Found ${matched.length} rows with malformed option:`);
    matched.forEach(row => {
        console.log(`ID: ${row.id}`);
        console.log(`Topic ID: ${row.topic_id}`);
        console.log(`Question: ${row.question}`);
        console.log(`Options:`, row.options);
        console.log(`Correct Index: ${row.correct_index}`);
        console.log('---');
    });
}

run();
