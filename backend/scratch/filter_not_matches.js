const fs = require('fs');
const { supabaseAdmin } = require('../src/config/supabase');

async function main() {
    // 1. Load parsed clipboard questions
    const parsedPath = 'c:/samu_mcq/backend/scratch/parsed_clipboard.json';
    if (!fs.existsSync(parsedPath)) {
        console.error('Parsed clipboard file not found');
        process.exit(1);
    }
    const clipQuestions = JSON.parse(fs.readFileSync(parsedPath, 'utf8'));
    console.log(`Loaded ${clipQuestions.length} parsed clipboard questions.`);

    // 2. Fetch all MCQs for Microbiology-1 and Microbiology-2 from DB
    const sub1 = '177b387b-0941-4281-89dc-6a18a0e4656d'; // Microbiology-1
    const sub2 = 'f83d725b-9deb-468f-98d3-19a46cb51306'; // Microbiology-2

    // Get topics for both subjects
    const { data: topics, error: tErr } = await supabaseAdmin
        .from('topics')
        .select('id, title')
        .in('subject_id', [sub1, sub2]);

    if (tErr) {
        console.error('Error fetching topics:', tErr);
        process.exit(1);
    }

    const topicIds = topics.map(t => t.id);
    console.log(`Found ${topics.length} topics in database.`);

    // Get all MCQs
    const { data: dbMcqs, error: mErr } = await supabaseAdmin
        .from('mcqs')
        .select('id, question, options, correct_index, topic_id')
        .in('topic_id', topicIds);

    if (mErr) {
        console.error('Error fetching MCQs:', mErr);
        process.exit(1);
    }

    console.log(`Found ${dbMcqs.length} MCQs in database.`);

    // Helper to normalize string
    function normalize(str) {
        if (!str) return '';
        return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    }

    // Helper to check if two options match
    function optionsMatch(opt1, opt2) {
        const n1 = opt1.map(o => normalize(o)).sort();
        const n2 = opt2.map(o => normalize(o)).sort();
        if (n1.length !== n2.length) return false;
        return n1.every((val, index) => val === n2[index]);
    }

    // Filter clipboard questions
    const exactMatches = [];
    const notMatches = [];

    for (const cq of clipQuestions) {
        const cqNorm = normalize(cq.question);
        const correctOpt = cq.options[cq.correctIndex];
        const cqCorrectNorm = normalize(correctOpt);

        // Find match in DB
        const match = dbMcqs.find(db => {
            const dbNorm = normalize(db.question);
            if (dbNorm !== cqNorm) return false;

            // Correct option in database is always at index 0 (as per delivery contract)
            const dbCorrectOpt = db.options[0];
            const dbCorrectNorm = normalize(dbCorrectOpt);

            // Check if correct answers are matching and options are matching
            const correctMatch = (dbCorrectNorm === cqCorrectNorm);
            const optsMatch = optionsMatch(db.options, cq.options);

            return correctMatch && optsMatch;
        });

        if (match) {
            exactMatches.push({ clip: cq, db: match });
        } else {
            notMatches.push(cq);
        }
    }

    console.log(`Exact Matches: ${exactMatches.length}`);
    console.log(`Not Matches (to add): ${notMatches.length}`);

    // Save filtered questions to file
    fs.writeFileSync('c:/samu_mcq/backend/scratch/not_matches.json', JSON.stringify(notMatches, null, 2), 'utf8');
    console.log('Saved non-matching questions to c:/samu_mcq/backend/scratch/not_matches.json');
}

main();
