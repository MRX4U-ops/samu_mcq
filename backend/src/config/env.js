require('dotenv').config();

const GROQ_FALLBACK = Buffer.from('Z3NrX1FuZ1RVclpHa2ROOEF2bDVrNGFDV0dyeWIzRlliRmFSQ3JtR25JZ004YktKNEZMaE9ZTEs=', 'base64').toString();

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
  PORT: process.env.PORT || 5000,
};
