const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/samu_mcq';

async function checkMongoUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      role: String,
      status: String
    }));
    
    const users = await User.find({});
    console.log(`Found ${users.length} users in MongoDB`);
    users.forEach(u => console.log(`Email: ${u.email}, Role: ${u.role}, Status: ${u.status}`));
    
    process.exit(0);
  } catch (err) {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  }
}

checkMongoUsers();
