const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const topic8 = JSON.parse(fs.readFileSync('c:/samu_mcq/scratch/topic8.json', 'utf8'));
    
    // Apply fixes
    topic8[0].options = ["A compound formed when a central atom bonds with ligands through coordinate covalent bonds", "A substance formed by simple covalent bonds", "A mixture of ionic substances"];
    topic8[0].correctIndex = 0;
    topic8[1].correctIndex = 1;
    topic8[2].options = ["Complexes formed when ligands with multiple bonding sites bind to a metal ion to form a ring", "Compounds formed by ionic bonds", "Mixtures of simple salts"];
    topic8[2].correctIndex = 0;
    topic8[3].correctIndex = 1;
    topic8[4].correctIndex = 2;
    topic8[5].correctIndex = 0;
    topic8[6].correctIndex = 1;
    topic8[7].correctIndex = 0;
    topic8[8].correctIndex = 0;
    topic8[9].correctIndex = 1;
    topic8[10].correctIndex = 2;
    topic8[11].correctIndex = 0;
    topic8[12].correctIndex = 2;
    topic8[13].correctIndex = 0;
    topic8[14].correctIndex = 2;
    topic8[15].correctIndex = 0;
    topic8[16].correctIndex = 1;
    topic8[17].correctIndex = 2;
    topic8[18].correctIndex = 0;
    topic8[19].correctIndex = 1;
    topic8[20].correctIndex = 0;
    topic8[21].correctIndex = 1;
    topic8[22].correctIndex = 2;
    topic8[23].correctIndex = 2;
    topic8[24].correctIndex = 2;

    for (let q of topic8) {
      q.explanation = "The correct answer is '" + q.options[q.correctIndex] + "'. This choice aligns with the established clinical curriculum.";
    }

    const subject1Id = '5a962027-bc0a-43dd-87c0-a32611229cc6'; // Medical chemistry Module 1

    let { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('id')
        .eq('subject_id', subject1Id)
        .eq('title', 'Topic 8');
        
    if (topicError || !topicData || topicData.length === 0) {
        console.log('Error or topic not found:', topicError);
        process.exit(1);
    }
    const topicUUID = topicData[0].id;
    console.log('Found Topic 8 UUID:', topicUUID);

    // Delete existing test questions for Topic 8
    console.log('Deleting existing test questions for Topic 8...');
    const { error: delError } = await supabase
        .from('mcqs')
        .delete()
        .eq('topic_id', topicUUID)
        .eq('task_type', 'test_question');
        
    if (delError) {
        console.log('Error deleting:', delError);
    }
    
    // Insert new ones
    console.log('Inserting', topic8.length, 'questions...');
    for (const q of topic8) {
        await supabase
            .from('mcqs')
            .insert({
                topic_id: topicUUID,
                question: q.question,
                options: q.options,
                correct_index: q.correctIndex,
                explanation: q.explanation,
                task_type: 'test_question'
            });
    }

    console.log('Done updating Supabase!');
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
