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
    const existingSocket = get().socket;
    if (existingSocket && existingSocket.connected) {
      console.log('[Battle Store] Socket already connected.');
      return;
    }

    if (existingSocket) {
      console.log('[Battle Store] Socket exists but is disconnected. Reconnecting...');
      existingSocket.connect();
      return;
    }

    console.log('[Battle Store] Initializing Socket.IO connection at:', SOCKET_URL);
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'], // Use polling first for maximum reliability across cold starts and proxies
      forceNew: true
    });
    
    socket.on('connect', () => {
      console.log('[Battle Store] Socket connected successfully!');
      // If we were already in a room, re-join it!
      const { roomCode, myUserId, myUserName } = get();
      if (roomCode && myUserId) {
        console.log('[Battle Store] Re-joining room after connection/reconnection:', roomCode);
        socket.emit('player_join', { roomCode, userId: myUserId, name: myUserName });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('[Battle Store] Socket connection error:', err);
      set({ error: `Connection failed: ${err.message}` });
    });

    socket.on('disconnect', (reason) => {
      console.log('[Battle Store] Socket disconnected:', reason);
    });
    
    socket.on('room_state_update', (participants) => {
      console.log('[Battle Store] Received room state update:', participants);
      set({ participants });
    });

    socket.on('question_active', (data) => {
      console.log('[Battle Store] Question active:', data);
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
      console.log('[Battle Store] Player answered update:', data);
      const { participants } = get();
      const updated = participants.map(p => {
        if (p.userId === data.userId) {
          return { ...p, answeredCurrent: true };
        }
        return p;
      });
      set({ 
        playerAnswersCount: data.answersCount,
        participants: updated
      });
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
  },

  connectSocket: () => {
    return new Promise((resolve, reject) => {
      const socket = get().socket;
      if (socket && socket.connected) {
        resolve(socket);
        return;
      }

      // Initialize socket if it doesn't exist
      if (!socket) {
        get().initSocket();
      } else if (!socket.connected) {
        socket.connect();
      }

      const checkSocket = get().socket;
      if (!checkSocket) {
        reject(new Error("Socket failed to initialize"));
        return;
      }

      const onConnect = () => {
        cleanup();
        resolve(checkSocket);
      };

      const onConnectError = (err) => {
        cleanup();
        reject(new Error(`Socket connection failed: ${err.message}`));
      };

      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error("Socket connection timeout (30s)"));
      }, 30000); // 30 seconds for cold start tolerance

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
      console.log('[Battle Store] Ensuring socket is connected for joinRoom...');
      const socket = await get().connectSocket();
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
    } catch (err) {
      console.error('[Battle Store] joinRoom failed:', err);
      set({ error: err.message || 'Failed to connect to battle server' });
    }
  },

  createRoom: async (params, userId, name) => {
    try {
      console.log('[Battle Store] Ensuring socket is connected before room creation...');
      const socket = await get().connectSocket();
      
      console.log('[Battle Store] Sending request to create battle room:', params);
      const payload = { ...params, hostUserId: userId };
      const response = await axios.post(`${API_URL}/battle/create`, payload);
      const roomCode = response.data.roomCode;
      
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
      return roomCode;
    } catch (error) {
      console.error('[Battle Store] Failed to create room:', error);
      set({ error: error.response?.data?.message || error.message || 'Failed to create room' });
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
