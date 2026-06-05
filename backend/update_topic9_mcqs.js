const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./src/config/supabase');

const newQuestions = [
  {
    question: "The mitral valve is located between the:",
    options: [
      "Left atrium and left ventricle",
      "Right ventricle and aorta",
      "Right atrium and right ventricle",
      "Right atrium and pulmonary trunk",
      "Left ventricle and aorta"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Left atrium and left ventricle."
  },
  {
    question: "The thoracic duct drains lymph from:",
    options: [
      "Most of the body",
      "Left upper limb and left side of head and thorax",
      "Only the abdominal organs",
      "Only the lower limbs",
      "Right upper limb and right side of head and thorax"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Most of the body."
  },
  {
    question: "The tricuspid valve is located between the:",
    options: [
      "Right atrium and right ventricle",
      "Left atrium and left ventricle",
      "Right atrium and pulmonary trunk",
      "Left ventricle and aorta",
      "Right ventricle and aorta"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Right atrium and right ventricle."
  },
  {
    question: "The coronary arteries arise from the:",
    options: [
      "Ascending aorta",
      "Aortic arch",
      "Descending aorta",
      "Superior vena cava",
      "Pulmonary trunk"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Ascending aorta."
  },
  {
    question: "The azygos venous system drains blood from the:",
    options: [
      "Posterior thoracic and abdominal walls",
      "Upper limbs",
      "Lower limbs",
      "Head and neck",
      "Heart muscle"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Posterior thoracic and abdominal walls."
  },
  {
    question: "The inferior vena cava drains blood from the:",
    options: [
      "Abdomen, pelvis, and lower limbs",
      "Thoracic wall",
      "Heart muscle",
      "Lungs",
      "Head, neck, and upper limbs"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Abdomen, pelvis, and lower limbs."
  },
  {
    question: "The apex of the heart is formed by the:",
    options: [
      "Left ventricle",
      "Right ventricle",
      "Interventricular septum",
      "Left atrium",
      "Right atrium"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Left ventricle."
  },
  {
    question: "The recurrent laryngeal nerves supply:",
    options: [
      "Most of the muscles of the larynx",
      "The heart muscle",
      "The esophagus",
      "The thyroid gland",
      "The diaphragm"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Most of the muscles of the larynx."
  },
  {
    question: "The pulmonary veins carry:",
    options: [
      "Oxygenated blood to the left atrium",
      "Deoxygenated blood to the right atrium",
      "Deoxygenated blood to the left atrium",
      "Mixed blood to the left atrium",
      "Oxygenated blood to the right atrium"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Oxygenated blood to the left atrium."
  },
  {
    question: "The thyroid gland is located:",
    options: [
      "Anterior to the trachea",
      "Posterior to the trachea",
      "Inferior to the diaphragm",
      "Superior to the heart",
      "Within the mediastinum"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Anterior to the trachea."
  },
  {
    question: "The aortic arch gives rise to the:",
    options: [
      "Brachiocephalic trunk, left common carotid, and left subclavian arteries",
      "Pulmonary trunk and pulmonary arteries",
      "Azygos vein and hemiazygos vein",
      "Right and left coronary arteries",
      "Superior and inferior vena cavae"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Brachiocephalic trunk, left common carotid, and left subclavian arteries."
  },
  {
    question: "The sinoatrial (SA) node is located in the:",
    options: [
      "Right atrium",
      "Right ventricle",
      "Left atrium",
      "Interatrial septum",
      "Left ventricle"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Right atrium."
  },
  {
    question: "The pericardium is composed of:",
    options: [
      "Fibrous and serous layers",
      "Epithelial tissue only",
      "Only a fibrous layer",
      "Only a serous layer",
      "Muscle tissue and connective tissue"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Fibrous and serous layers."
  },
  {
    question: "The atrioventricular (AV) node is located in the:",
    options: [
      "Interatrial septum",
      "Left atrium",
      "Right atrium",
      "Right ventricle",
      "Left ventricle"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Interatrial septum."
  },
  {
    question: "The heart is located in the:",
    options: [
      "Mediastinum",
      "Cranial cavity",
      "Spinal cavity",
      "Abdominal cavity",
      "Pleural cavity"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Mediastinum."
  },
  {
    question: "The thymus gland is located in the:",
    options: [
      "Superior mediastinum",
      "Posterior mediastinum",
      "Inferior mediastinum",
      "Middle mediastinum",
      "Anterior mediastinum"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Superior mediastinum."
  },
  {
    question: "The superior vena cava drains blood from the:",
    options: [
      "Head, neck, and upper limbs",
      "Abdomen and pelvis",
      "Lungs",
      "Lower limbs",
      "Heart muscle"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Head, neck, and upper limbs."
  },
  {
    question: "The great cardiac vein drains into the:",
    options: [
      "Coronary sinus",
      "Inferior vena cava",
      "Right atrium directly",
      "Superior vena cava",
      "Left atrium directly"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Coronary sinus."
  },
  {
    question: "The phrenic nerve innervates the:",
    options: [
      "Diaphragm",
      "Abdominal muscles",
      "Heart muscle",
      "Intercostal muscles",
      "Neck muscles"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Diaphragm."
  }
];

async function run() {
  console.log('Starting Topic 9 updates (19 questions total)...');

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

      // Overwrite with exactly 19 questions
      data['t-s-2-2-8'] = newQuestions;

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
    
    if (data['s-2-2'] && data['s-2-2']['t-s-2-2-9']) {
      // Overwrite with exactly 19 questions
      data['s-2-2']['t-s-2-2-9'].test = newQuestions.map(q => ({
        ...q,
        correctAnswer: q.correctIndex,
        explanation: `Correct answer: ${q.options[q.correctIndex]}`
      }));

      const newContent = `module.exports = ${JSON.stringify(data, null, 2)};\n`;
      fs.writeFileSync(backendFilePath, newContent, 'utf8');
      console.log('✅ backend data file updated successfully.');
    } else {
      console.error('❌ s-2-2 -> t-s-2-2-9 not found in backend data.');
    }
  } else {
    console.error(`❌ Backend file not found at ${backendFilePath}`);
  }

  // 3. Update Supabase
  console.log('Connecting to Supabase...');
  const topicId = '37cf4b89-3c42-4860-95ce-eff2ed63eeb0';

  const { data: dbMcqs, error: fetchError } = await supabaseAdmin
    .from('mcqs')
    .select('id')
    .eq('topic_id', topicId)
    .eq('task_type', 'test_question')
    .order('id');

  if (fetchError) {
    console.error('❌ Error fetching from Supabase:', fetchError);
    return;
  }

  console.log(`Found ${dbMcqs.length} test question records in Supabase for Topic 9.`);

  // Update 19, delete the rest
  for (let i = 0; i < dbMcqs.length; i++) {
    const dbId = dbMcqs[i].id;
    if (i < 19) {
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
        console.log(`✅ Updated MCQ ${i + 1}/19: ID ${dbId}`);
      }
    } else {
      // Delete 20th and beyond
      const { error: deleteError } = await supabaseAdmin
        .from('mcqs')
        .delete()
        .eq('id', dbId);

      if (deleteError) {
        console.error(`❌ Error deleting extra MCQ ID ${dbId}:`, deleteError);
      } else {
        console.log(`✅ Deleted extra MCQ ID ${dbId}`);
      }
    }
  }
  console.log('✅ Supabase Topic 9 update complete.');
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
