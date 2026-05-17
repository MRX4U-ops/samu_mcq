const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kzvixaayzqgkdftfpdsi.supabase.co';
const supabaseKey = 'sb_publishable_MrxugWrfei7zCHAPkr4KaA_ChQFj6mk';

const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
    {
        q: "Muscles that rotate the scapula downward are attached to:",
        newIndex: 1,
        newExpl: "Correct answer: Dorsal lip of the medial border of the scapula."
    },
    {
        q: "Anastomosis around the scapula connects the subclavian artery with the:",
        newIndex: 2,
        newExpl: "Correct answer: Third part of the axillary artery."
    },
    {
        q: "The bicipital aponeurosis passes obliquely deep to the:",
        newIndex: 1,
        newExpl: "The bicipital aponeurosis passes superficial to the brachial artery and median nerve, but deep to the median cubital vein."
    },
    {
        q: "The anterior compartment of the arm contains all of the following EXCEPT:",
        newIndex: 1,
        newExpl: "The anterior compartment contains the Biceps, Brachialis, and Coracobrachialis. The Triceps is in the posterior compartment."
    }
];

async function updateAll() {
    console.log('🚀 Updating Supabase MCQs...');
    
    for (const item of updates) {
        console.log(`\nSearching for: "${item.q}"`);
        const { data, error } = await supabase
            .from('mcqs')
            .select('id, question, options')
            .ilike('question', `%${item.q.substring(0, 50)}%`);

        if (error) {
            console.error(`❌ Error finding question: ${error.message}`);
            continue;
        }

        if (data && data.length > 0) {
            const question = data[0];
            console.log(`✅ Found! Updating to index ${item.newIndex}...`);
            
            const { error: updateError } = await supabase
                .from('mcqs')
                .update({ 
                    correct_index: item.newIndex,
                    explanation: item.newExpl
                })
                .eq('id', question.id);

            if (updateError) {
                console.error(`❌ Update failed: ${updateError.message}`);
                console.log('💡 Tip: This might be due to RLS. I need an Admin key to bypass it.');
            } else {
                console.log('🎉 Successfully updated!');
            }
        } else {
            console.log('❓ Question not found in DB.');
        }
    }
    console.log('\n🏁 Done.');
}

updateAll();
