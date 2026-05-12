# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint (0 warnings allowed)
```

No test suite — lint is the only automated check.

## Environment Setup

Copy `.env.example` to `.env.local` and set:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

React 18 + Vite SPA. No server-side rendering. All backend via Supabase JS client (`src/lib/supabase.js`).

**Auth flow:** `AuthContext` (`src/contexts/AuthContext.jsx`) wraps the app, holds `session`, `profile`, and `isAdmin`. `ProtectedRoute` (`src/components/ProtectedRoute.jsx`) accepts `requireAdmin` prop to gate admin routes. Role is stored in `profiles.role` (`'student'` | `'admin'`). Promote user to admin via SQL: `update profiles set role = 'admin' where id = '...'`.

**Routing:** All routes share `<Layout>` (Navbar + Outlet). Student routes are under `/`, admin routes under `/admin/*`. See `src/App.jsx` for full route tree.

**i18n:** `src/i18n/index.js` configures react-i18next with AR/EN. Language persisted in `localStorage` key `kau-lang`. Language change sets `dir` and `lang` on `<html>`. Translation keys live in `src/i18n/en.json` and `src/i18n/ar.json` — both files must stay in sync. RTL layout handled via CSS `dir` attribute, not separate stylesheets.

**Database tables:** `profiles`, `menu_weeks`, `menu_items`, `bookings`. Key constraint: `UNIQUE (user_id, booking_date, meal_type)` on `bookings` prevents double-booking. `ticket_code` (UUID) is what QR codes encode. Migrations in `supabase/migrations/`.

**QR flow:** `qrcode.react` renders QR from `ticket_code` client-side. `html5-qrcode` in `src/pages/admin/ScanPage.jsx` decodes camera feed → queries `bookings` by `ticket_code` → updates `status` to `'redeemed'`.

**Pages split:**
- `src/pages/student/` — public + authenticated student pages
- `src/pages/admin/` — admin-only (Dashboard, MenuManager, Bookings, Scan)

**ToastContext** (`src/contexts/ToastContext.jsx`) — global toast notifications. Payment is simulated (mock form, always succeeds).
