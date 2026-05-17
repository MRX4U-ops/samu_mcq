const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const connectDB = async () => {
  if (!MONGODB_URI) {
    mongoose.set('bufferCommands', false);
    console.log("👉 Database URI missing. Disabling buffering for Instant Demo Mode.");
    return;
  }
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    mongoose.set('bufferCommands', false);
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.log("👉 Disabling buffering to prevent timeouts in Demo Mode.");
  }
};

module.exports = connectDB;
