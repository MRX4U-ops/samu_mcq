# SAMU MCQs — repo guide

## Three packages

| Package | Tech | Entrypoint | Deploy |
|---------|------|------------|--------|
| `backend/` | Node.js/Express, Mongoose + Supabase/Postgres | `src/server.js` | Render |
| `mobile-app/` | React Native (Expo ~54), Zustand | `App.js` | EAS Build (APK) |
| `admin-panel/` | React (Vite), Tailwind, Zustand | `src/main.jsx` | Netlify |

## Dual database architecture

- **MongoDB** (Mongoose): legacy User, BattleRoom, BattleParticipant models in `backend/src/models/`
- **Supabase/Postgres**: courses, subjects, topics, mcqs, profiles, subscriptions, payments, support_tickets. Schema at `supabase_schema.sql` — source of truth for content.
- Backend gracefully handles missing MongoDB via "Demo Mode" (disables buffering).
- `backend/.env` is gitignored; copy template from `env.js` keys. Actual `.env` contains live secrets — do not commit.

## Auth

- **Backend**: `middleware/authMiddleware.js` verifies Supabase JWT via `supabaseAdmin.auth.getUser()`, attaches `req.user`
- **Mobile app**: uses Supabase Auth (`signInWithPassword`). Zustand store (`src/store/authStore.js`) handles session, profile, subscription sync. Backend authController handles old Firebase path for legacy users.
- **Admin panel**: Zustand store persisted to `localStorage` key `'ssmu-admin-auth'`. Sends `Authorization: Bearer <token>` + `user-id` header.

## Dev commands

```bash
# Backend
cd backend && npm run dev     # nodemon on src/server.js :5000
npm run seed                  # seeds courses/subjects/topics into MongoDB

# Mobile app
cd mobile-app && npx expo start    # Expo dev server
npx expo run:android               # local native build
npx eas build --platform android --profile preview  # APK

# Admin panel
cd admin-panel && npm run dev   # Vite dev server
npm run build && npm run preview
```

No test, lint, or typecheck scripts configured across any package.

## Routes (backend)

- **Mounted**: `academicRoutes` (`/api`), `aiRoutes` (`/api/ai`), `paymentRoutes` (`/api/payments`), `battleRoutes` (`/api/battle`), `userRoutes` (`/api/users`), `supportRoutes` (`/api/support`)
- **Not mounted**: `authRoutes.js`, `adminRoutes.js` — dead routes. Admin panel's Dashboard.jsx calls `/api/admin/dashboard` directly (hardcoded `localhost:5000`), which 404s in deployment.
- `GET /api/mcqs?topicId=<id>&taskType=test_question` — main MCQ delivery endpoint (in `academicRoutes.js`)

## MCQs delivery contract

- Content hierarchy: Course → Subject → Topic → MCQ
- `mcqs.options[0]` is **always the correct answer** in storage; server shuffles before returning and sets `correctIndex` accordingly
- "Master Topic" aggregates all MCQs within a subject: `topicId=master-{subjectId}`
- MCQs require active subscription (`check_active_subscription` PG RLS function)
- Subject local IDs: `s-{courseNum}-{index}` resolved via `CURRICULUM_MAPPING` in `academicRoutes.js`

## Mobile app quirks

- `mobile-app/.npmrc` has `legacy-peer-deps=true` (required for Expo)
- Dev backend URL auto-detected from Expo `hostUri`, falls back to `10.0.2.2:5000` (Android emulator) or `10.45.70.102:5000`
- Production API at `https://samu-mcqs.onrender.com`
- `babel.config.js` requires `react-native-reanimated/plugin`
- Android intent filter for `upi://` scheme (payment deep linking)
- Zustand stores in `src/store/`: authStore, battleStore, subscriptionStore

## Admin panel quirks

- Vite env vars: `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Config: Tailwind (PostCSS build + CDN fallback in `index.html`), no component library
- SPA with `BrowserRouter`; Netlify redirects all paths to `/index.html`
- Hardcoded `http://localhost:5000/api/admin/dashboard` in `Dashboard.jsx` — dev-only; no env-based URL

## AI service

- Priority chain: Groq (Llama 3.3 70B) → HuggingFace (Qwen) → static medical cache → fallback message
- Image analysis: OCR.space (free key `helloworld`) → Groq vision (`llama-3.2-11b-vision-preview`) → DB fuzzy matching across local data files
- Language modes: English, Hinglish, Malayalam
- `brain/` directory at root stores AI-related data in UUID-named subdirectories

## Standalone scripts

- `backend/` root has many one-off data scripts: `fix_*.js`, `update_*.js`, `build_*.js`, `format_*.js`, `test_*.js` — data migration/transformation for MCQ content
- `scratch/` and `brain/` directories contain experimental or cached data — not part of production code
