# DailyLife Health Coach

A responsive full-stack prototype that collects demographic, health, and lifestyle information and returns structured, evidence-minded recommendations from an OpenAI Assistant.

## Project structure

- `client/`: React + TypeScript front-end built with Vite.
- `server/`: Express + TypeScript backend with validation, prompt construction, and simple rate limiting.

## Prerequisites

- Node.js 18+ (tested with 22.x)
- npm

## Environment variables

Create a `.env` file inside `server/` with:

```
PORT=9500
ALLOWED_ORIGINS=http://localhost:9501
API_KEY=your-openai-api-key
API_ASSISTANT_ID=your-assistant-id
DATABASE_URL=postgres://...
```

`API_KEY` and `API_ASSISTANT_ID` are used to call the OpenAI Assistants API for live recommendations.

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

The client dev server proxies API calls to `http://localhost:9500`.

### Troubleshooting

- **`net::ERR_NAME_NOT_RESOLVED` pointing at `server:9500`** – this means the browser cannot resolve the hostname `server`.
  - When running **outside Docker**, set `VITE_API_BASE_URL=http://localhost:9500/api` (or remove the variable) so requests go to your local machine rather than the Docker service name.
  - When running **with Docker Compose** from the same host (e.g., browsing to `http://57.128.75.61:9501/`), your browser is outside the Compose network, so `server` will not resolve. Set `VITE_API_BASE_URL` in `client/.env` to the public IP of the host machine, e.g. `VITE_API_BASE_URL=http://57.128.75.61:9500/api`.

### Docker

You can run the full stack with Docker using the included compose file (ports 9500-9600 range):

```
docker-compose up --build
```

- API: http://localhost:9500
- Front-end: http://localhost:9501 (build-time API target can be overridden with `VITE_API_BASE_URL`).

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
