# Expense Management API

Base URL: `http://localhost:5000/api/v1` (production: your Render URL + `/api/v1`)

Every JSON response uses `{ "success": true|false, "message"?: string, "data"?: any, "errors"?: array, "meta"?: object }`.

Protected routes need `Authorization: Bearer <JWT>`.

## Auth

### POST /auth/register
Public. Always creates role `user`. Body: `name`, `email`, `password` (8+ characters).

### POST /auth/login
Public. Body: `email`, `password`. Returns `data.token` and `data.user`.

## Expenses

Users only see and change their own non-deleted rows. Admins see every non-deleted row. Approved and rejected rows cannot be edited or deleted.

### GET /expenses
Query: `page`, `limit` (max 100), `search`, `status`, `category`, `from`, `to`, `sortBy` (`date|amount|title|createdAt`), `order` (`asc|desc`).

### POST /expenses
Body: `title`, `amount` (> 0), `category`, `date` (ISO), `paymentMethod` (`Cash|Card|UPI|Bank Transfer|Other`), `description`. Status starts as `pending`. `createdBy` is the signed-in user.

### GET /expenses/:id
### PATCH /expenses/:id
Pending rows only. Send `version` from the last read to reject a stale concurrent update with `409`.

### DELETE /expenses/:id
Soft delete. Pending rows only. The row stays in the database with `isDeleted: true` and disappears from lists.

### POST /expenses/:id/approve
### POST /expenses/:id/reject
Admin only. Optional body `{ "comment": "..." }`. The update is conditional on `status: pending` and runs in a MongoDB transaction when the server is a replica set (Atlas). Response includes `reviewedBy`, `reviewedAt`, and `reviewComment`. A second review returns `409`.

## Dashboard and reports

### GET /dashboard/summary?year=2026
Returns yearly total, current-month total (when `year` is this year), 12-month trend, category totals, approval counts, and the highest expense. Money figures are limited to that year. Approval counts include every non-deleted expense so the pending queue stays accurate.

### GET /reports/expenses/export
CSV download using the same filters as the list. Capped at 5,000 rows.

## Health

`GET /api/health` (not under `/v1`) returns `{ "success": true }`.
