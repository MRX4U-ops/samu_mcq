const User = require('../models/User');

// Track Daily Streak
exports.updateStreak = async (req, res) => {
  const user = await User.findById(req.user.id);
  const now = new Date();
  const lastActive = new Date(user.stats.lastActive);

  // Simple day difference check
  const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    user.stats.streak += 1;
  } else if (diffDays > 1) {
    user.stats.streak = 1;
  }
  
  user.stats.lastActive = now;
  await user.save();
  res.json({ streak: user.stats.streak });
};

// Global Leaderboard
exports.getLeaderboard = async (req, res) => {
  const topPlayers = await User.find()
    .sort({ 'stats.points': -1 })
    .limit(10)
    .select('name stats.points stats.streak');
  res.json(topPlayers);
};

// Analytics & Accuracy
exports.getPerformance = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    accuracy: user.stats.accuracy,
    solved: user.stats.totalSolved,
    points: user.stats.points,
    badges: user.stats.badges
  });
};
