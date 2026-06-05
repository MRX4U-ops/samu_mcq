const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Service Role Key missing in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import updated biochemistryData
const BIOCHEMISTRY_DATA = require('../backend/src/data/biochemistryData');

async function syncTopic() {
    console.log('🚀 Starting sync for Biochemistry Module 2 Topic 1 in Supabase...');

    // 1. Get Subject
    const { data: subject, error: sErr } = await supabase
        .from('subjects')
        .select('id')
        .eq('title', 'Biochemistry Module 2')
        .maybeSingle();

    if (sErr || !subject) {
        console.error('❌ Error finding subject:', sErr ? sErr.message : 'Not found');
        process.exit(1);
    }
    console.log(`✅ Found subject "Biochemistry Module 2" with ID: ${subject.id}`);

    // 2. Get Topic 1
    const { data: topic, error: tErr } = await supabase
        .from('topics')
        .select('id')
        .eq('subject_id', subject.id)
        .eq('title', 'Topic 1')
        .maybeSingle();

    if (tErr || !topic) {
        console.error('❌ Error finding topic:', tErr ? tErr.message : 'Not found');
        process.exit(1);
    }
    console.log(`✅ Found "Topic 1" with ID: ${topic.id}`);

    // 3. Get questions from biochemistryData.js
    const questions = BIOCHEMISTRY_DATA["s-2-1"]["t-s-2-1-1"];
    if (!questions) {
        console.error('❌ Could not find "t-s-2-1-1" in biochemistryData.js');
        process.exit(1);
    }

    // 4. Delete existing MCQs for this topic
    console.log('🧹 Deleting old MCQs for Topic 1 in DB...');
    const { error: delErr } = await supabase
        .from('mcqs')
        .delete()
        .eq('topic_id', topic.id);

    if (delErr) {
        console.error('❌ Error deleting old MCQs:', delErr.message);
        process.exit(1);
    }
    console.log('✅ Deleted successfully.');

    // 5. Prepare MCQ records
    const mcqRecords = [];
    
    // Add test questions
    if (Array.isArray(questions.test)) {
        questions.test.forEach(q => {
            mcqRecords.push({
                topic_id: topic.id,
                question: q.question,
                options: q.options,
                correct_index: q.correctIndex !== undefined ? q.correctIndex : 0,
                explanation: q.explanation || '',
                task_type: 'test_question'
            });
        });
    }

    // Add situational questions
    if (Array.isArray(questions.situational)) {
        questions.situational.forEach(q => {
            mcqRecords.push({
                topic_id: topic.id,
                question: q.question,
                options: q.options,
                correct_index: q.correctIndex !== undefined ? q.correctIndex : 0,
                explanation: q.explanation || '',
                task_type: 'situational_task'
            });
        });
    }

    console.log(`📦 Prepared ${mcqRecords.length} MCQ records to insert (${questions.test.length} test, ${questions.situational.length} situational)...`);

    // 6. Insert new MCQ records
    const { error: insErr } = await supabase
        .from('mcqs')
        .insert(mcqRecords);

    if (insErr) {
        console.error('❌ Error inserting new MCQs:', insErr.message);
        process.exit(1);
    }

    console.log('🎉 Successfully synchronized Biochemistry Module 2 Topic 1 in Supabase!');
}

syncTopic();
