[README.md](https://github.com/user-attachments/files/31645933/README.md)
# Check-In

A private, mobile-first mental wellness app for daily mood check-ins, guided micro-sessions, and AI-supported journaling — built with a crisis-safety layer that always stays free.

**Check-In is not a substitute for professional mental health care.** If you or someone you know is in crisis, contact your local emergency services or a crisis line (in the US: call or text **988**, or text **HOME** to **741741**).

---

## What it does

- **Daily check-in** — log your mood in under 30 seconds, with an optional note.
- **Guided micro-sessions** — short, structured exercises for anxiety, sleep, anger, overwhelm, tension, and loneliness.
- **Private journaling ("Vent")** — write freely and receive a short, warm, AI-generated reflection. No advice, no diagnosis.
- **Mood trends** — see your patterns over time.
- **Crisis safety layer** — every piece of free text is checked for risk language *before* anything else happens. If flagged, the AI call is skipped entirely and crisis resources are shown immediately. This layer is never gated behind a subscription.
- **Data ownership** — full account data export and permanent account deletion, built in from the start.

## Tech stack

- **Frontend:** React 19 + Vite + TypeScript, Tailwind CSS, Recharts for trend charts
- **Backend:** Express server (`server.ts`) serving the API and the Vite app
- **AI:** Google Gemini (`@google/genai`), called **server-side only** — the API key never reaches the client
- **Data:** in-memory store in this scaffold (see [Roadmap](#roadmap) for persistence plans)

## Project structure

```
src/
  components/     UI for each screen (check-in, sessions, vent, trends, settings, modals)
  data/           Static content: mood scale, session library, crisis resources
  utils/          Client-side storage helpers
  App.tsx         Root app shell and routing between tabs
server.ts         Express API: check-ins, journal, safety checks, subscriptions, GDPR export/delete
```

## Getting started

**Requirements:** Node.js 18+, a Gemini API key ([get one here](https://aistudio.google.com/apikey))

```bash
git clone https://github.com/brysonlab/Checkin-app.git
cd Checkin-app
npm install
cp .env.example .env
# add your GEMINI_API_KEY to .env
npm run dev
```

The app runs at `http://localhost:3000`.

## Safety design

The crisis-check step in `server.ts` runs on every journal and check-in note **before** any AI call is made. If risk language is detected, the reflection request is skipped and crisis resources are returned instead — this path never depends on the AI provider being available or working correctly.

> **Note:** the current keyword-based detection is a starting point, not a production-grade safety system. Before this app is used by real people, this layer needs review by someone with relevant clinical or crisis-response experience — see [Roadmap](#roadmap).

## Roadmap

- [ ] Move check-ins/journal/user data from in-memory storage to a persistent database
- [ ] Real authentication (currently uses a single mock `default-user`)
- [ ] Clinical review of the crisis-detection logic
- [ ] Real payment integration (RevenueCat/Stripe) — subscription endpoints currently simulate upgrade/cancel
- [ ] Audio-narrated sessions
- [ ] Legal review of privacy policy and terms of service before public launch

## License

This project is licensed under the [MIT License](LICENSE)

## Disclaimer

This project is a wellness support tool, not a medical device or a licensed therapy service. It does not diagnose, treat, or provide emergency response. Use of this app does not create a therapist-client or provider-patient relationship.
