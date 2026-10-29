# HostelCare

**A hostel grievance portal for students and wardens.** Students raise and follow maintenance requests in their assigned hostel; wardens review and manage requests across the full campus.

### [Open the live application →](https://hostelgrievance.onrender.com/)

[Frontend repository](https://github.com/asthasinghcs/hostel-ticketing-frontend) · [Backend and API](https://github.com/asthasinghcs/hostel-ticketing-backend) · [Software Requirements Specification](docs/HostelCare_SRS.pdf) · [Professor demo guide](docs/PROFESSOR_DEMO.md)

![HostelCare student workspace](docs/srs-assets/ui.png)

## Try the demo

| Role | Choose on the landing page | Email | Password |
| --- | --- | --- | --- |
| KP-1 student | Student → KP → KP-1 | `24054001@kiit.ac.in` | `Demo!KP1.01a` |
| QC-1 student | Student → QC → QC-1 | `24054026@kiit.ac.in` | `Demo!QC1.26a` |
| Warden | Warden & admin | `hostelcare.demo.kp@gmail.com` | `Demo!Staff.KP.42` |

These are fictional public demonstration accounts. The KP-1 student sees KP-1 requests, the QC-1 student sees QC-1 requests, and the warden can switch among all 36 configured hostels. A student cannot gain another hostel’s access by changing the landing-page choice or an API parameter. See the [five-minute walkthrough](docs/PROFESSOR_DEMO.md) and [full demo account list](docs/DEMO_ACCOUNTS.md).

## What the application does

- **Hostel-specific access:** KP-1 through KP-25 and QC-1 through QC-11; students stay within their registered hostel while wardens and admins can review every hostel.
- **Grievance workflow:** create a ticket, follow Open → In Progress → Resolved, reopen when needed, and see timestamped history.
- **Community feedback:** students can upvote an unresolved request once and discuss tickets in comments.
- **Clear counts:** total and status counters refresh after changes and remain consistent with the selected hostel and date range.
- **Find and track:** search and filter by category, status, personal tickets or overdue state; inspect daily activity in India time.
- **Responsive interface:** desktop and narrow-screen layouts, labelled controls, visible request feedback, and session-aware navigation.

The project includes a labelled set of 40 synthetic grievances dated 21–27 October 2026. Select those exact dates to show the fixed sample later; “Last 7 days” follows the current date. Live totals can change as visitors use the demo.

## Architecture

```text
React + Vite client (Render static site)
            │ HTTPS / JSON
            ▼
Flask REST API (Render web service)
            │
            ▼
Neon PostgreSQL (live data)
```

The API verifies the signed-in user, role, and stored hostel on each protected request. It uses hashed passwords and expiring, revocable sessions. The frontend never receives database credentials. SQLite is available for isolated local development and tests.

## Run locally

Requires Node.js compatible with Vite 8 and a running [backend](https://github.com/asthasinghcs/hostel-ticketing-backend#run-locally).

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

The example environment points `VITE_API_URL` to `http://localhost:5000`. Open `http://localhost:5173`. Restart Vite after changing an environment variable.

```powershell
npm test
npm run lint
npm run build
```

## Project documents

| Document | Contents |
| --- | --- |
| [SRS (PDF)](docs/HostelCare_SRS.pdf) · [Word](docs/HostelCare_SRS.docx) · [source](docs/SRS.md) | Requirements, use cases, UI and database models, acceptance criteria, traceability, and testing report. |
| [Validation evidence](docs/validation/README.md) | Reproducible boundary checks and recorded API, storage, build, and regression results. |
| [Project guide](docs/PROJECT.md) | Architecture, API contract, roles, deployment, and maintenance details. |
| [Neon deployment](docs/NEON_SETUP.md) | Database setup, migration, and verification. |

The recorded baseline passed 14 frontend tests, 38 backend tests, 40 API boundary checks, lint, and the production build. Performance and full accessibility audits are listed as unmeasured targets in the SRS.
