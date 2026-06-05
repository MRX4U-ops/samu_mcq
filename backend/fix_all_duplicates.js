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

// 2. Define replacements
const replacements = [
    {
        q: "Which of the enzymes of glycolysis is controlled by insulin?",
        oldOpts: ["Hexokinase", "Phosphohexoisomerase", "Aldolase", "Hexokinase"],
        newOpts: [null, null, null, "Enolase"]
    },
    {
        q: "Clover leaf structure is characteristic for which nucleic acid:",
        oldOpts: ["tRNA", "Tertiary structure of DNA", "mRNA", "mRNA"],
        newOpts: [null, null, null, "rRNA"]
    },
    {
        q: "What is the process of recognition?",
        oldOpts: ["Activation of amino acids", "Dropping a nucleotide from a gene", "Activation of amino acids", "Transfer of the peptide"],
        newOpts: [null, null, "Splicing of exons", null]
    },
    {
        q: "Genetic code property",
        oldOpts: ["Continuity", "Continuity", "Generality", "Dipletity"],
        newOpts: [null, "Degeneracy", null, null]
    },
    {
        q: "The activity of which enzyme increases when the salivary glands are inflamed?",
        oldOpts: ["?-amylase", "?-amylase", "Gastroxin", "Ptyalin"],
        newOpts: [null, "Trypsin", null, null]
    },
    {
        q: "The activity of which enzyme increases when the salivary glands are inflamed?",
        oldOpts: ["α-amylase", "α-amylase", "Gastroxin", "Ptyalin"],
        newOpts: [null, "Trypsin", null, null]
    },
    {
        q: "The area where surgical incision is performed is?",
        oldOpts: ["Sterile field", "Antiseptics", "Clean procedure", "Sterile field", "Surgical asepsis"],
        newOpts: [null, null, null, "Contaminated area", null]
    },
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
    },
    {
        q: "Innervation of the Infrahyoid Muscles",
        oldOpts: ["Ansa cervicalis", "Vagus nerve", "Hypoglossal nerve", "Ansa cervicalis", "Phrenic nerve"],
        newOpts: [null, null, null, "Accessory nerve", null]
    },
    {
        q: "Stylohyoid muscle",
        oldOpts: ["Hyoid bone", "omohyoid muscle", "Sternocleidomastoid muscle", "Omohyoid muscle", "*"],
        newOpts: [null, null, null, "Sternohyoid muscle", null]
    }
];

// Helper to replace options in file content
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

// 3. Find files to scan and fix
const searchPaths = [
    'C:\\samu_mcq\\backend\\src\\data',
    'C:\\samu_mcq\\mobile-app\\src\\data'
];

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (file.endsWith('.js') || file.endsWith('.json')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

const allLocalFiles = [];
searchPaths.forEach(sp => {
    if (fs.existsSync(sp)) {
        getAllFiles(sp, allLocalFiles);
    }
});

console.log(`Found ${allLocalFiles.length} files to scan.`);

// 4. Update local files
allLocalFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileModified = false;
    let fileChanges = 0;

    replacements.forEach(rep => {
        const res = replaceOptionsInContent(content, rep.q, rep.oldOpts, rep.newOpts);
        if (res.count > 0) {
            content = res.content;
            fileModified = true;
            fileChanges += res.count;
        }
    });

    if (fileModified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${fileChanges} duplicate(s) in local file: ${filePath}`);
    }
});

// 5. Update Supabase
async function updateSupabase() {
    if (!supabaseServiceKey) {
        console.log('⚠️ Missing SUPABASE_SERVICE_ROLE_KEY. Skipping database updates.');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🚀 Connecting to Supabase for database updates...');

    for (const rep of replacements) {
        console.log(`\nSearching DB for question: "${rep.q}"`);
        const { data, error } = await supabase
            .from('mcqs')
            .select('id, question, options')
            .ilike('question', `%${rep.q.substring(0, 50)}%`);

        if (error) {
            console.error(`❌ Error finding question in DB: ${error.message}`);
            continue;
        }

        if (data && data.length > 0) {
            let dbMatchCount = 0;
            for (const qRow of data) {
                const options = qRow.options;
                if (!options || !Array.isArray(options)) continue;

                // Strip and clean
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
                    // Prepare updated options
                    const newOptions = options.map((orig, i) => {
                        if (rep.newOpts[i] === undefined || rep.newOpts[i] === null) return orig;
                        return rep.newOpts[i];
                    });

                    console.log(`  Updating MCQ ID ${qRow.id}: [${options.join(', ')}] -> [${newOptions.join(', ')}]`);
                    const { error: updateError } = await supabase
                        .from('mcqs')
                        .update({ options: newOptions })
                        .eq('id', qRow.id);

                    if (updateError) {
                        console.error(`  ❌ Failed to update row ID ${qRow.id}: ${updateError.message}`);
                    } else {
                        console.log(`  🎉 Successfully updated DB row ID ${qRow.id}!`);
                        dbMatchCount++;
                    }
                }
            }
            if (dbMatchCount === 0) {
                console.log('  No matching duplicate pattern found in DB results.');
            }
        } else {
            console.log('  Question not found in DB.');
        }
    }
}

updateSupabase().then(() => {
    console.log('\n🏁 Duplicate cleanup complete!');
});
