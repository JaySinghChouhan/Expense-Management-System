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
On macOS/Linux use `cp .env.example .env`. Edit `.env` and set `MONGO_URI` and a long random `JWT_SECRET`.
```bash
npm run dev
```
API: http://localhost:5000/api/health

Optional demo seed (in another terminal):
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
- PATCH `/api/v1/expenses/:id` (pending claims only; send `version` for optimistic concurrency)
- DELETE `/api/v1/expenses/:id` (soft delete; pending claims only)
- POST `/api/v1/expenses/:id/approve` (Admin)
- POST `/api/v1/expenses/:id/reject` (Admin)
- GET `/api/v1/dashboard/summary?year=2026`
- GET `/api/v1/reports/expenses/export` (CSV; same filters as list)

All protected endpoints require `Authorization: Bearer <JWT>`.
Register cannot self-assign Admin. The seed script creates the demo admin. Promote any other account with a controlled database update.

## Tests
```bash
cd backend && npm test
cd frontend && npm test
```

## Security notes
- Passwords use bcrypt hashing.
- JWT secret is environment-only.
- User list/detail/update/delete queries are scoped to the authenticated user; Admin can view all.
- Soft deletes preserve records.
- Approval uses atomic conditional update so a pending expense cannot be approved twice.
- Helmet, CORS, rate limiting, validation, and centralized errors are included.
- For production, add refresh-token rotation, email verification, stronger audit/event retention, pagination caps, and monitoring.

## Deploy frontend and API

The deployment configuration is included in `render.yaml` and `frontend/vercel.json`.

1. In MongoDB Atlas, create a database user and allow network access from Render (prefer Render's outbound IPs where available). Use the Atlas connection string with the `expense_management` database.
2. Deploy the API on Render using `render.yaml`, or use the existing Vercel API deployment. Set `MONGO_URI` to the Atlas connection string and `JWT_SECRET` to a long random value in the API host's environment. Keep `SEED_DEMO` set to `false` for public deployments; the seeded demo accounts are not created in this mode.
3. Deploy the frontend on Vercel with Root Directory `frontend`, framework Vite, and output directory `dist`. Set `VITE_API_URL` to the API base URL ending in `/api/v1`.
4. Set the API's `CLIENT_URL` to the frontend origin and redeploy the API. For the current Vercel deployment, use `https://expense-management-system-57v.vercel.app` as `CLIENT_URL` and `https://expense-management-system-363f.vercel.app/api/v1` as `VITE_API_URL`.
5. Register an account before signing in. The demo admin credentials shown on the login screen only work if the database was explicitly seeded; public registration creates user-role accounts.
