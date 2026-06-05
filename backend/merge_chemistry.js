const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function mergeSubjects() {
    console.log("Fetching subjects...");
    const { data: sub1Data } = await supabase.from('subjects').select('*').eq('title', 'Medical chemistry Module 1');
    const { data: sub2Data } = await supabase.from('subjects').select('*').eq('title', 'Medical chemistry Module 2');

    if (sub1Data && sub1Data.length > 0) {
        const sub1 = sub1Data[0];
        
        // Rename Module 1 to Medical chemistry
        console.log(`Renaming ${sub1.title} to Medical chemistry`);
        await supabase.from('subjects').update({ title: 'Medical chemistry' }).eq('id', sub1.id);
        
        if (sub2Data && sub2Data.length > 0) {
            const sub2 = sub2Data[0];
            console.log(`Found ${sub2.title}. Moving topics to Medical chemistry`);
            
            // Re-assign topics
            await supabase.from('topics').update({ subject_id: sub1.id }).eq('subject_id', sub2.id);
            
            // Delete Module 2
            console.log(`Deleting ${sub2.title}`);
            await supabase.from('subjects').delete().eq('id', sub2.id);
        }
    } else {
        console.log("Medical chemistry Module 1 not found. Maybe it's already renamed?");
        const { data: existingData } = await supabase.from('subjects').select('*').eq('title', 'Medical chemistry');
        if (existingData && existingData.length > 0) {
            const sub1 = existingData[0];
            if (sub2Data && sub2Data.length > 0) {
                const sub2 = sub2Data[0];
                console.log(`Moving topics from ${sub2.title} to Medical chemistry`);
                await supabase.from('topics').update({ subject_id: sub1.id }).eq('subject_id', sub2.id);
                console.log(`Deleting ${sub2.title}`);
                await supabase.from('subjects').delete().eq('id', sub2.id);
            }
        }
    }
    
    console.log("Done.");
}

mergeSubjects().catch(console.error);
