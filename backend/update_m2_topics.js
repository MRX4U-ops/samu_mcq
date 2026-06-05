const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Service Role Key missing in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTopics() {
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
    console.log(`✅ Found Subject: "${subject.title}" (${subject.id})`);

    // 1. Delete all old topics for this subject
    console.log('🧹 Deleting old topics for Microbiology 2...');
    const { error: delErr } = await supabase
        .from('topics')
        .delete()
        .eq('subject_id', subject.id);

    if (delErr) {
        console.error('❌ Error deleting old topics:', delErr.message);
        process.exit(1);
    }
    console.log('✅ Deleted old topics successfully.');

    // 2. Insert new topics: Topic 13 to 20
    const newTopics = [];
    for (let i = 13; i <= 20; i++) {
        newTopics.push({
            subject_id: subject.id,
            title: `Topic ${i}`
        });
    }

    console.log('Inserting new topics (Topic 13 to Topic 20)...');
    const { data: inserted, error: insErr } = await supabase
        .from('topics')
        .insert(newTopics)
        .select();

    if (insErr) {
        console.error('❌ Error inserting new topics:', insErr.message);
        process.exit(1);
    }

    console.log('🎉 Successfully created topics for Microbiology 2:');
    inserted.forEach(t => {
        console.log(`- "${t.title}" (ID: ${t.id})`);
    });
}

updateTopics();
