# FLOSET — Fashion Rental Marketplace (MERN)

Luxury occasion-wear rentals with host listings, admin curation, bookings, and operational lifecycle tracking.

## Prerequisites

- Node.js 18+
- MongoDB running locally (or Atlas URI in `server/.env`)

## Quick start

```bash
# 1. Backend
cd server
cp .env.example .env   # edit MONGODB_URI if needed
npm install
npm run seed             # demo users + catalogue
npm start                # http://localhost:5001

# 2. Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## Demo accounts (after seed)

| Role     | Email                 | Password      |
|----------|------------------------|---------------|
| Admin    | admin@floset.com       | admin123      |
| Customer | customer@gmail.com     | customer123   |
| Host     | host@boutique.com      | host123       |

Set `VITE_DEMO_MODE=true` in `client/.env` to auto-login demo users on protected pages (development only).

## API health

`GET http://localhost:5001/api/health`

## Project layout

- `client/` — React + Vite + Tailwind (Framer-style UI)
- `server/` — Express + Mongoose + JWT
