const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./src/config/supabase');

const newQuestions = [
  {
    question: "A hiatal hernia involves protrusion of the:",
    options: [
      "Stomach into the thorax",
      "Spleen into the thorax",
      "Lung into the mediastinum",
      "Liver into the thorax",
      "Heart into the abdomen"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Stomach into the thorax."
  },
  {
    question: "The right vagus nerve gives rise to the:",
    options: [
      "Posterior vagal trunk",
      "Anterior vagal trunk",
      "Phrenic nerve",
      "Left recurrent laryngeal nerve",
      "Right recurrent laryngeal nerve"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Posterior vagal trunk."
  },
  {
    question: "The vagus nerves in the posterior mediastinum contribute to the:",
    options: [
      "Esophageal plexus",
      "Cardiac plexus",
      "All of the above",
      "Pulmonary plexus",
      "Only the esophageal and cardiac plexuses"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Esophageal plexus."
  },
  {
    question: "The hemiazygos vein drains into the:",
    options: [
      "Azygos vein",
      "Superior vena cava",
      "Left renal vein",
      "Inferior vena cava",
      "Right renal vein"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Azygos vein."
  },
  {
    question: "The left vagus nerve gives rise to the:",
    options: [
      "Anterior vagal trunk",
      "Right recurrent laryngeal nerve",
      "Phrenic nerve",
      "Left recurrent laryngeal nerve",
      "Posterior vagal trunk"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Anterior vagal trunk."
  },
  {
    question: "The accessory hemiazygos vein drains into the:",
    options: [
      "Azygos vein",
      "Left renal vein",
      "Superior vena cava",
      "Right renal vein",
      "Inferior vena cava"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Azygos vein."
  },
  {
    question: "The cisterna chyli is located:",
    options: [
      "At the beginning of the thoracic duct",
      "Within the anterior mediastinum",
      "Within the superior mediastinum",
      "At the end of the thoracic duct",
      "Within the middle mediastinum"
    ],
    correctIndex: 0,
    explanation: "The correct answer is At the beginning of the thoracic duct."
  },
  {
    question: "The posterior mediastinum is located:",
    options: [
      "Posterior to the pericardium",
      "Lateral to the lungs",
      "Inferior to the diaphragm",
      "Anterior to the pericardium",
      "Superior to the heart"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Posterior to the pericardium."
  },
  {
    question: "The esophagus passes through the diaphragm at the:",
    options: [
      "Esophageal hiatus",
      "Central tendon",
      "Median arcuate ligament",
      "Aortic hiatus",
      "Caval opening"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Esophageal hiatus."
  },
  {
    question: "The descending thoracic aorta begins at the level of:",
    options: [
      "T4 vertebra",
      "L1 vertebra",
      "T1 vertebra",
      "T12 vertebra",
      "C6 vertebra"
    ],
    correctIndex: 0,
    explanation: "The correct answer is T4 vertebra."
  },
  {
    question: "The thoracic aorta gives off the:",
    options: [
      "Posterior intercostal arteries",
      "Bronchial arteries",
      "Esophageal arteries",
      "All of the above",
      "Only the posterior intercostal arteries"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Posterior intercostal arteries."
  },
  {
    question: "The azygos vein drains into the:",
    options: [
      "Superior vena cava",
      "Left atrium",
      "Right atrium",
      "Inferior vena cava",
      "Brachiocephalic vein"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Superior vena cava."
  },
  {
    question: "The thoracic duct empties into the:",
    options: [
      "Left subclavian vein",
      "Superior vena cava",
      "Inferior vena cava",
      "Right subclavian vein",
      "Azygos vein"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Left subclavian vein."
  },
  {
    question: "Esophageal varices are most commonly caused by:",
    options: [
      "Portal hypertension",
      "Esophageal stricture",
      "Pulmonary hypertension",
      "Systemic hypertension",
      "Aortic aneurysm"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Portal hypertension."
  },
  {
    question: "The paravertebral sympathetic chain is located:",
    options: [
      "Along the lateral aspect of the vertebral bodies",
      "Posterior to the vertebral bodies",
      "Within the vertebral canal",
      "Within the intervertebral foramina",
      "Anterior to the vertebral bodies"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Along the lateral aspect of the vertebral bodies."
  },
  {
    question: "The posterior mediastinum contains:",
    options: [
      "Esophagus, thoracic aorta, azygos venous system, vagus nerves, sympathetic trunks, thoracic duct",
      "Diaphragm only",
      "Heart, great vessels, trachea, primary bronchi",
      "Lungs and pleura",
      "Thymus, lymph nodes, internal thoracic vessels"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Esophagus, thoracic aorta, azygos venous system, vagus nerves, sympathetic trunks, thoracic duct."
  },
  {
    question: "The nerve most at risk during esophageal surgery is the:",
    options: [
      "Recurrent laryngeal nerve",
      "Sympathetic trunk",
      "Phrenic nerve",
      "Intercostal nerve",
      "Vagus nerve"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Recurrent laryngeal nerve."
  },
  {
    question: "The splanchnic nerves carry:",
    options: [
      "Preganglionic sympathetic fibers",
      "Sensory fibers only",
      "Postganglionic sympathetic fibers",
      "Preganglionic parasympathetic fibers",
      "Postganglionic parasympathetic 1 fibers"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Preganglionic sympathetic fibers."
  },
  {
    question: "A common surgical procedure for esophageal cancer is:",
    options: [
      "Esophagectomy",
      "Lobectomy",
      "Thoracotomy",
      "Pneumonectomy",
      "Mediastinoscopy"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Esophagectomy."
  },
  {
    question: "The esophagus begins at the level of:",
    options: [
      "C6 vertebra",
      "T4 vertebra",
      "T1 vertebra",
      "C4 vertebra",
      "T10 vertebra"
    ],
    correctIndex: 0,
    explanation: "The correct answer is C6 vertebra."
  }
];

async function run() {
  console.log('Starting Topic 10 updates...');

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

      data['t-s-2-2-9'] = newQuestions;

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
    
    if (data['s-2-2'] && data['s-2-2']['t-s-2-2-10']) {
      data['s-2-2']['t-s-2-2-10'].test = newQuestions.map(q => ({
        ...q,
        correctAnswer: q.correctIndex,
        explanation: `Correct answer: ${q.options[q.correctIndex]}`
      }));

      const newContent = `module.exports = ${JSON.stringify(data, null, 2)};\n`;
      fs.writeFileSync(backendFilePath, newContent, 'utf8');
      console.log('✅ backend data file updated successfully.');
    } else {
      console.error('❌ s-2-2 -> t-s-2-2-10 not found in backend data.');
    }
  } else {
    console.error(`❌ Backend file not found at ${backendFilePath}`);
  }

  // 3. Update Supabase
  console.log('Connecting to Supabase...');
  const topicId = 'e45eee9f-44b2-4ac5-ab51-e3aef3bec4c1';

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

  console.log(`Found ${dbMcqs.length} test question records in Supabase for Topic 10.`);

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
    console.log('✅ Supabase Topic 10 update complete.');
  } else {
    console.error(`❌ Expected exactly 20 test question records in DB, but found ${dbMcqs.length}.`);
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
