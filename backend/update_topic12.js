const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const TOPIC_ID = '1f9d1ae2-1070-430f-ba80-36a2c12c6977'; // Topic 12 of Medical Biology

const newQuestions = [
  {
    question: "What is the formula for the karyotype of a patient with Klinefelter syndrome:",
    options: [
      "*c. 47, XXY",
      "a. 46, XY",
      "b. 47, XXX",
      "d. 45, X 0"
    ]
  },
  {
    question: "Hemolytic disease is:",
    options: [
      "*a. Adhesion of red blood cells and their lysis",
      "b. Erythrocyte sedimentation",
      "c. Polymerism",
      "d. Hemophilia"
    ]
  },
  {
    question: "What is the formula for the karyotype of a patient with Edwards syndrome:",
    options: [
      "*d. 47, XY , 18+",
      "a. 47, XY , 21+",
      "b. 47, XY , 13+",
      "c. 46, XX , 5p-"
    ]
  },
  {
    question: "What is the formula for the karyotype of a patient with Patau syndrome:",
    options: [
      "*d. 47, XY , 13+",
      "a. 46, XX",
      "b. 46, XX , 5r -",
      "c. 47, XX , 18+"
    ]
  },
  {
    question: "What is the formula for the karyotype of a patient with Cry of the Cat syndrome:",
    options: [
      "*b. 46, XY , 5p -",
      "a. 46, XY , 9p+",
      "c. 45, X 0",
      "d. 47, XXY"
    ]
  },
  {
    question: "Family marriage (consanguineous) is:",
    options: [
      "*d. Marriage between people of the second and third degrees of family",
      "a. Marriage between people of the first degree of family",
      "b. Selective marriage",
      "c. B cancer between individuals with the same phenotypes for a certain trait"
    ]
  },
  {
    question: "Sex X-chromatin is absent in somatic cells in:",
    options: [
      "*b. Men and women with Turner–Shereshevsky syndrome",
      "a. Women with Edwards syndrome",
      "c. Women with Patau syndrome",
      "d. Women with Down syndrome"
    ]
  },
  {
    question: "Randomized marriage (panmixia) is:",
    options: [
      "*b. Non-selective marriage. Any person of the same sex is equally likely to marry any person of the opposite sex",
      "a. Marriage between people of the first degree of family",
      "c. Marriage between individuals who are not in family ties",
      "d. Marriage between individuals who are in family ties"
    ]
  },
  {
    question: "Inbreeding is:",
    options: [
      "*d. Marriage between individuals who are in family ties",
      "a. Non-selective marriage",
      "b. Marriage between individuals who are not related to each other",
      "c. Marriage between individuals with the same phenotypes for a certain trait"
    ]
  },
  {
    question: "Unrelated marriage is:",
    options: [
      "*b. Marriage between individuals who are not related to each other (missing common ancestors in the next 4-6 generations) ",
      "a. Non-selective marriage. Any person of the same sex is equally likely to marry any person of the opposite sex",
      "c. Marriage between people of the second and third degrees of family",
      "d. Marriage between individuals who are in family ties"
    ]
  },
  {
    question: "What is the formula for the karyotype of a patient with Down syndrome:",
    options: [
      "*b. 47, XY , 21+",
      "a. 47, XY , 13+",
      "c. 47, XY , 22+",
      "d. 46, XX , 5p-"
    ]
  },
  {
    question: "Define diseases inherited in an autosomal recessive manner?",
    options: [
      "*d. Alcoptonuria",
      "a. Muscular dystrophy (Duchenne syndrome)",
      "b. Neurofibromatosis",
      "c. Huntington's chorea"
    ]
  },
  {
    question: "What is the formula for the karyotype of a patient with Shereshevsky-Turner syndrome:",
    options: [
      "*a. 45, X 0",
      "b. 47, XXX",
      "c. 47, XXY",
      "d. 46, XX"
    ]
  },
  {
    question: "Humans experience diseases that are determined by genes that are characterized by the property of incomplete dominance. Name this disease:",
    options: [
      "*c. Cystinuria",
      "a. Hemophilia",
      "b. Phenylketonuria",
      "d. Albinism"
    ]
  }
];

async function run() {
  console.log('1. Deleting existing test questions for Topic 12 from Supabase...');
  const { error: deleteError } = await supabase
    .from('mcqs')
    .delete()
    .eq('topic_id', TOPIC_ID)
    .eq('task_type', 'test_question');

  if (deleteError) {
    console.error('Error deleting:', deleteError);
    return;
  }

  console.log('2. Inserting updated test questions into Supabase...');
  const toInsert = newQuestions.map(q => ({
    topic_id: TOPIC_ID,
    task_type: 'test_question',
    question: q.question,
    options: q.options,
    correct_index: 0,
    explanation: ''
  }));

  const { error: insertError } = await supabase
    .from('mcqs')
    .insert(toInsert);

  if (insertError) {
    console.error('Error inserting:', insertError);
    return;
  }
  console.log('Database updated successfully.');

  // Update local JS files
  const localPaths = [
    'c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-8.js',
    'c:/samu_mcq/student-web/src/data/course1/s-1-8.js'
  ];

  localPaths.forEach(filePath => {
    console.log(`Updating local file: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      console.log('File does not exist, skipping.');
      return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/export const (\w+)\s*=\s*(\{[\s\S]+\});/);
    if (!match) {
      console.log('No export match found, skipping.');
      return;
    }
    
    const varName = match[1];
    const obj = eval('(' + match[2] + ')');

    if (obj['t-s-1-8-11']) {
      // Set correctIndex to 0 for each question
      const localQs = newQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctIndex: 0
      }));
      obj['t-s-1-8-11'].test = localQs;

      const newContent = `export const ${varName} = ${JSON.stringify(obj, null, 2)};\n`;
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated local file successfully.`);
    } else {
      console.log('Topic t-s-1-8-11 not found in local file!');
    }
  });

  console.log('All updates complete.');
}

run().catch(console.error);
