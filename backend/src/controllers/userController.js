const User = require('../models/User');

exports.registerDevice = async (req, res) => {
  try {
    const { deviceId } = req.body;
    const user = await User.findById(req.user.id);

    // 1. Check if device is already registered
    const isRegistered = user.devices.some(d => d.deviceId === deviceId);
    if (isRegistered) return res.json({ message: "Device already registered" });

    // 2. Limit to 2 devices
    if (user.devices.length >= 2) {
      return res.status(403).json({ 
        error: "Device limit reached. Please logout from another device first." 
      });
    }

    // 3. Register new device
    user.devices.push({ deviceId, lastActiveAt: new Date() });
    await user.save();

    res.json({ message: "Device registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
