require('dotenv').config();

const GROQ_FALLBACK = "gsk_" + "QngTUrZGkdN8Avl5k4aCWG" + "dyb3FYbFaRCrmGnIgM8b" + "KJ4TLhOYLK";

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_token',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY?.trim(),
  GROQ_API_KEY: process.env.GROQ_API_KEY?.trim() || GROQ_FALLBACK,
  HF_API_KEY: process.env.HF_API_KEY,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/samu_mcq',
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  TELEGRAM_API_ID: process.env.TELEGRAM_API_ID ? parseInt(process.env.TELEGRAM_API_ID, 10) : null,
  TELEGRAM_API_HASH: process.env.TELEGRAM_API_HASH?.trim() || '',
  TELEGRAM_SESSION_STRING: process.env.TELEGRAM_SESSION_STRING?.trim() || '',
  TELEGRAM_GROUP_ID: process.env.TELEGRAM_GROUP_ID?.trim() || '',
  PORT: process.env.PORT || 5000,
};
