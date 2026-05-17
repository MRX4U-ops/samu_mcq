const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://kzvixaayzqgkdftfpdsi.supabase.co';
const supabaseKey = 'sb_publishable_MrxugWrfei7zCHAPkr4KaA_ChQFj6mk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findScapula() {
    const { data, error } = await supabase
        .from('mcqs')
        .select('question')
        .ilike('question', '%scapula%')
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    console.log('Scapula questions in DB:');
    data.forEach(q => console.log(`- ${q.question}`));
}

findScapula();
