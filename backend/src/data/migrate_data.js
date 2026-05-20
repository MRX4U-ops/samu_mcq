const { createClient } = require('@supabase/supabase-js');
const CHEMISTRY_DATA = require('./chemistryData');
const BIOCHEMISTRY_DATA = require('./biochemistryData');
const ANATOMY_DATA = require('./anatomyData');
const REPO_DATA = require('./mcqRepository');

// ACADEMIC_STRUCTURE from academicRoutes.js
const ACADEMIC_STRUCTURE = [
  { title: "1st Course", subjects: ["Entering to the profession", "Histology, cytology and embriology moodle 1", "Religious studies", "The latest history of Uzbekistan. Bioethics", "Human Anatomy -Moodul 2", "Human Anatomy -Moodul 1", "Information technologies in medicine", "Medical and biological physics", "Medical biology with elements of ecology Module 1", "Medical biology with elements of ecology Module 2", "Medical chemistry Module 1", "Medical chemistry Module 2", "Medical English", "Medical latin terminology", "Microbiology, Virology, Parasitology and Immunology", "New medical technology and medical equipments", "Pharmacology", "Physiology module 1", "Physiology module 2", "Russian language for the students of medical institute", "Uzbek language"] },
  { title: "2nd Course", subjects: ["Biochemistry Module 1", "Biochemistry Module 2", "Clinic anatomy", "Clinical laboratory diagnostics", "First Aid", "Histology, Cytology and Embryology Module 1", "Histology, Cytology and Embryology Module 2", "Human Anatomy Moodul -3", "Medical genetics", "Microbiology, Virology, Parasitology and Immunology-1", "Microbiology, Virology, Parasitology and Immunology-2", "Molecular physiology, Pathophysiology", "Pathological physiology module 1", "Pathological physiology module 2", "Pathological Anatomy Moodle One", "Pediatrics propedeutics", "Pharmacology Moodle 1", "Pharmacology Moodle 2", "Philosophy", "Physiology Module 1", "Physiology Module 2", "Propedeutics of internal disease", "Psychology and pedagogy", "Medical Deontology. Doctor-Patient Communication"] },
  { title: "3rd Course", subjects: ["Clinical laboratory diagnostics", "Dietology. Nutritionology.", "Folk medicine", "General surgery", "Hematology", "Hygiene. Medical Ecology", "Internal medicine", "Medical genetics", "Medical radiology", "Molecular Physiology, pathophysiology Module 1", "Molecular Physiology, pathophysiology Module 2", "Obstetrics and gynecology Module 1", "Obstetrics and gynecology module 2", "Pathological physiology Module 1", "Pathological physiology Module 2", "Pathological Anatomy Module 1", "Pathological Anatomy Module 2", "Pediatrics", "Pharmacology Module 1", "Pharmacology Module 2", "Propaedeutics of childhood diseases", "Propedeutics of internal disease", "Rehabilitology, sport medicine", "Neuroradiology"] },
  { title: "4th Course", subjects: ["Children's surgery", "Clinic Pharmacology", "Clinical allergology and immunology", "Dermatovenerology", "Endocrinology", "Forensic medicine", "Internal medicine", "Medical psychology", "Neurology", "Neurosurgery", "Obstetrics and gynecology", "Occupational diseases", "Oncology", "Otorhinolaryngology", "Pediatrics", "Phthisiology", "Public health", "Scientific research methods and biostatistics", "Surgery", "Traumatology and Orthopedics", "Urology", "Dentistry", "Partially removable dentures"] },
  { title: "5th Course", subjects: ["Anesthesiology and resuscitation", "Clinic Pharmacology", "Clinical allergology and immunology", "Emergency medicine", "Epidemiology", "Infectious diseases. Children's infectious diseases", "Internal medicine", "Neonatolgy", "Neurology", "Neurosurgery", "Obstetrics and gynecology", "Occupational diseases", "Oncology", "Ophthalmology", "Otorhinolaryngology", "Phthisiology", "Psychiatry, Narcology", "Surgery", "Dentistry", "Fully removable prosthesis", "Periodontology", "Traumatology and Orthopedics", "Surgery in familial medicine", "Fundamental endoscopic surgery"] },
  { title: "6th Course", subjects: ["Emergency medicine", "Infectious diseases", "Therapy in family medicine", "Therapy in family medicine (subordinature)", "Obstetrics and gynecology", "Obstetrics and gynecology in familial medicine", "Obstetrics and gynecology in familial medicine (Subordinature)", "Pediatrics in familial medicine (Subordinature)", "Pediatrics in familial medicine- MD (11-semester)", "Rheumatology", "Surgery in familial medicine (Subordinature)", "Surgery in familial medicine", "Simulation study", "Tropical diseases"] }
];

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log("🚀 Starting migration to Supabase...");

    for (const c of ACADEMIC_STRUCTURE) {
        console.log(`\n📦 Migrating Course: ${c.title}`);
        let { data: course, error: cErr } = await supabase.from('courses').select('id').eq('title', c.title).maybeSingle();
        
        if (!course) {
            const { data: newCourse, error: insertErr } = await supabase.from('courses').insert({ title: c.title }).select().single();
            if (insertErr) { console.error(`Error inserting course: ${insertErr.message}`); continue; }
            course = newCourse;
        }

        for (const sTitle of c.subjects) {
            console.log(`  🔹 Subject: ${sTitle}`);
            let { data: subject, error: sErr } = await supabase.from('subjects').select('id').eq('title', sTitle).eq('course_id', course.id).maybeSingle();
            
            if (!subject) {
                const { data: newSubject, error: insertErr } = await supabase.from('subjects').insert({ course_id: course.id, title: sTitle }).select().single();
                if (insertErr) { console.error(`Error inserting subject: ${insertErr.message}`); continue; }
                subject = newSubject;
            }

            // Determine which data object to use for this subject
            let mcqSource = null;
            let subjectId = null;

            if (sTitle === "Medical chemistry Module 1") { mcqSource = CHEMISTRY_DATA["s-1-10"]; subjectId = "s-1-10"; }
            else if (sTitle === "Medical chemistry Module 2") { mcqSource = CHEMISTRY_DATA["s-1-11"]; subjectId = "s-1-11"; }
            else if (sTitle === "Biochemistry Module 1") { mcqSource = BIOCHEMISTRY_DATA["s-2-0"]; subjectId = "s-2-0"; }
            else if (sTitle === "Biochemistry Module 2") { mcqSource = BIOCHEMISTRY_DATA["s-2-1"]; subjectId = "s-2-1"; }
            else if (sTitle === "Clinic anatomy") { mcqSource = ANATOMY_DATA["s-2-2"]; subjectId = "s-2-2"; }

            // Create 15 Topics
            for (let i = 1; i <= 15; i++) {
                const topicTitle = `Topic ${i}`;
                let { data: topic, error: tErr } = await supabase.from('topics').select('id').eq('title', topicTitle).eq('subject_id', subject.id).maybeSingle();
                
                if (!topic) {
                    const { data: newTopic, error: insertErr } = await supabase.from('topics').insert({ subject_id: subject.id, title: topicTitle }).select().single();
                    if (insertErr) continue;
                    topic = newTopic;
                }

                // Migrate MCQs for this topic if source exists
                if (mcqSource) {
                    const topicKey = `t-${subjectId}-${i}`;
                    const questions = mcqSource[topicKey];
                    if (questions) {
                        // Delete existing MCQs for this topic to refresh them
                        const { error: delErr } = await supabase.from('mcqs').delete().eq('topic_id', topic.id);
                        if (delErr) {
                            console.error(`    ❌ Error deleting old MCQs: ${delErr.message}`);
                        }

                        let mcqDataList = [];
                        if (Array.isArray(questions)) {
                            mcqDataList = questions.map(q => ({
                                topic_id: topic.id,
                                question: q.question,
                                options: q.options,
                                correct_index: q.correctIndex !== undefined ? q.correctIndex : 0,
                                explanation: q.explanation || '',
                                task_type: 'test_question'
                            }));
                        } else {
                            if (Array.isArray(questions.test)) {
                                mcqDataList.push(...questions.test.map(q => ({
                                    topic_id: topic.id,
                                    question: q.question,
                                    options: q.options,
                                    correct_index: q.correctIndex !== undefined ? q.correctIndex : 0,
                                    explanation: q.explanation || '',
                                    task_type: 'test_question'
                                })));
                            }
                            if (Array.isArray(questions.situational)) {
                                mcqDataList.push(...questions.situational.map(q => ({
                                    topic_id: topic.id,
                                    question: q.question,
                                    options: q.options,
                                    correct_index: q.correctIndex !== undefined ? q.correctIndex : 0,
                                    explanation: q.explanation || '',
                                    task_type: 'situational_task'
                                })));
                            }
                        }

                        if (mcqDataList.length > 0) {
                            const { error: mErr } = await supabase.from('mcqs').insert(mcqDataList);
                            if (mErr) {
                                console.error(`    ❌ MCQ Error for ${topicTitle}: ${mErr.message}`);
                            } else {
                                console.log(`    ✅ Migrated ${mcqDataList.length} MCQs for ${topicTitle}`);
                            }
                        }
                    }
                }
            }
        }
    }

    console.log("\n✅ Migration complete!");
}

migrate();
