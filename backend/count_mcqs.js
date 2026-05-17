const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://kzvixaayzqgkdftfpdsi.supabase.co';
const supabaseKey = 'sb_publishable_MrxugWrfei7zCHAPkr4KaA_ChQFj6mk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function count() {
    const { count, error } = await supabase
        .from('mcqs')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Total MCQs in DB: ${count}`);
}

count();
