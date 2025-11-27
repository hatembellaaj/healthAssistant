# DailyLife Health Coach

A responsive full-stack prototype that collects demographic, health, and lifestyle information and returns structured, evidence-minded recommendations from a stubbed assistant API.

## Project structure

- `client/`: React + TypeScript front-end built with Vite.
- `server/`: Express + TypeScript backend with validation, prompt construction, and simple rate limiting.

## Prerequisites

- Node.js 18+ (tested with 22.x)
- npm

## Environment variables

Create a `.env` file inside `server/` with:

```
PORT=4000
ALLOWED_ORIGINS=http://localhost:5173
LLM_API_KEY=your-api-key-here
DATABASE_URL=postgres://...
```

The demo backend does not call an external LLM but the `LLM_API_KEY` placeholder is included for future integration.

## Setup & development

Install dependencies (from the repository root):

```
cd server
npm install
npm run dev
```

In a separate terminal:

```
cd client
npm install
npm run dev
```

The client dev server proxies API calls to `http://localhost:4000`.

## Testing

Backend unit tests (validation + prompt builder):

```
cd server
npm test
```

## API overview

- `POST /api/assistant/recommendations` validates the submitted profile and returns a structured recommendation payload. Replace the stubbed response with an LLM call for production.
- `GET /api/health` simple health check.
- `GET/PUT /api/profile` placeholder endpoints for future persistence.

## Front-end workflow

- Landing hero with disclaimer and clear CTAs (start as guest, sign-up placeholder).
- Multi-step wizard for basics, vitals, medical background, lifestyle, location/context, and review/consent.
- Inline BMI calculation, geolocation helper, loading/error feedback, and rendering of returned recommendations.

## Notes on privacy and safety

- Avoid logging PHI in production. Rate limiting is enabled on API routes and CORS is configurable via `ALLOWED_ORIGINS`.
- Prominent disclaimers remind users this is not a medical device and emergencies require contacting local services.
