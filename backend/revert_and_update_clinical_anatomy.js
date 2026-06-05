const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load env variables from backend/.env
const envPath = 'C:\\samu_mcq\\backend\\.env';
let supabaseUrl = 'https://kzvixaayzqgkdftfpdsi.supabase.co';
let supabaseServiceKey = '';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            if (key === 'SUPABASE_URL') supabaseUrl = val;
            if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseServiceKey = val;
        }
    });
}

console.log('Supabase URL:', supabaseUrl);
console.log('Has service key:', !!supabaseServiceKey);

// Define global list of files
const biochemistryFiles = [
    'C:\\samu_mcq\\backend\\src\\data\\biochemistryData.js',
    'C:\\samu_mcq\\mobile-app\\src\\data\\repository\\course2\\s-2-0.js',
    'C:\\samu_mcq\\mobile-app\\src\\data\\repository\\course2\\s-2-1.js'
];

const generalFiles = [
    'C:\\samu_mcq\\backend\\src\\data\\mcqRepository.js',
    'C:\\samu_mcq\\mobile-app\\src\\data\\mined_questions.json'
];

const clinicalAnatomyFiles = [
    'C:\\samu_mcq\\backend\\src\\data\\anatomyData.js',
    'C:\\samu_mcq\\mobile-app\\src\\data\\repository\\course2\\s-2-2.js'
];

// Helper to replace option values in file content
function replaceOptionsInContent(content, questionText, oldOpts, newOpts) {
    let qIndex = content.indexOf(questionText);
    let count = 0;
    while (qIndex !== -1) {
        let optIndex = content.indexOf('options', qIndex);
        if (optIndex !== -1) {
            let startBracket = content.indexOf('[', optIndex);
            if (startBracket !== -1) {
                let endBracket = content.indexOf(']', startBracket);
                if (endBracket !== -1) {
                    let optionsStr = content.substring(startBracket + 1, endBracket);
                    let optionItems = optionsStr.split(',').map(item => item.trim());
                    let cleanItems = optionItems.map(item => {
                        let val = item;
                        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                            val = val.substring(1, val.length - 1);
                        }
                        return val.trim();
                    });

                    let matches = true;
                    if (cleanItems.length !== oldOpts.length) {
                        matches = false;
                    } else {
                        for (let i = 0; i < oldOpts.length; i++) {
                            if (oldOpts[i] !== '*' && cleanItems[i].toLowerCase() !== oldOpts[i].toLowerCase()) {
                                matches = false;
                                break;
                            }
                        }
                    }

                    if (matches) {
                        let quoteType = '"';
                        if (optionItems[0].startsWith("'")) quoteType = "'";
                        
                        let newOptionItems = optionItems.map((orig, i) => {
                            if (newOpts[i] === undefined || newOpts[i] === null) return orig;
                            return `${quoteType}${newOpts[i]}${quoteType}`;
                        });
                        
                        let newOptionsStr = newOptionItems.join(', ');
                        content = content.substring(0, startBracket + 1) + newOptionsStr + content.substring(endBracket);
                        count++;
                    }
                }
            }
        }
        qIndex = content.indexOf(questionText, qIndex + 1);
    }
    return { content, count };
}

// ----------------------------------------------------
// STEP A: REVERT ALL BIOCHEMISTRY AND GENERAL FILES
// ----------------------------------------------------
console.log('\n--- Reverting Biochemistry and General files back to original duplicate options ---');
const biochemistryReverts = [
    {
        q: "Which of the enzymes of glycolysis is controlled by insulin?",
        oldOpts: ["Hexokinase", "Phosphohexoisomerase", "Aldolase", "Enolase"],
        newOpts: [null, null, null, "Hexokinase"]
    },
    {
        q: "Clover leaf structure is characteristic for which nucleic acid:",
        oldOpts: ["tRNA", "Tertiary structure of DNA", "mRNA", "rRNA"],
        newOpts: [null, null, null, "mRNA"]
    },
    {
        q: "What is the process of recognition?",
        oldOpts: ["Activation of amino acids", "Dropping a nucleotide from a gene", "Splicing of exons", "Transfer of the peptide"],
        newOpts: [null, null, "Activation of amino acids", null]
    },
    {
        q: "Genetic code property",
        oldOpts: ["Continuity", "Degeneracy", "Generality", "Dipletity"],
        newOpts: [null, "Continuity", null, null]
    },
    {
        q: "The activity of which enzyme increases when the salivary glands are inflamed?",
        oldOpts: ["?-amylase", "Trypsin", "Gastroxin", "Ptyalin"],
        newOpts: [null, "?-amylase", null, null]
    },
    {
        q: "The activity of which enzyme increases when the salivary glands are inflamed?",
        oldOpts: ["α-amylase", "Trypsin", "Gastroxin", "Ptyalin"],
        newOpts: [null, "α-amylase", null, null]
    }
];

[...biochemistryFiles, ...generalFiles].forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changeCount = 0;

    biochemistryReverts.forEach(rep => {
        const res = replaceOptionsInContent(content, rep.q, rep.oldOpts, rep.newOpts);
        if (res.count > 0) {
            content = res.content;
            modified = true;
            changeCount += res.count;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Reverted ${changeCount} duplicate(s) in local file: ${filePath}`);
    }
});

// ----------------------------------------------------
// STEP B: PROCESS CLINICAL ANATOMY FILES
// ----------------------------------------------------
console.log('\n--- Processing Clinical Anatomy files ---');

// 1. Revert test questions back to duplicates
const anatomyTestReverts = [
    {
        q: "The area where surgical incision is performed is?",
        oldOpts: ["Sterile field", "Antiseptics", "Clean procedure", "Contaminated area", "Surgical asepsis"],
        newOpts: [null, null, null, "Sterile field", null]
    },
    {
        q: "Which nerve innervates the majority of the infrahyoid muscles?",
        oldOpts: ["Ansa cervicalis", "Vagus nerve", "Hypoglossal nerve", "Accessory nerve", "Phrenic nerve"],
        newOpts: [null, null, null, "Ansa cervicalis", null]
    },
    {
        q: "Innervation of the Infrahyoid Muscles",
        oldOpts: ["Ansa cervicalis", "Vagus nerve", "Hypoglossal nerve", "Accessory nerve", "Phrenic nerve"],
        newOpts: [null, null, null, "Ansa cervicalis", null]
    },
    {
        q: "Stylohyoid muscle",
        oldOpts: ["Hyoid bone", "omohyoid muscle", "Sternocleidomastoid muscle", "Sternohyoid muscle", "*"],
        newOpts: [null, null, null, "Omohyoid muscle", null]
    }
];

// 2. Ensure situational questions are updated/kept updated (just in case they weren't in any file)
const anatomySituationalFixes = [
    {
        q: "A 27-year-old patient presents with an inability to draw the scapula forward and downward because of paralysis of the pectoralis minor. Which of the following would most likely be a cause of his condition?",
        oldOpts: ["Fracture of the coracoid process", "Fracture of the clavicle", "Injury to the posterior cord of the brachial plexus", "Fracture of the coracoid process", "Axillary nerve injury"],
        newOpts: [null, null, null, "Fracture of the scapular spine", null]
    },
    {
        q: "A 24-year-old woman complains of weakness when she extends her thigh and rotates it laterally. Which of the following muscles is paralyzed?",
        oldOpts: ["Gluteus maximus", "Obturator externus", "Sartorius", "Tensor fasciae latae", "Gluteus maximus"],
        newOpts: [null, null, null, null, "Gluteus minimus"]
    },
    {
        q: "A 53-year-old man has difficulty with breathing through his nose. On examination, his physician finds that he has swelling of the mucous membranes of the superior nasal meatus. Which opening of the paranasal sinuses is most likely plugged?",
        oldOpts: ["Posterior ethmoidal sinus", "Middle ethmoidal sinus", "Maxillary sinus", "Posterior ethmoidal sinus", "Anterior ethmoidal sinus"],
        newOpts: [null, null, null, "Sphenoid sinus", null]
    }
];

clinicalAnatomyFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // A. Revert test questions
    anatomyTestReverts.forEach(rep => {
        const res = replaceOptionsInContent(content, rep.q, rep.oldOpts, rep.newOpts);
        if (res.count > 0) {
            content = res.content;
            modified = true;
            console.log(`  ↪️ Reverted test question duplicate in ${filePath}: "${rep.q.substring(0, 40)}..."`);
        }
    });

    // B. Keep/Apply situational fixes
    anatomySituationalFixes.forEach(rep => {
        const res = replaceOptionsInContent(content, rep.q, rep.oldOpts, rep.newOpts);
        if (res.count > 0) {
            content = res.content;
            modified = true;
            console.log(`  ✨ Applied/Kept situational fix in ${filePath}: "${rep.q.substring(0, 40)}..."`);
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

// ----------------------------------------------------
// STEP C: RUN SUB-MIGRATION SCRIPT FOR UPDATING DB
// ----------------------------------------------------
async function updateSupabase() {
    if (!supabaseServiceKey) {
        console.log('⚠️ Missing SUPABASE_SERVICE_ROLE_KEY. Skipping database updates.');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('\n🚀 Connecting to Supabase to sync database with modified local rules...');

    // 1. Revert Biochemistry in DB (restore duplicates)
    console.log('\n--- Reverting Biochemistry duplicates in DB ---');
    for (const rep of biochemistryReverts) {
        const { data, error } = await supabase
            .from('mcqs')
            .select('id, question, options')
            .ilike('question', `%${rep.q.substring(0, 50)}%`);

        if (error) continue;
        if (data && data.length > 0) {
            for (const qRow of data) {
                const options = qRow.options;
                if (!options || !Array.isArray(options)) continue;

                // Clean items
                const cleanItems = options.map(opt => opt.trim());
                let matches = true;
                if (cleanItems.length !== rep.oldOpts.length) {
                    matches = false;
                } else {
                    for (let i = 0; i < rep.oldOpts.length; i++) {
                        if (rep.oldOpts[i] !== '*' && cleanItems[i].toLowerCase() !== rep.oldOpts[i].toLowerCase()) {
                            matches = false;
                            break;
                        }
                    }
                }

                if (matches) {
                    const newOptions = options.map((orig, i) => {
                        if (rep.newOpts[i] === undefined || rep.newOpts[i] === null) return orig;
                        return rep.newOpts[i];
                    });

                    console.log(`  Reverting MCQ ID ${qRow.id}: [${options.join(', ')}] -> [${newOptions.join(', ')}]`);
                    await supabase.from('mcqs').update({ options: newOptions }).eq('id', qRow.id);
                }
            }
        }
    }

    // 2. Revert Anatomy Test questions in DB (restore duplicates)
    console.log('\n--- Reverting Anatomy Test duplicates in DB ---');
    for (const rep of anatomyTestReverts) {
        const { data, error } = await supabase
            .from('mcqs')
            .select('id, question, options')
            .ilike('question', `%${rep.q.substring(0, 50)}%`);

        if (error) continue;
        if (data && data.length > 0) {
            for (const qRow of data) {
                const options = qRow.options;
                if (!options || !Array.isArray(options)) continue;

                const cleanItems = options.map(opt => opt.trim());
                let matches = true;
                if (cleanItems.length !== rep.oldOpts.length) {
                    matches = false;
                } else {
                    for (let i = 0; i < rep.oldOpts.length; i++) {
                        if (rep.oldOpts[i] !== '*' && cleanItems[i].toLowerCase() !== rep.oldOpts[i].toLowerCase()) {
                            matches = false;
                            break;
                        }
                    }
                }

                if (matches) {
                    const newOptions = options.map((orig, i) => {
                        if (rep.newOpts[i] === undefined || rep.newOpts[i] === null) return orig;
                        return rep.newOpts[i];
                    });

                    console.log(`  Reverting MCQ ID ${qRow.id}: [${options.join(', ')}] -> [${newOptions.join(', ')}]`);
                    await supabase.from('mcqs').update({ options: newOptions }).eq('id', qRow.id);
                }
            }
        }
    }

    // 3. Keep/Apply Anatomy Situational questions in DB (fix duplicates)
    console.log('\n--- Ensuring Anatomy Situational fixes in DB ---');
    for (const rep of anatomySituationalFixes) {
        const { data, error } = await supabase
            .from('mcqs')
            .select('id, question, options')
            .ilike('question', `%${rep.q.substring(0, 50)}%`);

        if (error) continue;
        if (data && data.length > 0) {
            for (const qRow of data) {
                const options = qRow.options;
                if (!options || !Array.isArray(options)) continue;

                const cleanItems = options.map(opt => opt.trim());
                let matches = true;
                if (cleanItems.length !== rep.oldOpts.length) {
                    matches = false;
                } else {
                    for (let i = 0; i < rep.oldOpts.length; i++) {
                        if (rep.oldOpts[i] !== '*' && cleanItems[i].toLowerCase() !== rep.oldOpts[i].toLowerCase()) {
                            matches = false;
                            break;
                        }
                    }
                }

                if (matches) {
                    const newOptions = options.map((orig, i) => {
                        if (rep.newOpts[i] === undefined || rep.newOpts[i] === null) return orig;
                        return rep.newOpts[i];
                    });

                    console.log(`  Updating MCQ ID ${qRow.id}: [${options.join(', ')}] -> [${newOptions.join(', ')}]`);
                    await supabase.from('mcqs').update({ options: newOptions }).eq('id', qRow.id);
                }
            }
        }
    }
}

updateSupabase().then(() => {
    console.log('\n🏁 Revert and Clinical Anatomy update complete!');
});
