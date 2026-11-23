# SAMU MCQs Project

A production-grade educational platform for university students.

## Project Structure
- `/backend`: Node.js + Express API with MongoDB & Socket.IO.
- `/mobile-app`: React Native (Expo) Android application.
- `/admin-panel`: React (Vite) Web application for management.

## Setup Instructions

### 1. Backend
1. Navigate to `/backend`.
2. Create a `.env` file based on `src/config/env.js`.
3. Install dependencies: `npm install`.
4. Seed initial data: `npm run seed`.
5. Start server: `npm run dev`.

### 2. Mobile App
1. Navigate to `/mobile-app`.
2. Install dependencies: `npm install`.
3. Start Expo: `npx expo start`.
4. Open on Android Emulator or physical device using Expo Go.

### 3. Admin Panel
1. Navigate to `/admin-panel`.
2. Install dependencies: `npm install`.
3. Start development server: `npm run dev`.

## Key Features
- **MCQ Solving**: Offline-first practice with instant feedback and explanations.
- **Multiplayer Battle**: Real-time quiz rooms using WebSockets.
- **Manual UPI Payments**: Subscription flow with direct UPI and admin verification.
- **Clean UI**: Modern, card-based interface inspired by student dashboards.
- **Scalable Content**: Structured hierarchy (Course -> Subject -> Topic -> Tasks).

## Environment Variables Needed
- `MONGODB_URI`: Connection string for MongoDB.
- `JWT_SECRET`: Secure string for token generation.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: For Firebase Auth verification.
