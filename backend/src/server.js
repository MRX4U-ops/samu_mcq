const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const { PORT } = require('./config/env');
const socketService = require('./services/socketService');

// Route Imports
const academicRoutes = require('./routes/academicRoutes');
const aiRoutes = require('./routes/aiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const battleRoutes = require('./routes/battleRoutes');
const userRoutes = require('./routes/userRoutes');
const supportRoutes = require('./routes/supportRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'SAMU MCQs API is running (Free Production Mode) v1.0.2',
    status: 'online',
    db: 'Supabase/Postgres',
    deployedAt: '2026-05-21T04:40:00Z'
  });
});

app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/battle', battleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/support', supportRoutes);
app.use('/api', academicRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Socket.io initialization
socketService(io);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SAMU MCQs Backend running on port ${PORT}`);
});
