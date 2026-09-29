# Backend

This folder contains the Express + MongoDB backend for RoyalSalon.

## Environment variables

Add these to `.env.local` in the project root:

- `MONGODB_URI` (required)
- `MONGODB_DB_NAME` (optional, default: `royalsalon`)
- `BACKEND_PORT` (optional, default: `5000`)

If `MONGODB_URI` is missing, the backend starts in temporary in-memory mode and all bills, customers, and payment data will be lost on restart or redeploy.

## Run backend

```bash
npm run dev:backend
```

## API endpoints

- `GET /api/health`
- `GET /api/customers`
- `POST /api/customers`
- `PATCH /api/customers/:id`
- `GET /api/services`
- `POST /api/services`
- `PATCH /api/services/:id`
- `GET /api/bills`
- `POST /api/bills`
- `GET /api/dashboard`
- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/style-advisor/recommendations`
