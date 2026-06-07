const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUBJECT_ID = 'b3454f82-8aa2-49c0-b8c5-bb25bcaf9c10';

const newQuestions = [
  {
    question: "The ability of one gene to control several traits (multiple gene action) is:",
    options: [
      "* c. Pleiotropy",
      "a. Incomplete dominance",
      "b. Codominance",
      "d. Complete Domination"
    ]
  },
  {
    question: "The object of genetic research by G. Mendel was the plant:",
    options: [
      "* a. Peas",
      "b. Wheat spinous",
      "c. Potato",
      "d. Corn"
    ]
  },
  {
    question: "In what type of interaction of allelic genes do lethal genes lead to the death of individuals in the homozygous state?",
    options: [
      "* d. Overdominance",
      "a. Incomplete dominance",
      "b. Complete Domination",
      "c. Codominance"
    ]
  },
  {
    question: "With incomplete dominance:",
    options: [
      "* b. Heterozygotes are phenotypically different from homozygotes with a dominant gene",
      "a. The genotypes of heterozygotes do not differ from homozygotes with a dominant gene",
      "c. In homozygotes with a dominant gene, the trait is less pronounced than in heterozygotes",
      "d. In homozygotes with a dominant gene, the trait is expressed in the same way as in heterozygotes"
    ]
  },
  {
    question: "A hemizygous organism is an organism in which:",
    options: [
      "* a. The gene is represented not by two, but by one allele, and this allele is always phenotypically manifested, even in a recessive state",
      "b. The gene is represented by a recessive allele",
      "c. The gene is represented by dominant and recessive alleles",
      "d. The gene is represented by a dominant allele"
    ]
  },
  {
    question: "Genes that suppress other genes are called:",
    options: [
      "* b. Inhibitors",
      "a. Hypostatic",
      "c. Repressors",
      "d. Corepressors"
    ]
  }
];

async function run() {
  console.log('Fetching Topic 5 ID from Supabase...');
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id, title')
    .eq('subject_id', SUBJECT_ID)
    .ilike('title', 'Topic 5')
    .limit(1);

  if (topicsError || !topics || topics.length === 0) {
    console.error('Error fetching topic:', topicsError || 'Topic 5 not found');
    return;
  }

  const topicId = topics[0].id;
  console.log(`Topic 5 ID is ${topicId}. Deleting old situational tasks...`);

  const { error: deleteError } = await supabase
    .from('mcqs')
    .delete()
    .eq('topic_id', topicId)
    .eq('task_type', 'situational_task');

  if (deleteError) {
    console.error('Error deleting:', deleteError);
    return;
  }

  console.log('Inserting updated situational tasks...');
  const toInsert = newQuestions.map(q => ({
    topic_id: topicId,
    task_type: 'situational_task',
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

    if (obj['t-s-1-8-4']) {
      const localQs = newQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctIndex: 0
      }));
      obj['t-s-1-8-4'].situational = localQs;

      const newContent = `export const ${varName} = ${JSON.stringify(obj, null, 2)};\n`;
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated local file successfully.`);
    } else {
      console.log('Topic t-s-1-8-4 not found in local file!');
    }
  });

  console.log('All updates complete.');
}

run().catch(console.error);
