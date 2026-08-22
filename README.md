# AshaCare v2

Mobile-first field-work PWA for ASHA workers. The repository contains a React/Vite frontend and an Express/Mongoose backend.

## Local development

```powershell
cd backend; npm install; npm run dev
cd frontend; npm install; npm run dev
```

The backend uses `MONGO_URI` when configured. Without it, development and tests use an embedded local MongoDB instance. Seeded demo login: `asha@demo.in` / `Demo@123`.

