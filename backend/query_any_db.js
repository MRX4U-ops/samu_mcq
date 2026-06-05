const { supabaseAdmin } = require('./src/config/supabase');

async function searchAnyMCQ() {
  try {
    console.log('Searching all MCQs in database for Nocardia...');
    const { data: nocardiaMatches, error: e1 } = await supabaseAdmin
      .from('mcqs')
      .select('*')
      .ilike('question', '%nocardia%');
      
    if (e1) {
      console.error('Error matching Nocardia:', e1);
    } else {
      console.log(`Nocardia matches: ${nocardiaMatches.length}`);
      if (nocardiaMatches.length > 0) {
        console.log(JSON.stringify(nocardiaMatches, null, 2));
      }
    }

    console.log('Searching all MCQs in database for lophotrichous...');
    const { data: lophoMatches, error: e2 } = await supabaseAdmin
      .from('mcqs')
      .select('*')
      .ilike('question', '%lophotrichous%');
      
    if (e2) {
      console.error('Error matching lophotrichous:', e2);
    } else {
      console.log(`Lophotrichous matches: ${lophoMatches.length}`);
      if (lophoMatches.length > 0) {
        console.log(JSON.stringify(lophoMatches, null, 2));
      }
    }
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

searchAnyMCQ();
