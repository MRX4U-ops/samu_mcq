const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./src/config/supabase');

const newQuestions = [
  {
    question: "Which nerve innervates the buccinator muscle?",
    options: [
      "Facial nerve (VII)",
      "Mandibular nerve (V3)",
      "accessory nerve (11)",
      "Glossopharyngeal nerve (IX)",
      "Hypoglossal nerve (XII)"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Facial nerve (VII)."
  },
  {
    question: "Which of the following muscles is not attached to the hyoid bone?",
    options: [
      "Sternothyroid",
      "Mylohyoid",
      "Omohyoid",
      "Geniohyoid",
      "Sternohyoid"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Sternothyroid."
  },
  {
    question: "What is the primary function of the levator labii superioris muscle?",
    options: [
      "Elevate the upper lip",
      "Elevate the upper eye brows",
      "Retract the lips",
      "Depress the lower lip",
      "Close the lips"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Elevate the upper lip."
  },
  {
    question: "Which nerve innervates the mylohyoid muscle?",
    options: [
      "Mylohyoid nerve (branch of the trigeminal nerve)",
      "Glossopharyngeal nerve",
      "Hypoglossal nerve",
      "Facial nerve",
      "geniohyoid nerve"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Mylohyoid nerve (branch of the trigeminal nerve)."
  },
  {
    question: "Which structure passes through the intermediate tendon of the digastric muscle?",
    options: [
      "Stylohyoid muscle",
      "omohyoid muscle",
      "Sternocleidomastoid muscle",
      "Hyoid bone",
      "Omohyoid muscle"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Stylohyoid muscle."
  },
  {
    question: "What is the function of the infrahyoid muscles during breathing?",
    options: [
      "Depress the hyoid bone and larynx",
      "Elevate the rib cage",
      "Elevate the diaphragm",
      "Expand the thoracic cavity",
      "Depress the thyroid cartilage"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Depress the hyoid bone and larynx."
  },
  {
    question: "Where does the sternohyoid muscle attach?",
    options: [
      "Sternum and hyoid bone",
      "Hyoid bone and clavicle",
      "Hyoid bone and mandibula",
      "Sternum and thyroid cartilage",
      "Clavicle and mandible"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Sternum and hyoid bone."
  },
  {
    question: "Which action is performed by the depressor anguli oris muscle?",
    options: [
      "Depress the corners of the mouth",
      "Flare the nostrils",
      "Depress the eyebrows",
      "Elevate the upper lip",
      "Close the eyes"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Depress the corners of the mouth."
  },
  {
    question: "The risorius muscle is primarily responsible for which action?",
    options: [
      "Retracting the corners of the mouth",
      "Pouting",
      "Elevate the eyelids",
      "Raising the eyebrows",
      "Smiling"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Retracting the corners of the mouth."
  },
  {
    question: "How does the geniohyoid muscle contribute to swallowing?",
    options: [
      "Elevates and pulls the hyoid bone anteriorly",
      "Depresses the mandible",
      "Digastric Muscle Anatomy",
      "Retracts the tongue",
      "Stabilizes the cervical vertebrae"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Elevates and pulls the hyoid bone anteriorly."
  },
  {
    question: "What is the primary role of the thyrohyoid muscle?",
    options: [
      "Elevate the thyroid cartilage",
      "Elevate the thyroid muscle",
      "Depress the hyoid bone",
      "Elevate the hyoid bone",
      "Depress the thyroid cartilage"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Elevate the thyroid cartilage."
  },
  {
    question: "The corrugator supercilii muscle is responsible for which facial expression?",
    options: [
      "Frowning",
      "Raising the eyebrows",
      "Grimacing",
      "Squinting",
      "Smiling"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Frowning."
  },
  {
    question: "Which structure is NOT found within the carotid triangle?",
    options: [
      "Subclavian artery",
      "Common carotid artery",
      "Internal jugular vein",
      "Internal carotid artery",
      "Vagus nerve"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Subclavian artery."
  },
  {
    question: "What is the primary function of the suprahyoid muscles?",
    options: [
      "Elevate the hyoid bone and larynx during swallowing",
      "Depress the hyoid bone during speech",
      "Stabilize the hyoid bone during head movement",
      "Rotate the hyoid bone during mastication",
      "Depress angulus oris"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Elevate the hyoid bone and larynx during swallowing."
  },
  {
    question: "What is the primary function of the orbicularis oris muscle?",
    options: [
      "Pucker the lips",
      "Retract the corners of the mouth",
      "Elevate jaw",
      "Elevate the upper lip",
      "Close the eyelids"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Pucker the lips."
  },
  {
    question: "Which nerve innervates the majority of the infrahyoid muscles?",
    options: [
      "Ansa cervicalis",
      "Ansa",
      "Phrenic nerve",
      "Hypoglossal nerve",
      "Vagus nerve"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Ansa cervicalis."
  },
  {
    question: "Which structure forms the superior boundary of the anterior triangle of the neck?",
    options: [
      "Mandible",
      "Clavicle",
      "Hyoid bone",
      "Sternum",
      "First rib"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Mandible."
  },
  {
    question: "Which branch of the facial nerve innervates the frontalis muscle?",
    options: [
      "Temporal branch",
      "Buccal branch",
      "Mandibular branch",
      "Phrenic nerve",
      "Zygomatic branch"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Temporal branch."
  },
  {
    question: "What is the primary action of the zygomaticus major muscle?",
    options: [
      "Smile",
      "Depress the lower lip",
      "Frown",
      "Elevate the upper lip",
      "gaze"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Smile."
  },
  {
    question: "Which muscle forms the posterior boundary of the posterior triangle of the neck?",
    options: [
      "Trapezius",
      "Sternohyoid",
      "Sternocleidomastoid",
      "Omohyoid",
      "Platysma"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Trapezius."
  }
];

async function run() {
  console.log('Starting Topic 7 updates...');

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

      data['t-s-2-2-6'] = newQuestions;

      const newContent = `export const s_2_2 = ${JSON.stringify(data, null, 2)};\n`;
      fs.writeFileSync(mobileFilePath, newContent, 'utf8');
      console.log('✅ mobile-app s-2-2.js file updated successfully.');
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
    
    if (data['s-2-2'] && data['s-2-2']['t-s-2-2-7']) {
      // Map to backend structure (which includes correctAnswer field)
      data['s-2-2']['t-s-2-2-7'].test = newQuestions.map(q => ({
        ...q,
        correctAnswer: q.correctIndex,
        explanation: `Correct answer: ${q.options[q.correctIndex]}`
      }));

      const newContent = `module.exports = ${JSON.stringify(data, null, 2)};\n`;
      fs.writeFileSync(backendFilePath, newContent, 'utf8');
      console.log('✅ backend data file updated successfully.');
    } else {
      console.error('❌ s-2-2 -> t-s-2-2-7 not found in backend data.');
    }
  } else {
    console.error(`❌ Backend file not found at ${backendFilePath}`);
  }

  // 3. Update Supabase
  console.log('Connecting to Supabase...');
  const topicId = '21ce78ef-94cf-4d86-9238-d4261fb8bde0';

  const { data: dbMcqs, error: fetchError } = await supabaseAdmin
    .from('mcqs')
    .select('id')
    .eq('topic_id', topicId)
    .eq('task_type', 'test_question')
    .order('id'); // consistent sorting to map to newQuestions

  if (fetchError) {
    console.error('❌ Error fetching from Supabase:', fetchError);
    return;
  }

  console.log(`Found ${dbMcqs.length} test question records in Supabase for Topic 7.`);

  if (dbMcqs.length === 20) {
    for (let i = 0; i < 20; i++) {
      const dbId = dbMcqs[i].id;
      const q = newQuestions[i];

      const { error: updateError } = await supabaseAdmin
        .from('mcqs')
        .update({
          question: q.question,
          options: q.options,
          correct_index: q.correctIndex,
          explanation: `Correct answer: ${q.options[q.correctIndex]}`
        })
        .eq('id', dbId);

      if (updateError) {
        console.error(`❌ Error updating MCQ ID ${dbId}:`, updateError);
      } else {
        console.log(`✅ Updated MCQ ${i + 1}/20: ID ${dbId}`);
      }
    }
    console.log('✅ Supabase Topic 7 update complete.');
  } else {
    console.error(`❌ Expected exactly 20 test question records in DB, but found ${dbMcqs.length}. DB schema requires mapping fix script.`);
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
