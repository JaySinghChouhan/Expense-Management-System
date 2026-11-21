# Backend API
<!-- Read me file -->
1. Copy `.env.example` to `.env` and set `MONGO_URI` and a long random `JWT_SECRET`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Optional demo data: `node scripts/seed.js`.

Demo accounts after seeding:
- Admin: admin@example.com / Admin@12345
- User: user@example.com / User@12345

Change these credentials immediately for any shared deployment. Never expose `.env`.
