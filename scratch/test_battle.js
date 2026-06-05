const battleEngine = require('../backend/src/services/battleEngine');

// Mock socket.io server
const mockIo = {
  to: (roomCode) => ({
    emit: (event, data) => {
      console.log(`[Mock IO] Event "${event}" emitted to room "${roomCode}":`, JSON.stringify(data, null, 2));
    }
  })
};

battleEngine.init(mockIo);

// Initialize a room state
const roomCode = 'TEST12';
const mockMcqs = [
  {
    _id: 'q1',
    question: 'What is 1+1?',
    options: ['2', '3', '4', '5'],
    correctIndex: 0,
    taskType: 'test_question',
    explanation: 'Basic math.'
  },
  {
    _id: 'q2',
    question: 'What is 2+2?',
    options: ['4', '5', '6', '7'],
    correctIndex: 0,
    taskType: 'test_question',
    explanation: 'Basic math.'
  }
];

const roomObj = {
  _id: 'room-TEST12',
  code: roomCode,
  courseId: 'c1',
  subjectId: 's1',
  topicId: 't1',
  taskType: 'test_question',
  maxPlayers: 4,
  status: 'lobby',
  hostUserId: 'user-host'
};

battleEngine.activeRooms.set(roomCode, {
  room: roomObj,
  questions: mockMcqs,
  currentQuestionIndex: -1,
  timer: null,
  timeLeft: 20,
  participants: [],
  startTime: null
});

console.log('--- Test 1: Add participants ---');
battleEngine.addParticipant(roomCode, 'user-host', 'HostName', 'socket-host').then((res) => {
  console.log('Add Host result:', res.success ? 'Success' : res.error);
  battleEngine.addParticipant(roomCode, 'user-guest', 'GuestName', 'socket-guest').then((res2) => {
    console.log('Add Guest result:', res2.success ? 'Success' : res2.error);
    
    console.log('\n--- Test 2: Start Game ---');
    battleEngine.startGame(roomCode, 'user-host').then((startRes) => {
      console.log('Start Game result:', startRes.success ? 'Success' : startRes.error);
      console.log('Questions details:', startRes.state.questions.map(q => ({
        q: q.question,
        options: q.shuffledOptions,
        correctIndex: q.shuffledCorrectIndex
      })));
      
      // Clean up timer
      const state = battleEngine.getRoomState(roomCode);
      if (state && state.timer) {
        clearInterval(state.timer);
        console.log('Cleared active timer.');
      }
    });
  });
});
