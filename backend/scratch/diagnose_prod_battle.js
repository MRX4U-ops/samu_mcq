const axios = require('axios');
const io = require('socket.io-client');

async function diagnose() {
  const PROD_URL = 'https://samu-mcqs.onrender.com';
  console.log(`🔍 DIAGNOSING PRODUCTION QUIZ BATTLE AT: ${PROD_URL}\n`);

  // 1. Health check
  try {
    console.log("1. Sending GET / to check server status...");
    const health = await axios.get(PROD_URL);
    console.log("✅ Server response:", health.data);
  } catch (err) {
    console.error("❌ GET / failed:", err.message);
    return;
  }

  // 2. Create room
  let roomCode = null;
  try {
    console.log("\n2. Sending POST /api/battle/create...");
    const res = await axios.post(`${PROD_URL}/api/battle/create`, {
      courseId: 'c-2',
      subjectId: '177b387b-0941-4281-89dc-6a18a0e4656d',
      topicId: 'ee2dd985-93a2-4032-9afe-4cb8329f33d5',
      taskType: 'task_question',
      maxPlayers: 8,
      hostUserId: 'test-user-diag'
    });
    console.log("✅ Create room response:", res.data);
    roomCode = res.data.roomCode;
  } catch (err) {
    console.error("❌ POST /api/battle/create failed:", err.response ? err.response.data : err.message);
    return;
  }

  // 3. Connect Socket.IO
  console.log(`\n3. Connecting Socket.IO to: ${PROD_URL}`);
  const socket = io(PROD_URL, {
    transports: ['websocket', 'polling'],
    forceNew: true
  });

  socket.on('connect', () => {
    console.log("✅ Socket connected successfully!");
    console.log(`🗣️ Emitting player_join for room ${roomCode}...`);
    socket.emit('player_join', { roomCode, userId: 'test-user-diag', name: 'Diagnoser' });
  });

  socket.on('connect_error', (err) => {
    console.error("❌ Socket connection error:", err.message);
    process.exit(1);
  });

  socket.on('room_state_update', (participants) => {
    console.log("✅ Received room_state_update:", participants);
    console.log("\n🎉 DIAGNOSTIC COMPLETED: Connection and room join worked successfully!");
    socket.disconnect();
    process.exit(0);
  });

  socket.on('error', (err) => {
    console.error("❌ Received socket error event:", err);
    socket.disconnect();
    process.exit(1);
  });

  // Timeout after 10 seconds
  setTimeout(() => {
    console.error("❌ Timeout: Did not receive room_state_update in 10 seconds.");
    socket.disconnect();
    process.exit(1);
  }, 10000);
}

diagnose();
