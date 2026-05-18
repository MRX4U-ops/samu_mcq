import { create } from 'zustand';
import io from 'socket.io-client';
import axios from 'axios';
import { API_URL } from '../config/Constants';

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
    if (!get().socket) {
      console.log('[Battle Store] Initializing Socket.IO connection at:', SOCKET_URL);
      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        forceNew: true
      });
      
      socket.on('connect', () => {
        console.log('[Battle Store] Socket connected successfully!');
      });
      
      socket.on('room_state_update', (participants) => {
        console.log('[Battle Store] Received room state update:', participants);
        set({ participants });
      });

      socket.on('question_active', (data) => {
        console.log('[Battle Store] Question active:', data);
        set({
          status: 'live',
          currentIndex: data.questionIndex,
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
        console.log('[Battle Store] Player answered update:', data);
        set({ playerAnswersCount: data.answersCount });
      });

      socket.on('question_result', (data) => {
        console.log('[Battle Store] Received question result reveal:', data);
        set({
          revealedResult: {
            correctIndex: data.correctIndex,
            explanation: data.explanation
          },
          participants: data.leaderboard, // updates live scorecard
          leaderboard: data.leaderboard
        });
      });

      socket.on('game_end', (data) => {
        console.log('[Battle Store] Battle ended. Final leaderboard:', data.leaderboard);
        set({ 
          status: 'ended', 
          leaderboard: data.leaderboard,
          activeQuestion: null
        });
      });

      socket.on('error', (err) => {
        console.error('[Battle Store] Received socket error:', err);
        set({ error: err.message || 'An error occurred' });
      });

      set({ socket });
    }
  },

  joinRoom: (roomCode, userId, name) => {
    const { socket } = get();
    if (socket) {
      console.log('[Battle Store] Emitting player_join for code:', roomCode);
      set({ 
        roomCode, 
        status: 'lobby', 
        error: null, 
        isHost: false, 
        myUserId: userId,
        myUserName: name
      });
      socket.emit('player_join', { roomCode, userId, name });
    }
  },

  createRoom: async (params, userId, name) => {
    try {
      console.log('[Battle Store] Sending request to create battle room:', params);
      const payload = { ...params, hostUserId: userId };
      const response = await axios.post(`${API_URL}/battle/create`, payload);
      const roomCode = response.data.roomCode;
      
      const { socket } = get();
      if (socket) {
        set({ 
          roomCode, 
          status: 'lobby', 
          error: null, 
          isHost: true, 
          myUserId: userId,
          myUserName: name
        });
        console.log('[Battle Store] Room created. Emitting player_join for host:', roomCode);
        socket.emit('player_join', { roomCode, userId, name });
      }
      return roomCode;
    } catch (error) {
      console.error('[Battle Store] Failed to create room:', error);
      set({ error: error.response?.data?.message || 'Failed to create room' });
      return null;
    }
  },

  setReady: (isReady) => {
    const { socket, roomCode, myUserId } = get();
    if (socket && roomCode && myUserId) {
      console.log('[Battle Store] Emitting player_ready:', isReady);
      socket.emit('player_ready', { roomCode, userId: myUserId, isReady });
    }
  },

  startGame: () => {
    const { socket, roomCode, myUserId } = get();
    if (socket && roomCode && myUserId) {
      console.log('[Battle Store] Emitting start_game from host:', myUserId);
      socket.emit('start_game', { roomCode, hostUserId: myUserId });
    }
  },

  submitAnswer: (index) => {
    const { socket, roomCode, myUserId, currentIndex, questionStartTime, isAnswerLocked } = get();
    if (isAnswerLocked) return;

    const timeTaken = Date.now() - (questionStartTime || Date.now());
    console.log(`[Battle Store] Submitting option ${index} at ${timeTaken}ms`);

    set({ 
      selectedOptionIndex: index,
      isAnswerLocked: true
    });

    if (socket && roomCode && myUserId) {
      socket.emit('submit_answer', {
        roomCode,
        userId: myUserId,
        questionIndex: currentIndex,
        selectedIndex: index,
        timeTaken
      });
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      console.log('[Battle Store] Disconnecting socket...');
      socket.disconnect();
      set({ 
        socket: null, 
        status: 'idle', 
        roomCode: null, 
        participants: [], 
        currentIndex: 0,
        activeQuestion: null,
        selectedOptionIndex: null,
        isAnswerLocked: false,
        revealedResult: null,
        playerAnswersCount: 0,
        leaderboard: []
      });
    }
  }
}));
