# Barbershop Booking Frontend (React + Vite)

Modern single-page app for a barbershop booking system. It consumes a Laravel REST API, handles booking flows, Midtrans Snap payments, multi-role dashboards (customer/barber/admin), and dynamic pricing per barber.

## Tech Stack
- React 18 + Vite
- Tailwind CSS + Framer Motion + Three.js (visuals)
- Axios for HTTP
- Midtrans Snap (client-side) for payments

## Core Features
- Barber/service browsing with dynamic pricing (barber base price + service + skill premium)
- Booking creation, queue numbers, and Midtrans payment initiation/confirmation
- Customer dashboard: active booking status, history, edit/cancel before payment
- Admin/barber dashboards (served by backend API)
- Hairstyle gallery selection (optional) tied to booking payload

## Prerequisites
- Node.js 18+
- Backend API reachable (Laravel service with `/api` routes and Midtrans server key)
- Midtrans client key (sandbox or production)

## Environment Variables
Create `frontend/.env`:

VITE_API_BASE_URL=http://BACKEND_HOST:8000   # optional; falls back to window.origin if omitted
VITE_MIDTRANS_CLIENT_KEY=Mid-client-XXXX      # from Midtrans dashboard

Notes:
- Leave `VITE_API_BASE_URL` empty if frontend is served from the same host/domain as the backend; otherwise set it to the backend origin (e.g., http://192.168.1.10:8000) to test across different machines.
- Ensure backend CORS and Midtrans allowed origins include your frontend domain/IP.

## Run Locally (Dev)

npm install
npm run dev

App runs at `http://localhost:5173` by default.

## Build & Preview

npm run build
npm run preview


## Two-Machine / LAN Testing (frontend ≠ backend)
1) Start backend on machine A, accessible via IP (e.g., http://192.168.1.10:8000).
2) On machine B (frontend), set `VITE_API_BASE_URL` to that IP, then `npm run dev` or serve the build.
3) Access frontend via B’s IP/port; payment calls will target machine A.

## Deployment Checklist
- Set `VITE_API_BASE_URL` to your production API origin.
- Set `VITE_MIDTRANS_CLIENT_KEY` to production.
- Confirm backend `APP_URL` and CORS allow the frontend domain; add domain to Midtrans allowed origins/callbacks.
- Serve build output (`dist/`) via static hosting or behind a reverse proxy (HTTPS recommended).

## Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview production build locally

## Project Structure (frontend)
- `src/api` – axios client and API helpers
- `src/components` – UI components (cards, payment button, layout)
- `src/pages` – main screens (booking, dashboards, gallery)
- `src/utils/price.js` – shared pricing logic (barber + service + skill)

## Backend
The companion API is Laravel-based (booking, payments, auth). Ensure it is running and reachable at the origin configured in `VITE_API_BASE_URL`.***
