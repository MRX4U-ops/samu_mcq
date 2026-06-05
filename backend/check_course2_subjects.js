const { supabaseAdmin } = require('./src/config/supabase');

async function listSubjects() {
  try {
    const { data: courses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('id, title');
      
    if (coursesError) throw coursesError;
    
    const course2 = courses.find(c => c.title.toLowerCase().includes('2'));
    console.log('Course 2 metadata:', course2);
    
    if (course2) {
      const { data: subjects, error: subjectsError } = await supabaseAdmin
        .from('subjects')
        .select('id, title')
        .eq('course_id', course2.id);
        
      if (subjectsError) throw subjectsError;
      
      console.log('\nSubjects in Course 2:');
      subjects.forEach(s => {
        console.log(`- ID: ${s.id} | Title: "${s.title}"`);
      });
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

listSubjects();
