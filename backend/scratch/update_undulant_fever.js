const { supabaseAdmin } = require('../src/config/supabase');

async function run() {
  const mcqId = '1ece6137-472b-4885-a15b-01657a15ee69';
  const newQuestion = "A surgeon is struggling to diagnose a woman's flulike illness. She complains of a fever that rises during the day and peaks after dinner (undulant fever), fatigue, spinal tenderness, and loss of appetite. Her lymph nodes are enlarged in physical exam. The doctor has trouble narrowing down the possible etiologies until he hears that she tasted goat cheese at a French village a month before the onset of her symptoms. Which of the following is the most likely cause?";
  const newOptions = [
    'Pseudomonas aeruginosa',
    'Brucella species',
    'Bordetella pertussis',
    'Francisella tularensis'
  ];

  console.log('Updating MCQ in Supabase...');
  const { data, error } = await supabaseAdmin
    .from('mcqs')
    .update({
      question: newQuestion,
      options: newOptions,
      correct_index: 0
    })
    .eq('id', mcqId)
    .select();

  if (error) {
    console.error('❌ Error updating Supabase:', error);
    process.exit(1);
  }

  console.log('✅ Successfully updated MCQ in Supabase:', JSON.stringify(data, null, 2));
}

run();
