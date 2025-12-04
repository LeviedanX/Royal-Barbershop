# Barbershop Booking Platform (Full Stack)

Full‑stack barbershop booking and payment platform. Backend uses Laravel (REST API, Midtrans integration), frontend uses React + Vite, with a SQL schema/dump included.

## Features
- Multi‑role workflow: customer, barber, admin
- Barber & service catalog with dynamic pricing (barber base price + service + skill premium)
- Booking creation with queue numbers, schedule, optional hairstyle selection
- Midtrans Snap payments (create/confirm, payment status sync)
- Dashboards: customer (active booking, history, edit/cancel pre‑payment), barber/admin panels (managed by backend API)
- Hairstyle gallery selection attached to bookings

## Tech Stack
- Backend: Laravel (PHP), Sanctum/JWT style auth, REST controllers, Midtrans service, Eloquent models
- Frontend: React 18 + Vite, Tailwind CSS, Framer Motion, Three.js accents, Axios
- Database: MySQL/MariaDB (dump provided: `barbershop_db.sql`)

## Project Layout
- `backend/` — Laravel API and payment logic
- `frontend/` — React SPA (booking UI, dashboards)
- `barbershop_db.sql` — database schema/data dump
- `BARBERSHOP.docx` — supplemental docs (if provided)

## Prerequisites
- PHP 8.1+, Composer
- Node.js 18+, npm
- MySQL/MariaDB
- Midtrans account (client key + server key; sandbox or production)

## Backend Setup (Laravel)
1) `cd backend`
2) `cp .env.example .env` then set:
   - `APP_URL=http://YOUR-BACKEND:8000`
   - DB settings for MySQL
   - Midtrans keys: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION=false|true`
   - CORS/stateful domains to include your frontend host
3) Install & migrate:
   
   composer install
   php artisan key:generate
   php artisan migrate --seed   # or import barbershop_db.sql manually
   
4) Run: `php artisan serve --host 0.0.0.0 --port 8000`

### Midtrans Notes (Backend)
- Payment creation: `POST /api/payments/{booking}/create` returns Snap token.
- Payment confirmation: `POST /api/payments/{booking}/confirm` pulls status from Midtrans.
- Callback: `/api/midtrans/callback` (ensure Midtrans dashboard points here).

## Frontend Setup (React + Vite)
1) `cd frontend`
2) Create `.env`:
   
   VITE_API_BASE_URL=http://YOUR-BACKEND:8000   # optional; falls back to window.origin if omitted
   VITE_MIDTRANS_CLIENT_KEY=Mid-client-XXXX     # from Midtrans dashboard
   
   - Set `VITE_API_BASE_URL` when frontend runs on a different host/IP than backend (LAN/production).
   - Ensure your frontend domain/IP is allowed in backend CORS and Midtrans allowed origins.
3) Install & run:
   
   npm install
   npm run dev         # dev server
   npm run build       # production build
   npm run preview     # preview build
      

## Two-Machine / LAN Testing
- Backend on machine A (e.g., http://192.168.1.10:8000), frontend on machine B.
- Set `VITE_API_BASE_URL` on B to A’s URL; run dev/build.
- Access frontend via B’s IP/port; payment calls target A.

## Database
- Import `barbershop_db.sql` into MySQL/MariaDB, or run migrations/seeds from backend.
- Models: Booking, Barber, Service, Hairstyle, Payment, Coupon/Promo, User, Review.
- Dynamic pricing logic combines service base price + barber base price + skill premium; promos/loyalty handled server-side.

## Key Endpoints (API)
- `GET /api/barbers`, `GET /api/services`, `GET /api/hairstyles`
- `POST /api/bookings` (barber_id, service_id, hairstyle_id?, scheduled_at, coupon_code?, note?)
- `GET /api/bookings/my`, `PUT /api/bookings/{id}`, `DELETE /api/bookings/{id}`
- `POST /api/payments/{booking}/create`, `POST /api/payments/{booking}/confirm`
- `POST /api/midtrans/callback` (no auth; Midtrans webhook)

## Deployment Checklist
- Backend: correct `.env` (DB, Midtrans keys, APP_URL), HTTPS, CORS for frontend domain, queue/callback endpoints reachable.
- Frontend: `VITE_API_BASE_URL` set to production API origin; `VITE_MIDTRANS_CLIENT_KEY` production; build `npm run build`; serve `dist/` over HTTPS.
- Midtrans: allow frontend domain/IP; set callbacks to backend URL.
- Database: migrate/seed or import dump; verify credentials.

## Security & Ops
- Use HTTPS end-to-end in production (Midtrans-friendly).
- Restrict CORS to known origins.
- Rotate Midtrans keys and keep server key on backend only.
- Enable logging/monitoring for payment callbacks and booking mutations.
