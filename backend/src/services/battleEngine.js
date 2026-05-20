class BattleEngine {
  constructor() {
    this.activeRooms = new Map(); // RoomCode -> { room, questions, currentQuestionIndex, timer, timeLeft, answersCount, participants: [{userId, name, socketId, score, ready, answers}] }
    this.io = null;
  }

  init(io) {
    this.io = io;
  }

  getRoomState(roomCode) {
    return this.activeRooms.get(roomCode);
  }

  async addParticipant(roomCode, userId, name, socketId) {
    const state = this.getRoomState(roomCode);
    if (!state) return { error: 'Room not found' };
    
    const existing = state.participants.find(p => p.userId === userId);
    if (existing) {
      existing.socketId = socketId; // Reconnect socket mapping
      return { success: true, state };
    }

    if (state.room.status !== 'lobby') {
       return { error: 'Game already started' };
    }

    if (state.participants.length >= state.room.maxPlayers) {
      return { error: 'Room is full' };
    }

    state.participants.push({
      userId,
      name,
      socketId,
      score: 0,
      ready: false,
      finished: false,
      answers: {} // index -> selectedIndex
    });

    return { success: true, state };
  }

  async setReady(roomCode, userId, isReady) {
    const state = this.getRoomState(roomCode);
    if (!state) return null;
    const p = state.participants.find(p => p.userId === userId);
    if (p) p.ready = isReady;
    return state;
  }

  async startGame(roomCode, hostUserId) {
    const state = this.getRoomState(roomCode);
    if (!state) return { error: 'Room not found' };

    state.room.status = 'live';
    state.startTime = Date.now();

    // Shuffle options once on start so that ALL players get identical shuffled option indices
    state.questions.forEach((q) => {
      const options = [...q.options];
      const correctVal = options[q.correctIndex || 0];

      // Fisher-Yates Shuffle
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      q.shuffledOptions = options;
      q.shuffledCorrectIndex = options.indexOf(correctVal);
    });

    // Start with the first question
    this.startQuestion(roomCode, 0);

    return { success: true, state };
  }

  startQuestion(roomCode, questionIndex) {
    const state = this.getRoomState(roomCode);
    if (!state) return;

    if (state.timer) {
      clearInterval(state.timer);
    }

    state.currentQuestionIndex = questionIndex;
    state.timeLeft = 20; // 20s per question
    state.answersCount = 0;

    const q = state.questions[questionIndex];

    console.log(`[Battle ${roomCode}] Activating Question ${questionIndex + 1}/${state.questions.length}`);

    // Broadcast active question to all sockets in the room (EXCLUDING correct index for anti-cheat)
    this.io.to(roomCode).emit('question_active', {
      questionIndex,
      totalQuestions: state.questions.length,
      question: q.question,
      options: q.shuffledOptions,
      timeLeft: 20
    });

    // Start shared timer interval
    state.timer = setInterval(() => {
      state.timeLeft -= 1;
      this.io.to(roomCode).emit('timer_tick', { timeLeft: state.timeLeft });

      if (state.timeLeft <= 0) {
        clearInterval(state.timer);
        this.revealAnswer(roomCode);
      }
    }, 1000);
  }

  submitAnswer(roomCode, userId, questionIndex, selectedIndex, timeTaken) {
    const state = this.getRoomState(roomCode);
    if (!state) return { error: 'Room not found' };

    if (state.room.status !== 'live') {
      return { error: 'Battle is not active' };
    }

    if (questionIndex !== state.currentQuestionIndex) {
      return { error: 'Question is no longer active' };
    }

    const p = state.participants.find(part => part.userId === userId);
    if (!p) return { error: 'Player not found in room' };

    if (p.answers[questionIndex] !== undefined) {
      return { error: 'Answer already submitted for this question' };
    }

    // Anti-Cheat: Reject abnormal click speed (< 500ms)
    if (timeTaken < 500) {
      console.log(`[Battle Anti-Cheat] Suspiciously fast submission from ${userId}: ${timeTaken}ms. Ignoring score credit.`);
    }

    // Record submission
    p.answers[questionIndex] = selectedIndex;
    state.answersCount += 1;

    const q = state.questions[questionIndex];
    const isCorrect = (selectedIndex === q.shuffledCorrectIndex);

    // Compute live scoring
    if (isCorrect && timeTaken >= 500) {
      let points = 10; // Base points
      // Speed bonus: +5 points for answering correctly under 5 seconds
      if (timeTaken <= 5000) {
        points += 5;
      }
      p.score += points;
    }

    // Broadcast real-time answered count update
    this.io.to(roomCode).emit('player_answered', {
      userId,
      answersCount: state.answersCount,
      totalPlayers: state.participants.length
    });

    // If everyone in the room has locked their answers, skip countdown wait
    const allAnswered = state.participants.every(part => part.answers[questionIndex] !== undefined);
    if (allAnswered) {
      console.log(`[Battle ${roomCode}] All players answered. Advancing to answer reveal immediately.`);
      clearInterval(state.timer);
      this.revealAnswer(roomCode);
    }

    return { success: true };
  }

  revealAnswer(roomCode) {
    const state = this.getRoomState(roomCode);
    if (!state) return;

    if (state.timer) {
      clearInterval(state.timer);
    }

    const qIndex = state.currentQuestionIndex;
    const q = state.questions[qIndex];
    const leaderboard = this.getLeaderboard(state);

    console.log(`[Battle ${roomCode}] Revealing Answer for question index ${qIndex}`);

    // Broadcast correct choice, explanation, and updated standings
    this.io.to(roomCode).emit('question_result', {
      questionIndex: qIndex,
      correctIndex: q.shuffledCorrectIndex,
      explanation: q.explanation || '',
      leaderboard
    });

    // 5-second review countdown before loading next question
    setTimeout(() => {
      const nextIndex = qIndex + 1;
      if (nextIndex < state.questions.length) {
        this.startQuestion(roomCode, nextIndex);
      } else {
        this.endGame(roomCode);
      }
    }, 5000);
  }

  getLeaderboard(state) {
    return state.participants
       .map(p => ({ 
         userId: p.userId, 
         name: p.name, 
         score: p.score, 
         answersCount: Object.keys(p.answers).length 
       }))
       .sort((a, b) => b.score - a.score);
  }

  async endGame(roomCode) {
    const state = this.getRoomState(roomCode);
    if (!state) return;

    if (state.timer) {
      clearInterval(state.timer);
    }

    state.room.status = 'ended';
    const leaderboard = this.getLeaderboard(state);

    console.log(`[Battle ${roomCode}] Battle Arena Match Ended! Leaderboard compiled.`);

    // Persist final standings and results to Supabase Postgres (rls enabled)
    try {
      const { supabaseAdmin } = require('../config/supabase');
      
      const { data: dbRoom, error: roomErr } = await supabaseAdmin
        .from('battle_rooms')
        .insert({
          code: roomCode,
          host_user_id: state.room.hostUserId.includes('-') ? state.room.hostUserId : '662b9213-1f4a-9b5f-3d8a-9b1c662b9213', // UUID conversion safeguard
          course_id: state.room.courseId,
          subject_id: state.room.subjectId,
          topic_id: state.room.topicId,
          task_type: state.room.taskType === 'situational_task' ? 'situational_task' : 'test_question',
          status: 'ended'
        })
        .select()
        .single();

      if (roomErr) throw roomErr;

      if (dbRoom) {
        for (let i = 0; i < leaderboard.length; i++) {
          const p = state.participants.find(part => part.userId === leaderboard[i].userId);
          const totalQ = state.questions.length;
          let correctCount = 0;
          
          state.questions.forEach((q, qIndex) => {
            if (p.answers[qIndex] === q.shuffledCorrectIndex) {
              correctCount++;
            }
          });

          const accuracy = totalQ > 0 ? (correctCount / totalQ) * 100 : 0;
          const userUUID = p.userId.includes('-') ? p.userId : '662b9213-1f4a-9b5f-3d8a-9b1c662b9213';

          // Insert player
          await supabaseAdmin
            .from('battle_players')
            .insert({
              room_id: dbRoom.id,
              user_id: userUUID,
              score: p.score,
              answers: p.answers,
              is_ready: p.ready,
              finished: true
            });

          // Insert result
          await supabaseAdmin
            .from('battle_results')
            .insert({
              room_id: dbRoom.id,
              user_id: userUUID,
              rank: i + 1,
              correct_answers: correctCount,
              wrong_answers: totalQ - correctCount,
              accuracy,
              points: p.score
            });
        }
        console.log(`[Battle ${roomCode}] Successfully saved battle rooms, players, and results in Supabase.`);
      }
    } catch (err) {
      console.log(`[Battle DB Warning] Graceful Skip: Postgres table writes bypassed. Error: ${err.message}`);
    }

    // Broadcast final game end stand
    this.io.to(roomCode).emit('game_end', { leaderboard });

    // Release memory resources
    this.activeRooms.delete(roomCode);
  }

  // Submitted compatibility placeholder
  async submitQuiz(roomCode, userId, answersMap) {
    return { success: true, score: 0 };
  }
}

module.exports = new BattleEngine();
