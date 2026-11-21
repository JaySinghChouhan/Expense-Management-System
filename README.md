# Expense Management System

MERN stack assignment implementation: React + Vite, Express, MongoDB/Mongoose, JWT, role-based access, expense CRUD, approval workflow, dashboard aggregates, CSV export.

## Prerequisites
- Node.js 20+ and npm
- MongoDB local service or MongoDB Atlas cluster

## Local setup

### Backend
```bash
cd backend
npm install
copy .env.example .env
```
On macOS/Linux use `cp .env.example .env`. Edit `.env` and set `MONGO_URI` and a random `JWT_SECRET` of at least 32 characters.
```bash
npm run migrate
npm run dev
```
API: http://localhost:5000/api/health

The frontend includes a `/register` page for creating user accounts. For a local-only demo dataset, run this optional seed instead:
```bash
cd backend
node scripts/seed.js
```
Demo accounts:
- Admin: admin@example.com / Admin@12345
- User: user@example.com / User@12345

Change/remove demo credentials before deploying publicly.

### Frontend
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```
Open http://localhost:5173

## API
Full notes: [docs/API.md](docs/API.md). Import [docs/expense-api.postman_collection.json](docs/expense-api.postman_collection.json) into Postman.

- POST `/api/v1/auth/register` (public; always creates User role)
- POST `/api/v1/auth/login`
- GET `/api/v1/expenses` (auth; supports page, limit, search, status, category, from, to, sortBy, order)
- POST `/api/v1/expenses`
- GET `/api/v1/expenses/:id`
- PATCH `/api/v1/expenses/:id` (pending claims only; `version` is required for optimistic concurrency)
- DELETE `/api/v1/expenses/:id` (soft delete; pending claims only)
- POST `/api/v1/expenses/:id/approve` (Admin)
- POST `/api/v1/expenses/:id/reject` (Admin)
- GET `/api/v1/dashboard/summary?year=2026`
- GET `/api/v1/reports/expenses/export` (CSV; same filters as list)

All protected endpoints require `Authorization: Bearer <JWT>`.
Register cannot self-assign Admin. The seed script creates the demo admin. Promote any other account with a controlled database update.

## Tests
```bash
cd backend
npm test
cd ../frontend
npm test
```

## Docker development
Copy the root `.env.example` to `.env`, replace `JWT_SECRET` with a random value of at least 32 characters, then run:
```bash
docker compose up --build
```
The frontend is at http://localhost:5173 and the API health endpoint is http://localhost:5000/api/health. MongoDB data persists in the `mongo_data` volume.
The Compose stack runs Vite in development mode; do not expose it as a production frontend.

## Security notes
- Passwords use bcrypt hashing.
- JWT secret is environment-only and the API refuses to start without a 32-character value.
- User list/detail/update/delete queries are scoped to the authenticated user; Admin can view all.
- Soft deletes preserve records.
- Approval uses atomic conditional update so a pending expense cannot be approved twice.
- Helmet, CORS, rate limiting, validation, and centralized errors are included.
- For production, add refresh-token rotation, email verification, stronger audit/event retention, and monitoring.

## Deploy frontend and API

The deployment configuration is included in `render.yaml` and `frontend/vercel.json`.
MongoDB migrations are versioned in `backend/migrations` and run with `npm run migrate` from `backend`; the runner records applied IDs in `schema_migrations`.

1. In MongoDB Atlas, create a database user and allow network access from the API host. Use the Atlas connection string with the `expense_management` database.
2. Deploy the API on Render using `render.yaml`, or use the existing Vercel API deployment. Set `MONGO_URI` to the Atlas connection string and `JWT_SECRET` to a long random value in the API host's environment. Keep `SEED_DEMO` set to `false` for public deployments; the seeded demo accounts are not created in this mode.
3. Deploy the frontend on Vercel with Root Directory `frontend`, framework Vite, and output directory `dist`. Set `VITE_API_URL` to the API base URL ending in `/api/v1`.
4. Set the API's `CLIENT_URL` to the frontend origin and redeploy the API. For the current Vercel deployment, use `https://expense-management-system-57v.vercel.app` as `CLIENT_URL` and `https://expense-management-system-363f.vercel.app/api/v1` as `VITE_API_URL`.
5. Register an account before signing in. The demo admin credentials shown on the login screen only work if the database was explicitly seeded; public registration creates user-role accounts.
