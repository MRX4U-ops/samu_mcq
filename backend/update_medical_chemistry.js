const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const raw = fs.readFileSync('medical_chemistry_raw.txt', 'utf-8');
    
    // Parse the raw text
    const topics = [];
    let currentTopic = null;
    let currentQuestion = null;
    
    const lines = raw.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        if (line.match(/^Topic\s+(\d+)$/i)) {
            const num = line.match(/^Topic\s+(\d+)$/i)[1];
            currentTopic = {
                title: `Topic ${num}`,
                questions: []
            };
            topics.push(currentTopic);
        } else if (line.match(/^Question\s+\d+/i)) {
            currentQuestion = {
                question: "",
                options: [],
                correctIndex: -1,
                explanation: ""
            };
            currentTopic.questions.push(currentQuestion);
        } else if (line.startsWith("Situation:")) {
            currentQuestion.question = line;
        } else if (line.match(/^[a-z]\.\s/i) || line.match(/^\*[a-z]\.\s/i) || line.match(/^[a-z]\./i) || line.match(/^\*[a-z]\./i) || line.match(/^Выберите один ответ:/i) || line.match(/^Select one answer:/i) || line.match(/^Select one:/i)) {
            if (line.match(/^Выберите один ответ:/i) || line.match(/^Select one answer:/i) || line.match(/^Select one:/i)) {
                continue;
            }
            if (line.includes("Situation:") && currentQuestion.question === "") {
               currentQuestion.question = line;
               continue;
            }

            let isCorrect = line.startsWith('*');
            let optText = line.replace(/^\*?[a-z]\.\s*/i, '').trim();
            if (optText) {
                currentQuestion.options.push(optText);
                if (isCorrect) {
                    currentQuestion.correctIndex = currentQuestion.options.length - 1;
                }
            }
        } else {
            if (currentQuestion && currentQuestion.options.length === 0) {
                 if (currentQuestion.question) {
                     currentQuestion.question += "\n" + line;
                 } else {
                     currentQuestion.question = line;
                 }
            }
        }
    }
    
    // Check mapping
    const subject1Id = '5a962027-bc0a-43dd-87c0-a32611229cc6'; // Medical chemistry Module 1
    const subject2Id = 'b23718ce-581c-4fed-bbda-158bdc590d4d'; // Medical chemistry Module 2
    
    for (const t of topics) {
        const topicNum = parseInt(t.title.replace('Topic ', ''));
        const subjectId = topicNum <= 11 ? subject1Id : subject2Id;
        
        // Ensure topic exists
        let { data: topicData, error: topicError } = await supabase
            .from('topics')
            .select('id')
            .eq('subject_id', subjectId)
            .eq('title', t.title);
            
        let topicUUID;
        if (!topicData || topicData.length === 0) {
            console.log(`Creating ${t.title} for subject ${subjectId}`);
            const { data: newTopic, error: createError } = await supabase
                .from('topics')
                .insert({ subject_id: subjectId, title: t.title })
                .select();
            if (createError) throw createError;
            topicUUID = newTopic[0].id;
        } else {
            topicUUID = topicData[0].id;
        }
        
        for (const q of t.questions) {
            if (q.options.length === 0) continue;
            
            // Delete existing question if exists (maybe update is better, but this avoids duplicates if text differs slightly)
            // Just insert as new or check by exact match
            const { data: exQ } = await supabase
                .from('mcqs')
                .select('id')
                .eq('topic_id', topicUUID)
                .eq('task_type', 'situational_task')
                .ilike('question', q.question.substring(0, 100) + '%');
                
            if (exQ && exQ.length > 0) {
                console.log(`Updating question in ${t.title}`);
                await supabase
                    .from('mcqs')
                    .update({
                        question: q.question,
                        options: q.options,
                        correct_index: q.correctIndex,
                        task_type: 'situational_task'
                    })
                    .eq('id', exQ[0].id);
            } else {
                console.log(`Inserting question into ${t.title}`);
                await supabase
                    .from('mcqs')
                    .insert({
                        topic_id: topicUUID,
                        question: q.question,
                        options: q.options,
                        correct_index: q.correctIndex,
                        task_type: 'situational_task'
                    });
            }
        }
    }
    console.log('Done!');
}

run().catch(console.error);
