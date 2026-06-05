const { supabaseAdmin } = require('./src/config/supabase');

async function listSubjects() {
  try {
    const { data: courses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('id, title');
      
    if (coursesError) throw coursesError;
    
    console.log('Courses in DB:');
    console.log(courses);
    
    const { data: subjects, error: subjectsError } = await supabaseAdmin
      .from('subjects')
      .select('id, course_id, title');
      
    if (subjectsError) throw subjectsError;
    
    console.log('\nSubjects in DB:');
    subjects.forEach(s => {
      const course = courses.find(c => c.id === s.course_id);
      console.log(`- ID: ${s.id} | Course: ${course ? course.title : s.course_id} | Title: "${s.title}"`);
    });
  } catch (e) {
    console.error('Error:', e);
  }
}

listSubjects();
