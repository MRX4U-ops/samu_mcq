const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// Get All Courses
router.get('/courses', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('id, title, subjects(count)');
    
    if (error) throw error;

    const formattedData = data.map(c => ({
      _id: c.id,
      title: c.title,
      subjectCount: c.subjects[0].count
    }));

    res.json(formattedData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get Subjects by Course
router.get('/courses/:id/subjects', async (req, res) => {
  const courseId = req.params.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('subjects')
      .select('*')
      .eq('course_id', courseId);
    
    if (error) throw error;

    const formattedData = data.map(s => ({
      _id: s.id,
      title: s.title,
      courseId: s.course_id
    }));

    res.json(formattedData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get Topics by Subject
router.get('/subjects/:id/topics', async (req, res) => {
  const subjectId = req.params.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId);
    
    if (error) throw error;

    const formattedData = data.map(t => ({
      _id: t.id,
      title: t.title,
      subjectId: t.subject_id
    }));

    // Add Master Topic
    formattedData.push({
      _id: `master-${subjectId}`,
      title: "Master Topic",
      subjectId: subjectId,
      isMaster: true
    });

    res.json(formattedData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get MCQs by Topic
router.get('/mcqs', async (req, res) => {
  const { topicId, taskType } = req.query;
  try {
    const { data, error } = await supabaseAdmin
      .from('mcqs')
      .select('*')
      .eq('topic_id', topicId)
      .eq('task_type', taskType || 'test_question');
    
    if (error) throw error;

    // Shuffle options logic
    const processedData = data.map(q => {
      const options = [...q.options];
      const correctValue = options[0]; // Per user preference, 1st option is answer
      
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return {
        _id: q.id,
        ...q,
        options,
        correctIndex: options.indexOf(correctValue),
        taskType: q.task_type
      };
    });

    res.json(processedData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
