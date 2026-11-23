import { create } from 'zustand';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://samu-mcqs.onrender.com';
const SOCKET_URL = API_URL.replace('/api', '');

export const useBattleStore = create((set, get) => ({
  socket: null,
  roomCode: null,
  participants: [],
  status: 'idle', // idle, lobby, live, ended
  leaderboard: [],
  currentIndex: 0,
  activeQuestion: null,
  selectedOptionIndex: null,
  isAnswerLocked: false,
  timeLeft: 20,
  revealedResult: null,
  playerAnswersCount: 0,
  questionStartTime: null,
  isHost: false,
  myUserId: null,
  myUserName: null,
  error: null,

  initSocket: () => {
    const existingSocket = get().socket;
    if (existingSocket?.connected) return;
    if (existingSocket) {
      existingSocket.connect();
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      forceNew: true
    });
    
    socket.on('connect', () => {
      const { roomCode, myUserId, myUserName } = get();
      if (roomCode && myUserId) {
        socket.emit('player_join', { roomCode, userId: myUserId, name: myUserName });
      }
    });

    socket.on('connect_error', (err) => {
      set({ error: `Connection failed: ${err.message}` });
    });
    
    socket.on('room_state_update', (participants) => {
      set({ participants });
    });

    socket.on('question_active', (data) => {
      const { participants } = get();
      const resetParticipants = participants.map(p => ({ ...p, answeredCurrent: false }));
      set({
        status: 'live',
        currentIndex: data.questionIndex,
        participants: resetParticipants,
        activeQuestion: {
          question: data.question,
          options: data.options,
          totalQuestions: data.totalQuestions
        },
        timeLeft: data.timeLeft,
        selectedOptionIndex: null,
        isAnswerLocked: false,
        revealedResult: null,
        playerAnswersCount: 0,
        questionStartTime: Date.now()
      });
    });

    socket.on('timer_tick', (data) => {
      set({ timeLeft: data.timeLeft });
    });

    socket.on('player_answered', (data) => {
      const { participants } = get();
      const updated = participants.map(p => p.userId === data.userId ? { ...p, answeredCurrent: true } : p);
      set({ playerAnswersCount: data.answersCount, participants: updated });
    });

    socket.on('question_result', (data) => {
      set({
        revealedResult: {
          correctIndex: data.correctIndex,
          explanation: data.explanation
        },
        participants: data.leaderboard,
        leaderboard: data.leaderboard
      });
    });

    socket.on('game_end', (data) => {
      set({ 
        status: 'ended', 
        leaderboard: data.leaderboard,
        activeQuestion: null
      });
    });

    socket.on('error', (err) => {
      set({ error: err.message || 'An error occurred' });
    });

    set({ socket });
  },

  connectSocket: () => {
    return new Promise((resolve, reject) => {
      const socket = get().socket;
      if (socket && socket.connected) {
        resolve(socket);
        return;
      }
      if (!socket) get().initSocket();
      else if (!socket.connected) socket.connect();

      const checkSocket = get().socket;
      if (!checkSocket) return reject(new Error("Socket failed"));

      const onConnect = () => { cleanup(); resolve(checkSocket); };
      const onConnectError = (err) => { cleanup(); reject(err); };
      const timeoutId = setTimeout(() => { cleanup(); reject(new Error("Timeout")); }, 30000);

      const cleanup = () => {
        clearTimeout(timeoutId);
        checkSocket.off('connect', onConnect);
        checkSocket.off('connect_error', onConnectError);
      };

      checkSocket.on('connect', onConnect);
      checkSocket.on('connect_error', onConnectError);
    });
  },

  joinRoom: async (roomCode, userId, name) => {
    try {
      const socket = await get().connectSocket();
      set({ roomCode, status: 'lobby', error: null, isHost: false, myUserId: userId, myUserName: name });
      socket.emit('player_join', { roomCode, userId, name });
    } catch (err) {
      set({ error: err.message });
    }
  },

  createRoom: async (params, userId, name) => {
    try {
      const socket = await get().connectSocket();
      const payload = { ...params, hostUserId: userId };
      
      const response = await fetch(`${API_URL}/api/battle/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create room');
      
      const roomCode = data.roomCode;
      set({ roomCode, status: 'lobby', error: null, isHost: true, myUserId: userId, myUserName: name });
      socket.emit('player_join', { roomCode, userId, name });
      return roomCode;
    } catch (error) {
      set({ error: error.message });
      return null;
    }
  },

  setReady: (isReady) => {
    const { socket, roomCode, myUserId } = get();
    if (socket && roomCode && myUserId) socket.emit('player_ready', { roomCode, userId: myUserId, isReady });
  },

  startGame: () => {
    const { socket, roomCode, myUserId } = get();
    if (socket && roomCode && myUserId) socket.emit('start_game', { roomCode, hostUserId: myUserId });
  },

  submitAnswer: (index) => {
    const { socket, roomCode, myUserId, currentIndex, questionStartTime, isAnswerLocked } = get();
    if (isAnswerLocked) return;

    const timeTaken = Date.now() - (questionStartTime || Date.now());
    set({ selectedOptionIndex: index, isAnswerLocked: true });

    if (socket && roomCode && myUserId) {
      socket.emit('submit_answer', {
        roomCode, userId: myUserId, questionIndex: currentIndex, selectedIndex: index, timeTaken
      });
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ 
        socket: null, status: 'idle', roomCode: null, participants: [], 
        currentIndex: 0, activeQuestion: null, selectedOptionIndex: null, 
        isAnswerLocked: false, revealedResult: null, playerAnswersCount: 0, leaderboard: []
      });
    }
  }
}));
