const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./src/config/supabase');

const newQuestions = [
  {
    "question": "The dorsalis pedis artery is a continuation of:",
    "options": [
      "anterior tibial",
      "popliteal",
      "peroneal",
      "anterior perforating branch of posterior tibial",
      "femoral"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'anterior tibial'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "The intermediate cutaneous nerve of the thigh:",
    "options": [
      "arises independently of the medial cutaneous nerve of the thigh",
      "pierces sartorius",
      "extends beneath the knee",
      "arises from the sacral plexus",
      "is a branch of the obturator nerve"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'arises independently of the medial cutaneous nerve of the thigh'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "Which of the following is not an action of gracilis?",
    "options": [
      "extension of thigh",
      "none of these",
      "flexion of knee",
      "adduction of thigh",
      "medial rotation of the flexed knee"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'extension of thigh'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "The sole of the foot has a cutaneous nerve supply derived from:",
    "options": [
      "L4, L5, S1 and S2",
      "L5 and S1",
      "L4 and L5",
      "L5, S1 and S2",
      "L4, L5 and S1"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'L4, L5, S1 and S2'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "Obturator externus:",
    "options": [
      "external rotator of hip",
      "hip flexor",
      "internal rotator of hip",
      "supplied by S.I.",
      "is pierced by femoral circumflex artery"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'external rotator of hip'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "The lumbar plexus is formed by ventral primary rami of:",
    "options": [
      "L1, L2, L3 and L4",
      "formed by dorsal primary rami",
      "L2, L3, L4 and L5",
      "L2, L4, L5 and S1",
      "T12, L1, L2 and L3"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'L1, L2, L3 and L4'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "The dorsalis pedis artery is:",
    "options": [
      "found perforating the first metatarsal space and joining with the medial plantar artery",
      "medial to extensor hallucis longus at the ankle",
      "medial to tibialis anterior at the ankle",
      "lateral to the digital branch of the deep peroneal nerve",
      "lateral to extensor hallucis longus at the ankle"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'found perforating the first metatarsal space and joining with the medial plantar artery'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "The superficial epigastric, superior perforating and deep external pudendal arteries are all branches of:",
    "options": [
      "none of the above",
      "profunda femoris",
      "internal iliac",
      "popliteal",
      "external iliac"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'none of the above'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "The most powerful extensor of the hip is:",
    "options": [
      "gluteus maximus",
      "iliacus",
      "psoas major",
      "piriformis",
      "obturator externus"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'gluteus maximus'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "The chief dorsiflexor of the ankle joint:",
    "options": [
      "tibialis anterior",
      "peroneus tertius",
      "none of the above",
      "extensor longus digitorum",
      "extensor longus hallucis"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'tibialis anterior'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "Structures closely related to long saphenous vein at ankle include which of the following?",
    "options": [
      "a branch of the femoral nerve",
      "dorsalis pedis artery",
      "medial superficial lymphatic trunks",
      "major perforating veins to deep venous system",
      "a branch of the anterior tibial nerve"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'a branch of the femoral nerve'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "Features of the fibula include which of the following?",
    "options": [
      "its medial surface is grooved for the origin of tibialis posterior",
      "its lower third is rough for the origin of soleus",
      "it is on the medial side of the tibia",
      "it is ossified from five centres",
      "it does not provide origin for flexor digitorum longus"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'its medial surface is grooved for the origin of tibialis posterior'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "The cutaneous nerve supplying the medial aspect of the calf is:",
    "options": [
      "saphenous",
      "superficial peroneal",
      "anterior femoral cutaneous",
      "sural",
      "posterior femoral cutaneous"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'saphenous'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "The long saphenous vein:",
    "options": [
      "is in close relation with the saphenous nerve throughout the length of its course",
      "passes posteriorly to the medial malleolus",
      "passes anterior to the inguinal ligament",
      "receives tributaries from the perineum",
      "ascends the lateral side of the leg"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'is in close relation with the saphenous nerve throughout the length of its course'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "Iliopsoas:",
    "options": [
      "none of the above",
      "synergist of quadriceps femoris",
      "lateral rotator of hip",
      "supplied by obturator nerve",
      "medial rotator of hip"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'none of the above'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "The lateral aspect of the thigh has a cutaneous nerve supply derived from:",
    "options": [
      "L4, L5 and S1",
      "S1 and S2",
      "L3 and 4",
      "L5, S1 and S2",
      "L2 and 3"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'L4, L5 and S1'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "The only muscle to cross the anterior tibial artery is:",
    "options": [
      "extensor hallucis longus",
      "extensor digitorum brevis",
      "tibialis anterior",
      "extensor hallucis brevis",
      "extensor digitorum longus"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'extensor hallucis longus'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "The nerve supply to the knee joint comes from:",
    "options": [
      "all of",
      "sciatic",
      "femoral",
      "none of these",
      "obturator"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'all of'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "Which of the following is NOT a branch of the profunda femoris artery?",
    "options": [
      "popliteal",
      "perforating",
      "medial femoral circumflex",
      "all are branches of the profunda",
      "lateral femoral circumflex"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'popliteal'. This choice aligns with the established clinical curriculum."
  },
  {
    "question": "Which of the following is true of the saphenous nerve?",
    "options": [
      "terminates just below the knee",
      "supplies adductor magnus",
      "is predominantly from L2",
      "is cutaneous only",
      "pierces the deep fascia in the femoral triangle"
    ],
    "correctIndex": 0,
    "explanation": "The correct answer is 'terminates just below the knee'. This choice aligns with the established clinical curriculum."
  }
];

async function run() {
  console.log('Starting Clinical Anatomy Topic 5 MCQ update...');

  // 1. Update mobile-app/src/data/repository/course2/s-2-2.js
  const mobileFilePath = path.join(__dirname, '../mobile-app/src/data/repository/course2/s-2-2.js');
  if (fs.existsSync(mobileFilePath)) {
    console.log(`Updating ${mobileFilePath}...`);
    const fileContent = fs.readFileSync(mobileFilePath, 'utf8');
    const startIdx = fileContent.indexOf('{');
    const endIdx = fileContent.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = fileContent.substring(startIdx, endIdx + 1);
      const data = JSON.parse(jsonStr);

      // Replace key "t-s-2-2-4"
      data['t-s-2-2-4'] = newQuestions;

      const newContent = `export const s_2_2 = ${JSON.stringify(data, null, 2)};\n`;
      fs.writeFileSync(mobileFilePath, newContent, 'utf8');
      console.log('✅ mobile-app file updated successfully.');
    } else {
      console.error('❌ Failed to parse JSON structure in mobile file.');
    }
  } else {
    console.error(`❌ Mobile file not found at ${mobileFilePath}`);
  }

  // 2. Update backend/src/data/anatomyData.js
  const backendFilePath = path.join(__dirname, 'src/data/anatomyData.js');
  if (fs.existsSync(backendFilePath)) {
    console.log(`Updating ${backendFilePath}...`);
    const data = require(backendFilePath);
    
    // Replace s-2-2 -> t-s-2-2-4 -> test
    if (data['s-2-2'] && data['s-2-2']['t-s-2-2-4']) {
      data['s-2-2']['t-s-2-2-4']['test'] = newQuestions;
      const newContent = `module.exports = ${JSON.stringify(data, null, 2)};\n`;
      fs.writeFileSync(backendFilePath, newContent, 'utf8');
      console.log('✅ backend data file updated successfully.');
    } else {
      console.error('❌ Failed to find s-2-2 -> t-s-2-2-4 in backend file.');
    }
  } else {
    console.error(`❌ Backend file not found at ${backendFilePath}`);
  }

  // 3. Update Supabase
  console.log('Connecting to Supabase...');
  const topicId = '9bf609d1-e760-4529-a0e5-b30f8c7eef07';
  
  // Fetch existing mcqs for this topic
  const { data: dbMcqs, error: fetchError } = await supabaseAdmin
    .from('mcqs')
    .select('id, question, options, correct_index')
    .eq('topic_id', topicId)
    .eq('task_type', 'test_question');

  if (fetchError) {
    console.error('❌ Error fetching from Supabase:', fetchError);
    return;
  }

  console.log(`Fetched ${dbMcqs.length} test questions from Supabase.`);

  let updatedCount = 0;
  for (const newQ of newQuestions) {
    // Find matching question in dbMcqs
    const match = dbMcqs.find(dbQ => {
      const q1 = dbQ.question.trim().replace(/\s+/g, ' ').toLowerCase();
      const q2 = newQ.question.trim().replace(/\s+/g, ' ').toLowerCase();
      return q1 === q2;
    });

    if (match) {
      console.log(`Updating DB MCQ ID: ${match.id} for "${newQ.question}"`);
      const { error: updateError } = await supabaseAdmin
        .from('mcqs')
        .update({
          options: newQ.options,
          correct_index: newQ.correctIndex,
          explanation: newQ.explanation
        })
        .eq('id', match.id);

      if (updateError) {
        console.error(`❌ Error updating MCQ ID ${match.id}:`, updateError);
      } else {
        updatedCount++;
      }
    } else {
      console.warn(`⚠️ Warning: No exact match found in DB for question: "${newQ.question}"`);
    }
  }

  console.log(`✅ DB Update complete. Updated ${updatedCount}/${newQuestions.length} records.`);
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
