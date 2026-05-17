require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kzvixaayzqgkdftfpdsi.supabase.co';
const supabaseKey = 'sb_publishable_MrxugWrfei7zCHAPkr4KaA_ChQFj6mk'; // Using anon key as script runner

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateQuestion() {
    console.log('Searching for the question...');
    
    // Find the question
    const { data: questions, error: findError } = await supabase
        .from('mcqs')
        .select('*')
        .ilike('question', '%bicipital aponeurosis%');

    if (findError) {
        console.error('Error finding question:', findError);
        return;
    }

    if (!questions || questions.length === 0) {
        console.log('Question not found.');
        return;
    }

    const question = questions[0];
    console.log('Found Question:', question.question);
    console.log('Current Options:', question.options);
    console.log('Current Correct Index:', question.correct_index);

    // Update correct_index to 0 (Option A: Median cubital vein)
    // Also updating explanation to match anatomical facts
    const { error: updateError } = await supabase
        .from('mcqs')
        .select('*') // Just to check
        .update({ 
            correct_index: 0,
            explanation: "The bicipital aponeurosis passes superficial to the brachial artery and median nerve, but deep to the median cubital vein. Therefore, it passes deep to the median cubital vein."
        })
        .eq('id', question.id);

    if (updateError) {
        console.error('Error updating question:', updateError);
    } else {
        console.log('Successfully updated the correct answer to Option A (Median cubital vein).');
    }
}

updateQuestion();
