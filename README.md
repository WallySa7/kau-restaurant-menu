# KAU Restaurant Digital Menu

CPIT 380 (Multimedia Technologies) — Group 5 community work assignment.

A bilingual (Arabic / English) web application that replaces King Abdulaziz University Restaurant's
static PDF menu and physical ticket queue with a digital booking platform. Students browse the
weekly menu, book a meal slot, complete a simulated payment, and receive a QR-coded ticket. Staff
verify and redeem tickets via a dedicated admin scan page.

See [SPEC.md](./SPEC.md) for the full specification.

## Tech stack

- **Frontend:** React 18 + Vite, Tailwind CSS, React Router v6
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **i18n:** react-i18next (AR / EN with RTL support)
- **QR:** qrcode.react (generation), html5-qrcode (camera scanning)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the migration in `supabase/migrations/0001_init.sql`.
3. Copy `.env.example` to `.env.local` and fill in your project URL and anon key.

### 3. Run the dev server

```bash
npm run dev
```

The app opens at <http://localhost:5173>.

### 4. Create an admin user

After signing up through the app, run this SQL in the Supabase SQL editor to promote a user to admin:

```sql
update profiles set role = 'admin' where id = (
  select id from auth.users where email = 'admin@kau.edu.sa'
);
```

## Project structure

```
src/
├── components/        # Shared UI (Layout, Navbar, route guards)
├── contexts/          # React contexts (Auth)
├── i18n/              # Translation files and i18next config
├── lib/               # Supabase client, helpers
├── pages/
│   ├── student/       # Public + authenticated student pages
│   └── admin/         # Admin-only pages
├── App.jsx            # Root component with routes
└── main.jsx           # Entry point

supabase/
└── migrations/        # SQL migrations
```

## Team

| Name | ID | Section |
|---|---|---|
| Abdullah Mubarak | 2342239 | IT3 |
| Abdulrahman Salem Al-Wasabi | 2343237 | IT3 |
| Hassan Ahmed Asiri | 2339657 | IT2 |
| Muath Abbas Eissa | 2338818 | IT2 |
| Osama Mazhud Al-Ghamdi | 2336767 | IT2 |
