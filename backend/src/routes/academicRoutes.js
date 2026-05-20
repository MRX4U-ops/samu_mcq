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

const CURRICULUM_MAPPING = {
  "1": [
    "Entering to the profession", "Histology, cytology and embriology moodle 1", "Religious studies",
    "The latest history of Uzbekistan. Bioethics", "Human Anatomy -Moodul 2", "Human Anatomy -Moodul 1",
    "Information technologies in medicine", "Medical and biological physics", "Medical biology with elements of ecology Module 1",
    "Medical biology with elements of ecology Module 2", "Medical chemistry Module 1", "Medical chemistry Module 2",
    "Medical English", "Medical latin terminology", "Microbiology, Virology, Parasitology and Immunology",
    "New medical technology and medical equipments", "Pharmacology", "Physiology module 1", "Physiology module 2",
    "Russian language for the students of medical institute", "Uzbek language"
  ],
  "2": [
    "Biochemistry Module 1", "Biochemistry Module 2", "Clinic anatomy", "Clinical laboratory diagnostics",
    "First Aid", "Histology, Cytology and Embryology Module 1", "Histology, Cytology and Embryology Module 2",
    "Human Anatomy Moodul -3", "Medical genetics", "Microbiology, Virology, Parasitology and Immunology-1",
    "Microbiology, Virology, Parasitology and Immunology-2", "Molecular physiology, Pathophysiology",
    "Pathological physiology module 1", "Pathological physiology module 2", "Pathological Anatomy Moodle One",
    "Pediatrics propedeutics", "Pharmacology Moodle 1", "Pharmacology Moodle 2", "Philosophy",
    "Physiology Module 1", "Physiology Module 2", "Propedeutics of internal disease", "Psychology and pedagogy",
    "Medical Deontology. Doctor-Patient Communication"
  ],
  "3": [
    "Clinical laboratory diagnostics", "Clinical laboratory diagnostics", "Dietology. Nutritionology.",
    "Folk medicine", "General surgery", "Hematology", "Hygiene. Medical Ecology", "Internal medicine",
    "Medical genetics", "Medical radiology", "Molecular Physiology, pathophysiology Module 1",
    "Molecular Physiology, pathophysiology Module 2", "Obstetrics and gynecology Module 1",
    "Obstetrics and gynecology module 2", "Pathological physiology Module 1", "Pathological physiology Module 2",
    "Pathological Anatomy Module 1", "Pathological Anatomy Module 2", "Pediatrics", "Pharmacology Module 1",
    "Pharmacology Module 2", "Propaedeutics of childhood diseases", "Propedeutics of internal disease",
    "Rehabilitology, sport medicine", "Neuroradiology"
  ],
  "4": [
    "Children's surgery", "Clinic Pharmacology", "Clinical allergology and immunology", "Dermatovenerology",
    "Endocrinology", "Forensic medicine", "Internal medicine", "Medical psychology", "Neurology",
    "Neurosurgery", "Obstetrics and gynecology", "Occupational diseases", "Oncology", "Otorhinolaryngology",
    "Pediatrics", "Phthisiology", "Public health", "Scientific research methods and biostatistics",
    "Surgery", "Traumatology and Orthopedics", "Urology", "Dentistry", "Partially removable dentures"
  ],
  "5": [
    "Anesthesiology and resuscitation", "Clinic Pharmacology", "Clinical allergology and immunology",
    "Emergency medicine", "Epidemiology", "Infectious diseases. Children's infectious diseases",
    "Internal medicine", "Neonatolgy", "Neurology", "Neurosurgery", "Obstetrics and gynecology",
    "Occupational diseases", "Oncology", "Ophthalmology", "Otorhinolaryngology", "Phthisiology",
    "Psychiatry, Narcology", "Surgery", "Dentistry", "Fully removable prosthesis", "Periodontology",
    "Traumatology and Orthopedics", "Surgery in familial medicine", "Fundamental endoscopic surgery"
  ],
  "6": [
    "Emergency medicine", "Infectious diseases", "Therapy in family medicine",
    "Therapy in family medicine (subordinature)", "Obstetrics and gynecology",
    "Obstetrics and gynecology in familial medicine", "Obstetrics and gynecology in familial medicine (Subordinature)",
    "Pediatrics in familial medicine (Subordinature)", "Pediatrics in familial medicine- MD (11-semester)",
    "Rheumatology", "Surgery in familial medicine (Subordinature)", "Surgery in familial medicine",
    "Simulation study", "Tropical diseases"
  ]
};

// Get MCQs by Topic
router.get('/mcqs', async (req, res) => {
  const { topicId, taskType } = req.query;
  try {
    if (!topicId) {
      return res.status(400).json({ error: "topicId is required" });
    }

    let rawMcqs = [];

    const dbTaskType = (taskType === 'situational' || taskType === 'situational_task') ? 'situational_task' : 'test_question';

    if (topicId.startsWith('master-')) {
      const subjectId = topicId.replace('master-', '');
      let subjectUUID = null;

      // Check if subjectId is a valid UUID
      if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(subjectId)) {
        subjectUUID = subjectId;
      } else {
        // Resolve local ID (s-X-Y) to UUID via subject title
        const match = subjectId.match(/^s-(\d+)-(\d+)$/);
        if (match) {
          const courseNum = match[1];
          const subjectIdx = parseInt(match[2]);
          const subjectTitle = CURRICULUM_MAPPING[courseNum]?.[subjectIdx];
          
          if (subjectTitle) {
            const { data: subData, error: subError } = await supabaseAdmin
              .from('subjects')
              .select('id')
              .ilike('title', subjectTitle)
              .limit(1);
              
            if (!subError && subData && subData.length > 0) {
              subjectUUID = subData[0].id;
            }
          }
        }
      }

      if (subjectUUID) {
        // 1. Fetch all topics for this subject
        const { data: topics, error: topicsError } = await supabaseAdmin
          .from('topics')
          .select('id')
          .eq('subject_id', subjectUUID);
          
        if (topicsError) throw topicsError;
        
        if (topics && topics.length > 0) {
          const topicIds = topics.map(t => t.id);
          
          // 2. Fetch all MCQs for all these topic IDs
          const { data: mcqs, error: mcqsError } = await supabaseAdmin
            .from('mcqs')
            .select('*')
            .in('topic_id', topicIds);
            
          if (mcqsError) throw mcqsError;
          rawMcqs = mcqs || [];
        }
      }
    } else {
      // Normal topic
      const { data: mcqs, error: mcqsError } = await supabaseAdmin
        .from('mcqs')
        .select('*')
        .eq('topic_id', topicId)
        .eq('task_type', dbTaskType);
        
      if (mcqsError) throw mcqsError;
      rawMcqs = mcqs || [];
    }

    // Shuffle options logic
    const processedData = rawMcqs.map(q => {
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
