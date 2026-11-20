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

## Deploy frontend on Vercel and API on Render

This machine has no Git, GitHub, Vercel, or Render login, and the Atlas cluster in your screenshot was still provisioning, so the hosted URLs cannot be created from here. `render.yaml` and `frontend/vercel.json` are ready for the steps below.

1. In Atlas, wait until Cluster0 is idle. Database Access: create a user. Network Access: allow `0.0.0.0/0` for Render (or Render's egress IPs). Copy the connection string and set the database name to `expense_management`.
2. Install Git, create a GitHub repository, and push this project. Do not commit `.env` files.
3. Render: New Web Service, connect the repo, root directory `backend` (or apply `render.yaml`). Build `npm install`, start `npm start`. Set:
   - `MONGO_URI` = Atlas connection string
   - `JWT_SECRET` = long random string
   - `NODE_ENV` = `production`
   - `SEED_DEMO` = `true` for the first boot (demo admin and user), then set it back to `false`
   - `CLIENT_URL` = the Vercel URL from step 4 (you can set a placeholder, deploy Vercel, then update this and redeploy)
4. Vercel: import the same repo, Root Directory `frontend`, framework Vite, output `dist`. Set `VITE_API_URL` to `https://<your-render-service>.onrender.com/api/v1` before the first build. `vercel.json` rewrites client routes to `index.html`.
5. Put the final Vercel origin into Render `CLIENT_URL` (comma-separate extras if needed) and redeploy the API. Sign in with `admin@example.com` / `Admin@12345` only while the demo seed is enabled.
