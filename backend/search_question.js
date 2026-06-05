const { supabaseAdmin } = require('./src/config/supabase');

async function search(query) {
  try {
    console.log(`Searching database for: "%${query}%"...`);
    const { data, error } = await supabaseAdmin
      .from('mcqs')
      .select('id, question, options, correct_index, explanation, topic_id')
      .ilike('question', `%${query}%`);
    
    if (error) {
      console.error('Error fetching MCQs:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No matches found using exact ilike. Trying word-by-word...');
      // Try fetching a few words
      const words = query.split(/\s+/).filter(w => w.length > 3);
      if (words.length > 0) {
        let chain = supabaseAdmin.from('mcqs').select('id, question, options, correct_index, explanation, topic_id');
        for (const word of words) {
          chain = chain.ilike('question', `%${word}%`);
        }
        const { data: partData, error: partError } = await chain;
        if (partError) {
          console.error('Error in word search:', partError);
          return;
        }
        if (partData && partData.length > 0) {
          printMatches(partData);
          return;
        }
      }
      console.log('No matches found at all.');
    } else {
      printMatches(data);
    }
  } catch (e) {
    console.error('Execution error:', e);
  }
}

function printMatches(matches) {
  console.log(`\nFound ${matches.length} matching question(s):`);
  matches.forEach((m, idx) => {
    console.log(`\n--- Match #${idx + 1} ---`);
    console.log(`ID: ${m.id}`);
    console.log(`Question: ${m.question}`);
    console.log('Options:');
    m.options.forEach((opt, oIdx) => {
      const prefix = oIdx === m.correct_index ? '=> ' : '   ';
      console.log(`${prefix}${String.fromCharCode(97 + oIdx)}. ${opt}`);
    });
    console.log(`Correct Answer: ${m.options[m.correct_index]}`);
    console.log(`Explanation: ${m.explanation || 'None'}`);
  });
}

// Get query from command line
const queryArg = process.argv.slice(2).join(' ');
if (!queryArg) {
  console.log('Usage: node search_question.js "your question text here"');
  process.exit(1);
}

search(queryArg);
