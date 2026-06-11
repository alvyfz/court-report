# Court Report Dashboard (Web)

Frontend dashboard for monitoring transcription jobs, personnel assignments, and payout summaries. Built with React + Vite + TypeScript, using Untitled UI components and React Aria.

## Solution Overview

- The dashboard provides metrics, a jobs table, filters, and workflow actions.
- All API actions show toast notifications (success, validation errors, and network errors).
- Job/personnel creation uses Untitled UI modals.
- The API base URL defaults to `http://localhost:3001` and can be overridden via `VITE_API_BASE_URL`.

## Running Locally

1. Install dependencies:
    ```bash
    npm install
    ```
2. (Optional) Create `.env` to set the API base URL:
    ```bash
    # .env
    VITE_API_BASE_URL=http://localhost:3001
    ```
3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## Integration Prerequisites

- Make sure the API is running (default `http://localhost:3001`) before using the dashboard.
- Health check API: `GET /api/health`
