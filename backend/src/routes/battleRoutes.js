const express = require('express');
const router = express.Router();
const BattleRoom = require('../models/BattleRoom');
const BattleParticipant = require('../models/BattleParticipant');
const MCQ = require('../models/MCQ');
const battleEngine = require('../services/battleEngine');
// Removed protect since frontend is mocked

// @route   POST /api/battle/create
// @desc    Create a new battle room
// @access  Public (Mocked)
router.post('/create', async (req, res) => {
  try {
    const { courseId, subjectId, topicId, taskType, maxPlayers } = req.body;
    
    // Validate maxPlayers
    if (maxPlayers < 2 || maxPlayers > 16) {
      return res.status(400).json({ message: 'Max players must be between 2 and 16' });
    }

    // Fetch MCQs matching the criteria
    const MEDICAL_CHEMISTRY_MCQS = require('../data/chemistryData');
    const BIOCHEMISTRY_MCQS = require('../data/biochemistryData');
    const ANATOMY_MCQS = require('../data/anatomyData');
    const REPO_MCQS = require('../data/mcqRepository');
    const mongoose = require('mongoose');

    // Handle both Mongoose ObjectIds and string IDs (like t-s-1-10-1)
    const topicObjectId = mongoose.Types.ObjectId.isValid(topicId) 
      ? new mongoose.Types.ObjectId(topicId) 
      : null;

    let mcqs = [];
    
    // Skip DB query if disconnected to prevent long timeout hang
    if (mongoose.connection.readyState === 1 && topicObjectId) {
      try {
        mcqs = await MCQ.aggregate([
          { $match: { 
              topicId: topicObjectId, 
              taskType 
            } 
          }
        ]);
      } catch (err) {
        console.log("Database query failed, using mock MCQs. Error:", err.message);
      }
    } else {
      console.log("Database disconnected or invalid ObjectId, skipping MCQ query and using mock data.");
    }

    let isMockData = false;

    if (!mcqs || mcqs.length === 0) {
      isMockData = true;
      // Check for real chemistry data
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
        // ULTIMATE FALLBACK: Search in the full repository
        for (const sId in REPO_MCQS) {
          if (REPO_MCQS[sId][topicId]) {
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
          pool = realData; // Flat arrays serve as the pool for both modes currently
        } else if (realData[normalizedTaskType]) {
          pool = realData[normalizedTaskType];
        }

        mcqs = pool.map((q, idx) => ({
          _id: new mongoose.Types.ObjectId(), // generate a valid objectid for battle engine
          ...q,
          taskType: normalizedTaskType
        }));
      }

      if (mcqs.length === 0) {
        // Generic fallback if still empty
        mcqs = [
          {
            _id: new mongoose.Types.ObjectId(),
            question: "What is the primary function of the Mitochondria?",
            options: ["Energy production", "Protein synthesis", "Waste disposal", "Genetic storage"],
            correctIndex: 0,
            taskType: taskType || 'test'
          }
        ];
      }
    }

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    let newRoom;
    if (mongoose.connection.readyState === 1 && !isMockData) {
      try {
        newRoom = await BattleRoom.create({
          code: roomCode,
          hostUserId: req.body.hostUserId || require('mongoose').Types.ObjectId.createFromHexString('662b92131f4a9b5f3d8a9b1c'), // Mock user
          courseId,
          subjectId,
          topicId,
          taskType,
          maxPlayers,
          mcqSet: mcqs.map(m => m._id)
        });
      } catch (err) {
        console.log("Database save failed, using mock room. Error:", err.message);
      }
    }
    
    if (!newRoom) {
      newRoom = { _id: new mongoose.Types.ObjectId(), code: roomCode };
      
      // Inject into BattleEngine so it can find the room in memory if DB is down
      battleEngine.activeRooms.set(roomCode, {
        room: { ...newRoom, mcqSet: mcqs, maxPlayers, status: 'lobby', hostUserId: req.body.hostUserId || '662b92131f4a9b5f3d8a9b1c' },
        timer: null,
        participants: [],
        startTime: null,
        lockedAnswers: new Set(),
      });
    }

    res.status(201).json({
      success: true,
      roomCode,
      roomId: newRoom._id
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/battle/submit
// @desc    Submit all answers for the quiz
// @access  Public (Mocked)
router.post('/submit', async (req, res) => {
  try {
    const { roomCode, userId, answersMap } = req.body;
    
    const result = await battleEngine.submitQuiz(
      roomCode, 
      userId || '662b92131f4a9b5f3d8a9b1c', 
      answersMap || {}
    );

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
