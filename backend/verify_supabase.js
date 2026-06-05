const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Service Role Key missing in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    const queries = [
        'Protein A is found',
        'cross the placenta',
        'Salmonella causes Enteric fever'
    ];

    for (const qText of queries) {
        console.log(`Checking DB for question containing "${qText}"...`);
        const { data, error } = await supabase
            .from('mcqs')
            .select('id, question, options, correct_index')
            .ilike('question', `%${qText}%`);

        if (error) {
            console.error(`❌ Error querying "${qText}":`, error.message);
            continue;
        }

        if (!data || data.length === 0) {
            console.warn(`⚠️ No questions found matching "${qText}"`);
            continue;
        }

        data.forEach(mcq => {
            console.log(`Found MCQ ID: ${mcq.id}`);
            console.log(`  Question: "${mcq.question}"`);
            console.log(`  Options: ${JSON.stringify(mcq.options)}`);
            console.log(`  Correct Index: ${mcq.correct_index}`);
            console.log(`  Verified Correct Answer: "${mcq.options[mcq.correct_index]}"`);
            console.log('---');
        });
    }
}

verify();
