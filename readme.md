# DeepShot

DeepShot is a web app to track testosterone (TRT) injections, calculate dosage, and show upcoming injection dates on a calendar with history preserved across protocols.

## Stack
- React + TypeScript + Vite (SPA)
- Tailwind CSS + shadcn/ui (dark mode default)
- Firebase Hosting, Firebase Authentication, Cloud Firestore
- Calendar: shadcn Calendar (react-day-picker)

## Core calculations
- mg_per_injection = dose_ml * concentration_mg_per_ml
- mg_per_week = mg_per_injection * (7 / protocol_interval_days)

## Firestore schema
- users/{uid}
  - createdAt
  - updatedAt
  - settings: { timezone, defaultProtocol }
- users/{uid}/protocols/{protocolId}
  - name
  - startDate
  - endDate | null
  - intervalDays
  - concentrationMgPerMl
  - doseMl
  - isActive
  - notes
  - createdAt
  - updatedAt
- users/{uid}/injections/{injectionId}
  - protocolId
  - date (Timestamp)
  - doseMl
  - concentrationMgPerMl
  - doseMg (computed and stored)
  - notes
  - createdAt
  - updatedAt

## UI expectations
- Dashboard: next injection date + days remaining, mg per injection, mg/week, log injection CTA, active protocol, recent injections.
- Calendar: scheduled injection days highlighted, logged injections visually distinct, day-details side panel with actions to log/edit and start a new protocol.

## Local development
```bash
npm install
npm run dev
```

## Environment variables
Create a `.env.local` with:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Firebase setup
- Create a Firebase project and a Web App to obtain config values.
- Enable Google sign-in in Firebase Authentication.
- Create a Firestore database (production mode) and deploy the rules in `firestore.rules`.
- Update `.firebaserc` with your project ID.

## Deploy (Firebase Hosting)
```bash
npm run build
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

## Documentation loop
- Project rules: [projectrules.md](projectrules.md)
- Agent notes: [agent.md](agent.md)
- Active tasks: [taskslist.md](taskslist.md)
- Changelog: [changelog.md](changelog.md)
