const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');

exports.verifyFirebase = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // 1. Verify with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decodedToken;

    // 2. ADMIN IDENTIFICATION LOGIC (MANDATORY)
    let role = "user";
    if (email.toUpperCase() === "MOHD6396889713@GMAIL.COM") {
      role = "admin";
    }

    // 3. Find or Create User
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: name || "Sameer Ahmad",
        email: email.toLowerCase(),
        firebase_uid: uid,
        role: role
      });
    } else if (role === "admin" && user.role !== "admin") {
      // Force update to admin if the rule matches
      user.role = "admin";
      await user.save();
    }

    // 4. Handle Device Limit (Max 2)
    // (Existing device logic would go here)

    // 5. Generate Secure JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(401).json({ message: "Firebase Auth Failed", error: error.message });
  }
};
