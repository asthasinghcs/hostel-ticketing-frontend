# HostelCare — Frontend

React + Vite interface for student, warden, and administrator workflows. The matching Flask backend is required.

## Run locally

Use Node 22.22.3 or a compatible version supported by Vite.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Start the backend on port 5000. Open http://localhost:5173. Change VITE_API_URL in .env.local if necessary; restart Vite after changing it. Production builds fall back to the existing Render backend, but an explicit VITE_API_URL is recommended.

## Checks

```powershell
npm test
npm run lint
npm run build
```

Twelve frontend tests cover filters, search, personal counts, authentication, expiry, stale requests, cancellation, timeouts, and error handling. The production output is dist/.

## Behavior

- Signup creates student accounts and signs them in immediately.
- Reload restores the server-verified identity from a tab-scoped session.
- Students submit tickets for their block, vote once, and comment.
- Students access only their registered hostel; wardens and admins manage all hostels.
- Search, category/status filters, personal tickets, sorting, live counts, and discussions are available in the workspace. Only staff can switch hostels.

The API enforces these rules independently of the interface.

See [the complete project guide](docs/PROJECT.md) for architecture, API contracts, migration, staff provisioning, deployment, and verified results.
