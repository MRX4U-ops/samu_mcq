const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUBJECT_ID = 'b3454f82-8aa2-49c0-b8c5-bb25bcaf9c10';

const newQuestions = [
  {
    question: "The angle atd in the palm of the hand in Patau syndrome is:",
    options: [
      "*c. 108°",
      "a. 75°",
      "b. 120°",
      "d. 80°"
    ]
  },
  {
    question: "The phenomenon of arbitrary marriages in a large population of people is called:",
    options: [
      "*a. Panmixia",
      "b. Hybridization",
      "c. Inbreeding",
      "d. Outbreeding"
    ]
  },
  {
    question: "Using the cytogenetic method, diagnostics is carried out:",
    options: [
      "*b. Diseases associated with changes in the number of autosomes",
      "a. Genetic diseases",
      "c. Molecular diseases",
      "d. Multifactorial diseases"
    ]
  },
  {
    question: "Cells found in amniotic fluid do not contain X chromatin due to:",
    options: [
      "*b. X chromosome monosomy",
      "a. Trisomy of chromosome 18",
      "c. Trisomy X chromosome",
      "d. Trisomy of chromosome 21"
    ]
  },
  {
    question: "The angle atd on the palm normally does not exceed:",
    options: [
      "*a. 57°",
      "b. 75°",
      "c. 80°",
      "d. 108°"
    ]
  },
  {
    question: "The method for determining X-chromatin is used for diagnosis:",
    options: [
      "*a. Shereshevsky-Turner syndrome",
      "b. Hypertension",
      "c. Stomach ulcers",
      "d. Diabetes mellitus"
    ]
  },
  {
    question: "Dizygotic twins:",
    options: [
      "*a. Arise from different fertilized eggs",
      "b. They have the same patterns on the skin of the palms and fingers",
      "c. Develop from a single zygote",
      "d. Have the same phenotype"
    ]
  },
  {
    question: "The method for determining X-chromatin is used for diagnosis:",
    options: [
      "*d. Klinefelter's syndrome",
      "a. Diabetes mellitus",
      "b. Patau syndrome",
      "c. Stomach ulcers"
    ]
  },
  {
    question: "To carry out cytogenetic analysis use:",
    options: [
      "*a. Leukocytes",
      "b. Buccal epithelial cells",
      "c. Pancreatic cells",
      "d. Red blood cells"
    ]
  },
  {
    question: "Monozygotic twins:",
    options: [
      "*c. Always have the same genotype",
      "a. Develop from different eggs",
      "b. They have different genotypes.",
      "d. Develop from a single somatic cell"
    ]
  },
  {
    question: "Human populations, the number of which does not exceed 1500 individuals, and consanguineous marriages account for more than 90%, are called:",
    options: [
      "*a. Isolates",
      "b. Demami",
      "c. Ideal populations",
      "d. Closed populations"
    ]
  },
  {
    question: "Fingerprinting is the study of:",
    options: [
      "*c. Papillary patterns on the fingertips",
      "a. Papillary patterns on the soles",
      "b. Papillary patterns on the palms",
      "d. Papillary patterns on the palms and soles"
    ]
  },
  {
    question: "Small populations, the number of which does not exceed 1500-4000 individuals, are called:",
    options: [
      "*c. Demami",
      "a. Isolates",
      "b. Ideal populations",
      "d. Open populations"
    ]
  },
  {
    question: "Indicate the method of studying a trait (disease) in a family, indicating family ties between members of the pedigree - this is:",
    options: [
      "*a. Genealogical method",
      "b. Molecular genetic method",
      "c. Cytogenetic method",
      "d. Biochemical method"
    ]
  },
  {
    question: "The angle atd in the palm of the hand in Down syndrome represents:",
    options: [
      "*d. 81°",
      "a. 57°",
      "b. 75°",
      "c. 108°"
    ]
  },
  {
    question: "Karyotype examination is necessary if:",
    options: [
      "*b. The couple had a stillborn fetus and two spontaneous miscarriages",
      "a. The first boy in the family was born colorblind",
      "c. The woman had one spontaneous miscarriage",
      "d. The first child in the family was born with phenylketonuria"
    ]
  }
];

async function run() {
  console.log('Fetching Topic 10 ID from Supabase...');
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id, title')
    .eq('subject_id', SUBJECT_ID)
    .ilike('title', 'Topic 10')
    .limit(1);

  if (topicsError || !topics || topics.length === 0) {
    console.error('Error fetching topic:', topicsError || 'Topic 10 not found');
    return;
  }

  const topicId = topics[0].id;
  console.log(`Topic 10 ID is ${topicId}. Deleting old test questions...`);

  const { error: deleteError } = await supabase
    .from('mcqs')
    .delete()
    .eq('topic_id', topicId)
    .eq('task_type', 'test_question');

  if (deleteError) {
    console.error('Error deleting:', deleteError);
    return;
  }

  console.log('Inserting updated test questions...');
  const toInsert = newQuestions.map(q => ({
    topic_id: topicId,
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

    if (obj['t-s-1-8-9']) {
      const localQs = newQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctIndex: 0
      }));
      obj['t-s-1-8-9'].test = localQs;

      const newContent = `export const ${varName} = ${JSON.stringify(obj, null, 2)};\n`;
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated local file successfully.`);
    } else {
      console.log('Topic t-s-1-8-9 not found in local file!');
    }
  });

  console.log('All updates complete.');
}

run().catch(console.error);
