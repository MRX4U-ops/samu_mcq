const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./src/config/supabase');

const newQuestions = [
  {
    question: "Lymphatic drainage from the breast primarily goes to:",
    options: [
      "Both axillary and internal mammary lymph nodes",
      "Inguinal lymph nodes",
      "Axillary lymph nodes",
      "Internal mammary lymph nodes",
      "Supraclavicular lymph nodes"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Both axillary and internal mammary lymph nodes."
  },
  {
    question: "The main blood supply to the breast comes from:",
    options: [
      "All of the above",
      "Internal thoracic artery",
      "Subscapular artery",
      "Lateral thoracic artery",
      "Thoracoacromial artery"
    ],
    correctIndex: 0,
    explanation: "The correct answer is All of the above."
  },
  {
    question: "Peau d'orange appearance of the breast is a sign of:",
    options: [
      "Inflammatory breast cancer",
      "Benign cyst",
      "Fat necrosis",
      "Fibroadenoma",
      "Mastitis"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Inflammatory breast cancer."
  },
  {
    question: "Nipple retraction can be a sign of:",
    options: [
      "Breast cancer",
      "Mastitis",
      "Fat necrosis",
      "Fibroadenoma",
      "Benign cyst"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Breast cancer."
  },
  {
    question: "Montgomery glands are:",
    options: [
      "Sebaceous glands in the areola",
      "Blood vessels",
      "Sweat glands",
      "Milk-producing glands",
      "Lymph nodes"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Sebaceous glands in the areola."
  },
  {
    question: "Sentinel lymph node biopsy is performed to:",
    options: [
      "Identify the first lymph node(s) that receive drainage from the tumor",
      "Remove all axillary lymph nodes",
      "Treat lymphedema",
      "Remove the internal mammary lymph nodes",
      "Prevent lymphedema"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Identify the first lymph node(s) that receive drainage from the tumor."
  },
  {
    question: "The areola contains:",
    options: [
      "All of the above",
      "Modified apocrine glands",
      "Sweat glands",
      "Sebaceous glands",
      "Only hair follicles"
    ],
    correctIndex: 0,
    explanation: "The correct answer is All of the above."
  },
  {
    question: "Paget's disease of the nipple is a form of:",
    options: [
      "Breast cancer",
      "Fungal infection",
      "Benign skin condition",
      "Viral infection",
      "Bacterial infection"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Breast cancer."
  },
  {
    question: "The axillary tail of Spence is:",
    options: [
      "An extension of breast tissue into the axilla",
      "A muscle",
      "A ligament",
      "A lymph node",
      "A blood vessel"
    ],
    correctIndex: 0,
    explanation: "The correct answer is An extension of breast tissue into the axilla."
  },
  {
    question: "Lymphedema after breast surgery is caused by:",
    options: [
      "Disruption of lymphatic drainage",
      "Scar tissue formation",
      "Damage to blood vessels",
      "Damage to nerves",
      "Infection"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Disruption of lymphatic drainage."
  },
  {
    question: "The retromammary space is located:",
    options: [
      "Between the mammary gland and deep fascia covering the pectoralis major muscle",
      "Between the skin and subcutaneous tissue",
      "Between the pectoralis major and minor muscles",
      "Between the subcutaneous tissue and mammary gland",
      "Within the mammary gland itself"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Between the mammary gland and deep fascia covering the pectoralis major muscle."
  },
  {
    question: "A radical mastectomy involves removal of:",
    options: [
      "Breast tissue, axillary lymph nodes, and pectoralis muscles",
      "Only the nipple and areola",
      "Only the tumor",
      "All breast tissue",
      "Breast tissue and axillary lymph nodes"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Breast tissue, axillary lymph nodes, and pectoralis muscles."
  },
  {
    question: "The nipple is located at approximately the:",
    options: [
      "Fourth intercostal space",
      "Fifth intercostal space",
      "Third intercostal space",
      "Second intercostal space",
      "Sixth intercostal space"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Fourth intercostal space."
  },
  {
    question: "Breast conserving surgery (lumpectomy) involves removal of:",
    options: [
      "Only the tumor and a small margin of surrounding tissue",
      "Only the nipple and areola",
      "Breast tissue and axillary lymph nodes",
      "Breast tissue, axillary lymph nodes, and pectoralis muscles",
      "All breast tissue"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Only the tumor and a small margin of surrounding tissue."
  },
  {
    question: "Cooper's ligaments are:",
    options: [
      "Fibrous connective tissue that support the breast",
      "Blood vessels",
      "Muscle fibers",
      "Nerve fibers",
      "Lymphatic vessels"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Fibrous connective tissue that support the breast."
  },
  {
    question: "The most common site of breast cancer is:",
    options: [
      "Upper outer quadrant",
      "Lower inner quadrant",
      "Lower outer quadrant",
      "Nipple",
      "Areola"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Upper outer quadrant."
  },
  {
    question: "The functional unit of the breast is the:",
    options: [
      "Lobule",
      "Montgomery gland",
      "Nipple",
      "Lactiferous duct",
      "Areola"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Lobule."
  },
  {
    question: "A modified radical mastectomy involves removal of:",
    options: [
      "Breast tissue and axillary lymph nodes",
      "All breast tissue",
      "Only the nipple and areola",
      "Breast tissue, axillary lymph nodes, and pectoralis muscles",
      "Only the tumor"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Breast tissue and axillary lymph nodes."
  },
  {
    question: "Lactiferous ducts:",
    options: [
      "Carry milk from the lobules to the nipple",
      "Store milk",
      "Produce milk",
      "Carry blood to the breast",
      "Carry lymph from the breast"
    ],
    correctIndex: 0,
    explanation: "The correct answer is Carry milk from the lobules to the nipple."
  },
  {
    question: "A simple mastectomy involves removal of:",
    options: [
      "All breast tissue",
      "Only the nipple and areola",
      "Only the tumor",
      "Breast tissue, axillary lymph nodes, and pectoralis muscles",
      "Breast tissue and axillary lymph nodes"
    ],
    correctIndex: 0,
    explanation: "The correct answer is All breast tissue."
  }
];

async function run() {
  console.log('Starting Topic 8 updates...');

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

      data['t-s-2-2-7'] = newQuestions;

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
    
    if (data['s-2-2'] && data['s-2-2']['t-s-2-2-8']) {
      data['s-2-2']['t-s-2-2-8'].test = newQuestions.map(q => ({
        ...q,
        correctAnswer: q.correctIndex,
        explanation: `Correct answer: ${q.options[q.correctIndex]}`
      }));

      const newContent = `module.exports = ${JSON.stringify(data, null, 2)};\n`;
      fs.writeFileSync(backendFilePath, newContent, 'utf8');
      console.log('✅ backend data file updated successfully.');
    } else {
      console.error('❌ s-2-2 -> t-s-2-2-8 not found in backend data.');
    }
  } else {
    console.error(`❌ Backend file not found at ${backendFilePath}`);
  }

  // 3. Update Supabase
  console.log('Connecting to Supabase...');
  const topicId = '2e1693b9-50b4-450d-bcca-b9629e4e5ab5';

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

  console.log(`Found ${dbMcqs.length} test question records in Supabase for Topic 8.`);

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
    console.log('✅ Supabase Topic 8 update complete.');
  } else {
    console.error(`❌ Expected exactly 20 test question records in DB, but found ${dbMcqs.length}.`);
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
