const { supabaseAdmin } = require('../src/config/supabase');

async function main() {
  const id = '23ab02f2-a7f5-42a8-b6fb-34aa6a900c45';
  console.log(`Updating MCQ ID ${id} in Supabase...`);
  
  const { data, error } = await supabaseAdmin
    .from('mcqs')
    .update({
      question: "E. coli and Neisseria meningitidis isolated from blood cultures often have transport systems (for acquiring metal ions from the environment) lacking in their less-virulent relatives. Which metal is acquired by the majority of these systems?",
      options: ["Iron", "Copper", "Sodium", "Potassium"],
      correct_index: 0
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating MCQ:', error);
  } else {
    console.log('Successfully updated record:', data);
  }
}

main();
