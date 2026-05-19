const battleEngine = require('./battleEngine');

const socketService = (io) => {
  battleEngine.init(io);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Using REST API for room creation, so client only joins via socket
    socket.on('player_join', async ({ roomCode, userId, name }) => {
      try {
        if (!roomCode || !userId) {
          socket.emit('error', { message: 'Missing roomCode or userId' });
          return;
        }
        
        const result = await battleEngine.addParticipant(roomCode, userId, name, socket.id);
        
        if (result.error) {
          socket.emit('error', { message: result.error });
        } else {
          socket.join(roomCode);
          io.to(roomCode).emit('room_state_update', result.state.participants);
        }
      } catch (err) {
        console.error('[Socket player_join Error]:', err);
        socket.emit('error', { message: 'Failed to join lobby: ' + err.message });
      }
    });

    socket.on('player_ready', async ({ roomCode, userId, isReady }) => {
      try {
        const state = await battleEngine.setReady(roomCode, userId, isReady);
        if (state) {
          io.to(roomCode).emit('room_state_update', state.participants);
        }
      } catch (err) {
        console.error('[Socket player_ready Error]:', err);
        socket.emit('error', { message: 'Failed to set ready state: ' + err.message });
      }
    });

    socket.on('start_game', async ({ roomCode, hostUserId }) => {
      try {
        const result = await battleEngine.startGame(roomCode, hostUserId);
        if (result && result.error) {
           socket.emit('error', { message: result.error });
        }
      } catch (err) {
        console.error('[Socket start_game Error]:', err);
        socket.emit('error', { message: 'Failed to start game: ' + err.message });
      }
    });

    socket.on('submit_answer', async ({ roomCode, userId, questionIndex, selectedIndex, timeTaken }) => {
      try {
        const result = await battleEngine.submitAnswer(roomCode, userId, questionIndex, selectedIndex, timeTaken);
        if (result && result.error) {
          socket.emit('error', { message: result.error });
        }
      } catch (err) {
        console.error('[Socket submit_answer Error]:', err);
        socket.emit('error', { message: 'Failed to submit answer: ' + err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Could implement a short timeout to remove them from room if they don't reconnect
    });
  });
};

module.exports = socketService;
