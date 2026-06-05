const { supabaseAdmin } = require('./src/config/supabase');

async function checkMCQs() {
  try {
    // Subject ID for Microbiology-1
    const subjectId = '177b387b-0941-4281-89dc-6a18a0e4656d';
    
    console.log('Querying topics for subject:', subjectId);
    const { data: topics, error: topicsError } = await supabaseAdmin
      .from('topics')
      .select('id, title')
      .eq('subject_id', subjectId);
      
    if (topicsError) {
      console.error('Error fetching topics:', topicsError);
      return;
    }
    
    console.log(`Found ${topics.length} topics:`);
    console.log(topics);
    
    const topicIds = topics.map(t => t.id);
    
    if (topicIds.length === 0) {
      console.log('No topics found for this subject.');
      return;
    }
    
    // Check how many MCQs are in the database for these topics
    const { count, error: countError } = await supabaseAdmin
      .from('mcqs')
      .select('*', { count: 'exact', head: true })
      .in('topic_id', topicIds);
      
    if (countError) {
      console.error('Error fetching MCQ count:', countError);
      return;
    }
    
    console.log(`Total MCQs in database for these topics: ${count}`);
    
    if (count > 0) {
      console.log('Fetching sample MCQs...');
      const { data: mcqs, error: mcqsError } = await supabaseAdmin
        .from('mcqs')
        .select('*')
        .in('topic_id', topicIds)
        .limit(5);
        
      if (mcqsError) {
        console.error('Error fetching sample MCQs:', mcqsError);
        return;
      }
      console.log('Sample MCQs:');
      console.log(JSON.stringify(mcqs, null, 2));
    }
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

checkMCQs();
