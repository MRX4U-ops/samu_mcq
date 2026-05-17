const BattleRoom = require('../models/BattleRoom');
const BattleParticipant = require('../models/BattleParticipant');
const MCQ = require('../models/MCQ');

class BattleEngine {
  constructor() {
    this.activeRooms = new Map(); // RoomCode -> { room, timer, participants: [{userId, socketId, score, ready, answers}] }
    this.io = null;
    this.QUESTION_TIME_LIMIT = 20000; // 20 seconds
  }

  init(io) {
    this.io = io;
  }

  async getRoomState(roomCode) {
    let state = this.activeRooms.get(roomCode);
    if (!state) {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
         console.log("DB disconnected, cannot fetch room state from DB");
         return null;
      }
      
      const room = await BattleRoom.findOne({ code: roomCode }).populate('mcqSet');
      if (!room) return null;
      
      const participantsDb = await BattleParticipant.find({ roomId: room._id }).populate('userId', 'name avatar');
      
      state = {
        room: room,
        timer: null,
        participants: participantsDb.map(p => ({
          userId: p.userId._id.toString(),
          name: p.userId.name,
          avatar: p.userId.avatar,
          score: p.score,
          score: p.score,
          ready: false,
          finished: false,
          answers: p.answers.length
        })),
        startTime: null
      };
      this.activeRooms.set(roomCode, state);
    }
    return state;
  }

  async addParticipant(roomCode, userId, name, socketId) {
    const state = await this.getRoomState(roomCode);
    if (!state) return { error: 'Room not found' };
    
    if (state.participants.length >= state.room.maxPlayers) {
      return { error: 'Room is full' };
    }

    if (state.room.status !== 'lobby') {
       return { error: 'Game already started' };
    }

    const existing = state.participants.find(p => p.userId === userId);
    if (!existing) {
      let participantDb;
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        try {
          participantDb = await BattleParticipant.findOne({ roomId: state.room._id, userId });
          if (!participantDb) {
             participantDb = await BattleParticipant.create({
                roomId: state.room._id,
                userId,
                score: 0
             });
          }
        } catch (err) {
          console.log("DB participant query failed, using mock.");
        }
      }

      state.participants.push({
        userId,
        name,
        socketId,
        score: participantDb ? participantDb.score : 0,
        ready: false,
        finished: false,
        answers: participantDb ? participantDb.answers.length : 0
      });
    } else {
      existing.socketId = socketId; // Reconnect
    }

    return { success: true, state };
  }

  async setReady(roomCode, userId, isReady) {
    const state = await this.getRoomState(roomCode);
    if (!state) return;
    const p = state.participants.find(p => p.userId === userId);
    if (p) p.ready = isReady;
    return state;
  }

  async startGame(roomCode, hostUserId) {
    const state = await this.getRoomState(roomCode);
    if (!state) return { error: 'Room not found' };
    
    // In demo mode, bypass strict hostUserId checking since IDs are randomly generated on the client
    // if (state.room.hostUserId && state.room.hostUserId.toString() !== hostUserId) {
    //   return { error: 'Only host can start the game' };
    // }

    state.room.status = 'live';
    if (typeof state.room.save === 'function') {
       await state.room.save().catch(console.error);
    }

    state.startTime = Date.now();

    // Broadcast all questions to players (including correctIndex for immediate feedback)
    const questionsToSend = state.room.mcqSet.map((mcq, index) => {
      const options = [...mcq.options];
      const correctValue = options[0]; // Per user preference, 1st option is answer
      
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      
      const newCorrectIndex = options.indexOf(correctValue);
      mcq.shuffledCorrectIndex = newCorrectIndex; // Store for scoring

      return {
        questionIndex: index,
        mcqId: mcq._id,
        question: mcq.question,
        options: options,
        correctIndex: newCorrectIndex
      };
    });

    this.io.to(roomCode).emit('game_start', {
      roomCode,
      questions: questionsToSend,
      totalQuestions: state.room.mcqSet.length
    });

    return { success: true, state };
  }

  getLeaderboard(state) {
    return state.participants
       .map(p => ({ userId: p.userId, name: p.name, score: p.score }))
       .sort((a, b) => b.score - a.score);
  }

  async submitQuiz(roomCode, userId, answersMap) {
    const state = this.activeRooms.get(roomCode);
    if (!state) return { error: 'Room not found or not active' };

    const participantState = state.participants.find(p => p.userId === userId);
    if (!participantState) return { error: 'Participant not found' };

    if (participantState.finished) {
      return { error: 'Quiz already submitted' };
    }

    let score = 0;
    const timeTaken = Date.now() - state.startTime;

    // Calculate score based on answersMap
    // answersMap is an object: { [mcqId]: selectedIndex }
    for (const mcq of state.room.mcqSet) {
      const selectedIndex = answersMap[mcq._id.toString()];
      if (selectedIndex === mcq.shuffledCorrectIndex) {
        score += 10;
      }
    }

    participantState.score = score;
    participantState.finished = true;

    // Save to DB asynchronously if DB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      BattleParticipant.updateOne(
        { roomId: state.room._id, userId: userId },
        { 
          $set: { score: score, totalTimeTaken: timeTaken }
        }
      ).catch(err => console.error('Error saving score:', err));
    }

    this.io.to(roomCode).emit('player_finished', { userId });

    // Check if everyone is finished
    const allFinished = state.participants.every(p => p.finished);
    if (allFinished) {
      this.endGame(roomCode);
    }

    return { success: true, score };
  }

  async endGame(roomCode) {
    const state = this.activeRooms.get(roomCode);
    if (!state) return;

    state.room.status = 'ended';
    if (typeof state.room.save === 'function') {
       await state.room.save().catch(console.error);
    }

    const leaderboard = this.getLeaderboard(state);
    this.io.to(roomCode).emit('game_end', { leaderboard });

    this.activeRooms.delete(roomCode);
  }
}

module.exports = new BattleEngine();
