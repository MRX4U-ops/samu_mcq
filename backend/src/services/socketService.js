const battleEngine = require('./battleEngine');

const socketService = (io) => {
  battleEngine.init(io);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Using REST API for room creation, so client only joins via socket
    socket.on('player_join', async ({ roomCode, userId, name }) => {
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
    });

    socket.on('player_ready', async ({ roomCode, userId, isReady }) => {
      const state = await battleEngine.setReady(roomCode, userId, isReady);
      if (state) {
        io.to(roomCode).emit('room_state_update', state.participants);
      }
    });

    socket.on('start_game', async ({ roomCode, hostUserId }) => {
      const result = await battleEngine.startGame(roomCode, hostUserId);
      if (result.error) {
         socket.emit('error', { message: result.error });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Could implement a short timeout to remove them from room if they don't reconnect
    });
  });
};

module.exports = socketService;
