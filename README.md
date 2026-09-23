# WeatherWise — Backend API

A RESTful API for WeatherWise, a weather-aware trip planning application. Handles authentication, and full CRUD for saved locations, trips, packing items, and activities, backed by PostgreSQL.

## Tech Stack
- Node.js + Express — server and routing
- Drizzle ORM + `postgres` driver — database access and migrations
- PostgreSQL (hosted on Supabase) — database
- bcrypt — password hashing
- jsonwebtoken (JWT) — authentication
- Vitest + Supertest — testing

## Development Process
The backend was built incrementally: project setup and database connection first, then the schema (translated directly from the Week 1 ER diagram) and migrations, then authentication and JWT middleware, then each CRUD resource in turn (Locations → Trips → Packing Items → Activities → Admin), testing each one against the real database via Thunder Client before moving to the next. A lightweight Vitest + Supertest suite covers the authentication flow. The app is split into `app.js` (the Express app definition) and `index.js` (starts the server), which keeps the app importable and testable without needing a real running server.

## Design Patterns & Decisions
- **Layered structure**: routes (`src/routes/`) handle HTTP concerns; the database layer (`src/db/`) is isolated behind a single shared connection; business logic that doesn't belong to HTTP (the packing suggestion engine) lives in `src/utils/`, independently testable
- **Middleware-based auth**: `requireAuth` verifies a JWT and attaches the user to `req.user`; `requireAdmin` is a separate, chainable middleware for admin-only routes — matching the Week 1 architecture diagram's middleware layer
- **Ownership checks on every protected route**: every query filters by the authenticated user's id (directly, or via a shared helper for resources nested under a trip), so a user can never read or modify another user's data
- **Delete restriction on Saved Locations**: deleting a location is blocked with `409 Conflict` if any trip still references it, directly implementing the data-integrity decision documented in the Week 1 design rationale
- **Packing Suggestion Engine**: a small, pure rule-based function (`src/utils/packingEngine.js`) that takes structured forecast data and returns suggested packing items — deliberately rule-based rather than ML-based, kept separate from any HTTP/database code so it can be tested in isolation
- **Consistent error shape**: every error response follows `{ "error": "message" }`, with HTTP status codes used meaningfully (400 for bad input, 401/403 for auth failures, 404 for missing resources, 409 for conflicts) — see `API_DOCUMENTATION.md` for the full reference

## Known Limitations (intentional scope for this stage)
- Trip creation currently uses a hardcoded mock forecast rather than a live call to Open-Meteo — real weather integration is planned for Week 4
- Tests currently run against the live development database rather than an isolated test database
- Test coverage focuses on the authentication flow; CRUD routes were verified manually via Thunder Client but do not yet have automated test coverage

## Project Structure