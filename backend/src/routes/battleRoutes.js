const express = require('express');
const router = express.Router();
const battleEngine = require('../services/battleEngine');
const MEDICAL_CHEMISTRY_MCQS = require('../data/chemistryData');
const BIOCHEMISTRY_MCQS = require('../data/biochemistryData');
const ANATOMY_MCQS = require('../data/anatomyData');
const REPO_MCQS = require('../data/mcqRepository');

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

// @route   POST /api/battle/create
// @desc    Create a new battle room
// @access  Public
router.post('/create', async (req, res) => {
  try {
    const { courseId, subjectId, topicId, taskType, maxPlayers, hostUserId } = req.body;
    
    // Validate maxPlayers
    if (maxPlayers < 2 || maxPlayers > 16) {
      return res.status(400).json({ message: 'Max players must be between 2 and 16' });
    }

    let mcqs = [];
    const supabaseTaskType = taskType === 'situational_task' ? 'situational_task' : 'test_question';

    // 1. TRY TO LOAD FROM SUPABASE POSTGRES (mirroring the exact logic from academicRoutes.js)
    try {
      const { supabaseAdmin } = require('../config/supabase');
      let rawMcqs = [];

      if (topicId && topicId.startsWith('master-')) {
        const subId = topicId.replace('master-', '');
        let subjectUUID = null;

        // Check if subjectUUID is a valid UUID
        if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(subId)) {
          subjectUUID = subId;
        } else {
          // Resolve local ID (s-X-Y) to UUID via subject title
          const match = subId.match(/^s-(\d+)-(\d+)$/);
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
          console.log(`[Battle Creator] Resolving Master Subject topics for subject: ${subjectUUID}`);
          // Fetch all topics for this subject
          const { data: topics, error: topicsError } = await supabaseAdmin
            .from('topics')
            .select('id')
            .eq('subject_id', subjectUUID);
            
          if (!topicsError && topics && topics.length > 0) {
            const topicIds = topics.map(t => t.id);
            
            // Fetch all MCQs for all these topic IDs
            const { data: mcqsData, error: mcqsError } = await supabaseAdmin
              .from('mcqs')
              .select('*')
              .in('topic_id', topicIds)
              .eq('task_type', supabaseTaskType);
              
            if (!mcqsError && mcqsData) {
              rawMcqs = mcqsData;
            }
          }
        }
      } else if (topicId) {
        // Normal topic UUID
        console.log(`[Battle Creator] Querying Supabase for topic UUID: ${topicId}`);
        const { data: mcqsData, error: mcqsError } = await supabaseAdmin
          .from('mcqs')
          .select('*')
          .eq('topic_id', topicId)
          .eq('task_type', supabaseTaskType);
          
        if (!mcqsError && mcqsData) {
          rawMcqs = mcqsData;
        }
      }

      if (rawMcqs && rawMcqs.length > 0) {
        mcqs = rawMcqs.map((q) => ({
          _id: q.id,
          question: q.question,
          options: q.options,
          correctIndex: q.correct_index,
          taskType: q.task_type,
          explanation: q.explanation || ''
        }));
        console.log(`[Battle Creator] Successfully resolved ${mcqs.length} database questions.`);
      }
    } catch (err) {
      console.log("[Battle Creator] Database resolve failed, falling back to local. Error:", err.message);
    }

    // 2. FALLBACK TO LOCAL REPOSITORY
    if (!mcqs || mcqs.length === 0) {
      console.log(`[Battle Creator] Querying local repository for topic: ${topicId}`);
      let realData = null;
      if (MEDICAL_CHEMISTRY_MCQS["s-1-10"] && MEDICAL_CHEMISTRY_MCQS["s-1-10"][topicId]) {
        realData = MEDICAL_CHEMISTRY_MCQS["s-1-10"][topicId];
      } else if (MEDICAL_CHEMISTRY_MCQS["s-1-11"] && MEDICAL_CHEMISTRY_MCQS["s-1-11"][topicId]) {
        realData = MEDICAL_CHEMISTRY_MCQS["s-1-11"][topicId];
      } else if (BIOCHEMISTRY_MCQS["s-2-0"] && BIOCHEMISTRY_MCQS["s-2-0"][topicId]) {
        realData = BIOCHEMISTRY_MCQS["s-2-0"][topicId];
      } else if (BIOCHEMISTRY_MCQS["s-2-1"] && BIOCHEMISTRY_MCQS["s-2-1"][topicId]) {
        realData = BIOCHEMISTRY_MCQS["s-2-1"][topicId];
      } else if (ANATOMY_MCQS["s-2-2"] && ANATOMY_MCQS["s-2-2"][topicId]) {
        realData = ANATOMY_MCQS["s-2-2"][topicId];
      } else {
        // Search across all subjects in the main repository
        for (const sId in REPO_MCQS) {
          if (REPO_MCQS[sId] && REPO_MCQS[sId][topicId]) {
            realData = REPO_MCQS[sId][topicId];
            break;
          }
        }
      }

      if (realData) {
        const rawType = taskType || '';
        const normalizedTaskType = (rawType === 'test_question' || rawType === 'task_question' || rawType === 'test') ? 'test' : 'situational';
        let pool = [];
        
        if (Array.isArray(realData)) {
          pool = realData;
        } else if (realData[normalizedTaskType]) {
          pool = realData[normalizedTaskType];
        } else if (realData.test) {
          pool = realData.test;
        }

        mcqs = pool.map((q, idx) => ({
          _id: q._id || q.id || `local-${topicId}-${idx}`,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex !== undefined ? q.correctIndex : 0, // First option is correct in storage contract
          taskType: normalizedTaskType,
          explanation: q.explanation || ''
        }));
        console.log(`[Battle Creator] Successfully loaded ${mcqs.length} questions from Local cache.`);
      }
    }

    // 3. ABSOLUTE FALLBACK
    if (!mcqs || mcqs.length === 0) {
      console.log(`[Battle Creator] Topic not found in local files either, returning mock question.`);
      mcqs = [
        {
          _id: 'mock-1',
          question: "What is the primary function of the Mitochondria?",
          options: ["Energy production", "Protein synthesis", "Waste disposal", "Genetic storage"],
          correctIndex: 0,
          taskType: taskType || 'test_question',
          explanation: "Mitochondria produce ATP, the energy currency of the cell."
        }
      ];
    }

    // Generate room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create room state and save in memory
    const roomObj = {
      _id: `room-${roomCode}`,
      code: roomCode,
      courseId,
      subjectId,
      topicId,
      taskType,
      maxPlayers,
      status: 'lobby',
      hostUserId: hostUserId || 'host-user-id'
    };

    battleEngine.activeRooms.set(roomCode, {
      room: roomObj,
      questions: mcqs,
      currentQuestionIndex: -1,
      timer: null,
      timeLeft: 20,
      participants: [],
      startTime: null
    });

    console.log(`[Battle Creator] Created battle room ${roomCode} with ${mcqs.length} questions.`);

    res.status(201).json({
      success: true,
      roomCode,
      roomId: roomObj._id,
      questionsCount: mcqs.length,
      sampleQuestion: mcqs[0] ? mcqs[0].question : null,
      sampleExplanation: mcqs[0] ? mcqs[0].explanation : null
    });
  } catch (error) {
    console.error('[Battle Creator] Create room error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/battle/submit
// @desc    Submit answers (kept for compatibility)
router.post('/submit', async (req, res) => {
  try {
    const { roomCode, userId, answersMap } = req.body;
    const result = await battleEngine.submitQuiz(roomCode, userId, answersMap);
    
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }
    res.json(result);
  } catch (error) {
    console.error('[Battle Creator] Submit error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
