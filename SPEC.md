# SPEC.md — Digital Web App Menu for KAU Restaurant

**Course:** CPIT 380 – Multimedia Technologies, Group 5  
**Submitted to:** Prof. Saim Rasheed  
**Academic Year:** 2025/2026, Spring Semester  
**Last updated:** 2026-05-10

---

## Team

| Name | ID | Section |
|---|---|---|
| Abdullah Mubarak | 2342239 | IT3 |
| Abdulrahman Salem Al-Wasabi | 2343237 | IT3 |
| Hassan Ahmed Asiri | 2339657 | IT2 |
| Muath Abbas Eissa | 2338818 | IT2 |
| Osama Mazhud Al-Ghamdi | 2336767 | IT2 |

---

## 1. Problem & Solution

**Problem:** KAU Restaurant distributes its daily meal schedule as a static PDF via QR code. Students must physically visit the restaurant to check the menu and stand in a single queue to purchase a ticket from one window, causing significant delays between classes.

**Solution:** A bilingual web platform where students can browse the weekly menu from any device, book a meal ticket for any upcoming day, complete a (simulated) payment, and receive a QR-coded digital ticket. Restaurant staff scan and redeem tickets via an admin dashboard, eliminating the physical queue entirely.

---

## 2. Functional Requirements

### 2.1 Student Features

| # | Requirement |
|---|---|
| FR-01 | Register with university email and password |
| FR-02 | Log in / log out |
| FR-03 | Browse the weekly menu grouped by day and meal type (Breakfast / Lunch / Dinner) |
| FR-04 | View meal details: name (AR/EN), description (AR/EN), photo, price |
| FR-05 | Book one ticket per meal slot per day (enforced at DB level) |
| FR-06 | Complete a simulated payment step before booking is confirmed |
| FR-07 | View all personal bookings with their status (Confirmed / Redeemed / Cancelled) |
| FR-08 | Display a full-screen QR code for any confirmed ticket |
| FR-09 | Cancel a confirmed (not yet redeemed) booking |
| FR-10 | Switch UI language between Arabic (RTL) and English (LTR) |

### 2.2 Admin / Staff Features

| # | Requirement |
|---|---|
| FR-11 | Log in with admin credentials (same auth system, admin role) |
| FR-12 | Create a weekly menu by selecting the Sunday start date |
| FR-13 | Add, edit, and delete meal items per day per meal type (with photo upload) |
| FR-14 | View all bookings for any date with filters (date, meal type, status) |
| FR-15 | Open a dedicated scan page that activates the device camera |
| FR-16 | Scan a student's QR code ticket and automatically look up the booking |
| FR-17 | Mark a ticket as Redeemed; reject if already redeemed or invalid |

---

## 3. Non-Functional Requirements

| # | Requirement |
|---|---|
| NFR-01 | **Bilingual:** Full Arabic (RTL) and English (LTR) support with a persistent language toggle |
| NFR-02 | **Responsive:** Usable on mobile phones, tablets, and desktops |
| NFR-03 | **Authentication:** JWT-based sessions via Supabase Auth; route guards enforce role access |
| NFR-04 | **Payment:** Simulated mock flow — no real gateway; a confirmation screen stands in for payment |
| NFR-05 | **Booking uniqueness:** Database-level unique constraint prevents double-booking a slot |
| NFR-06 | **Notifications:** In-app only — no email or SMS integration |
| NFR-07 | **Image storage:** Meal photos stored in Supabase Storage with public URLs |
| NFR-08 | **Performance:** Menu page loads in under 2 seconds on a standard mobile connection |

---

## 4. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React 18 + Vite | Fast builds, rich ecosystem, SPA routing |
| Styling | Tailwind CSS | Utility-first, easy RTL via `dir` attribute |
| Routing | React Router v6 | Nested routes, easy role-based guards |
| Backend / DB | Supabase (PostgreSQL) | Managed DB + Auth + Storage in one platform |
| Auth | Supabase Auth (email + password) | Built-in JWT, row-level security |
| File storage | Supabase Storage | Meal photo uploads |
| QR generation | `qrcode.react` | Client-side QR code rendering |
| QR scanning | `html5-qrcode` | Camera-based QR decode in the browser |
| State management | React Context + hooks | Sufficient for this app's complexity |
| i18n | `react-i18next` | JSON translation files, RTL toggle |
| Deployment | Vercel (frontend) + Supabase cloud | Free tiers adequate for course demo |

---

## 5. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React + Vite SPA                    │
│                                                         │
│  ┌──────────────────┐       ┌────────────────────────┐  │
│  │  Student Routes  │       │    Admin Routes        │  │
│  │  /               │       │    /admin              │  │
│  │  /menu           │       │    /admin/menu         │  │
│  │  /menu/:id/book  │       │    /admin/bookings     │  │
│  │  /tickets        │       │    /admin/scan         │  │
│  │  /tickets/:id    │       │                        │  │
│  └────────┬─────────┘       └───────────┬────────────┘  │
│           │                             │               │
│           └─────────────┬───────────────┘               │
│                         │  Supabase JS Client           │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS / REST + Realtime WS
┌─────────────────────────▼───────────────────────────────┐
│                      Supabase                           │
│                                                         │
│   Auth (JWT)  │  PostgreSQL (RLS)  │  Storage (photos)  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow — Student Books a Meal

1. Student logs in → Supabase Auth returns JWT
2. Student opens `/menu` → app fetches current week's `menu_items` for their chosen day/slot
3. Student clicks "Book" → navigated to `/menu/:itemId/book`
4. Student completes mock payment form → client inserts a row into `bookings` with `status = confirmed` and a generated `ticket_code` (UUID v4)
5. App displays the booking and navigates to `/tickets/:bookingId`
6. QR code is rendered client-side from `ticket_code`

### Data Flow — Staff Scans a Ticket

1. Staff opens `/admin/scan` → browser requests camera permission
2. `html5-qrcode` decodes the QR → extracts `ticket_code`
3. App queries `bookings` by `ticket_code`
4. If `status = confirmed` → update to `redeemed`, show green success
5. If `status = redeemed` → show "Already redeemed" warning (red)
6. If not found → show "Invalid ticket" error

---

## 6. Database Schema

### `profiles`
Extends Supabase's `auth.users` table (created via trigger on signup).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | FK → `auth.users.id` |
| `full_name` | text | |
| `role` | text | `'student'` or `'admin'` |
| `created_at` | timestamptz | |

### `menu_weeks`
One row per week the admin creates.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `week_start` | date | Always a Sunday (Saudi calendar) |
| `created_by` | uuid | FK → `profiles.id` |
| `created_at` | timestamptz | |

### `menu_items`
One row per meal slot entry (e.g., Sunday Breakfast).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `week_id` | uuid | FK → `menu_weeks.id` |
| `day_of_week` | int2 | 0 = Sunday … 6 = Saturday |
| `meal_type` | text | `'breakfast'` / `'lunch'` / `'dinner'` |
| `title_en` | text | |
| `title_ar` | text | |
| `description_en` | text | |
| `description_ar` | text | |
| `photo_url` | text | Supabase Storage public URL |
| `price_sar` | numeric(6,2) | Price in Saudi Riyals |
| `capacity` | int4 | Max bookings allowed |
| `created_at` | timestamptz | |

### `bookings`
One row per student ticket.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid | FK → `profiles.id` |
| `menu_item_id` | uuid | FK → `menu_items.id` |
| `booking_date` | date | The actual calendar date of the meal |
| `meal_type` | text | Denormalized from `menu_items` so the slot can be uniquely constrained |
| `ticket_code` | uuid | Unique; encoded in QR code |
| `status` | text | `'confirmed'` / `'redeemed'` / `'cancelled'` |
| `created_at` | timestamptz | |

**Constraints:**
- `UNIQUE (user_id, booking_date, meal_type)` — enforces one ticket per student per slot per day, regardless of which option they pick
- `ticket_code` has a `UNIQUE` index
- `menu_items` has **no** uniqueness on `(week_id, day_of_week, meal_type)` — admin can publish multiple options per slot

### Row-Level Security (RLS) Policies

| Table | Policy |
|---|---|
| `profiles` | Users can read/update their own row; admins can read all |
| `menu_weeks` | Public read; admin-only insert/update/delete |
| `menu_items` | Public read; admin-only insert/update/delete |
| `bookings` | Users read/insert/update own rows; admins read all, update status |

---

## 7. Pages & Routes

### Student Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero banner, today's menu preview, CTA to browse or login |
| `/login` | Login | Email + password form |
| `/register` | Register | Email, full name, password |
| `/menu` | Weekly Menu | Day tabs × meal type tabs grid; each card shows photo, title, price, "Book" button |
| `/menu/:itemId/book` | Book Meal | Meal summary + mock payment form (card number UI, always succeeds) → confirmation |
| `/tickets` | My Tickets | List of all bookings with status badge |
| `/tickets/:bookingId` | Ticket Detail | Full-screen QR code + booking info (date, meal, status) |

### Admin Pages (require `role = admin`)

| Route | Page | Description |
|---|---|---|
| `/admin` | Dashboard | Stats: today's confirmed, redeemed, remaining capacity per slot |
| `/admin/menu` | Menu Manager | Select / create a week; CRUD meal items per day+slot; photo upload |
| `/admin/bookings` | Bookings Table | Paginated table; filter by date, meal type, status; export-friendly |
| `/admin/scan` | QR Scanner | Camera feed; on successful scan shows booking card + "Redeem" / error state |

---

## 8. QR Code Flow

```
[Student books meal]
      │
      ▼
ticket_code = uuid() stored in bookings table
      │
      ▼
QR code = qrcode.react renders ticket_code as a QR image
      │
      ▼
[Student shows phone to staff]
      │
      ▼
html5-qrcode decodes QR → extracts ticket_code string
      │
      ▼
Supabase query: SELECT * FROM bookings WHERE ticket_code = ?
      │
      ├── status = 'confirmed'  →  UPDATE status = 'redeemed'  →  ✅ Green success
      ├── status = 'redeemed'   →  ⚠️  "Already redeemed"
      └── not found             →  ❌  "Invalid ticket"
```

---

## 9. Milestones

| Sprint | Weeks | Deliverable | Key Tasks |
|---|---|---|---|
| **1 — Foundation** | 1 | Auth + project scaffold | Vite + React setup, Supabase project, DB schema + RLS, login/register pages, role-based route guards, i18next config |
| **2 — Menu Browsing** | 2 | Students can view the weekly menu | Menu weeks + items CRUD in Supabase, `/menu` page with day/meal tabs, meal cards with photo, AR/EN toggle, RTL layout |
| **3 — Booking & Tickets** | 3 | Students can book and view QR tickets | `/menu/:id/book` mock payment flow, booking insert with uniqueness check, `/tickets` list, `/tickets/:id` QR display |
| **4 — Admin Menu** | 4 | Admin can manage the weekly menu | `/admin/menu` page, week selector/creator, meal item form with Supabase Storage photo upload, delete/edit flows |
| **5 — Admin Ops** | 5 | Admin can scan tickets and view bookings | `/admin/scan` camera QR scanner + redeem logic, `/admin/bookings` filterable table, `/admin` dashboard stats |
| **6 — Polish & Demo** | 6–8 | Production-ready demo | Full bilingual pass, responsive fixes, loading/error states, seed data for demo, deployment to Vercel, final testing |

---

## 10. Out of Scope

The following are explicitly excluded from this submission:

- Real payment processing (Mada, Apple Pay, Moyasar, Stripe)
- Email or SMS notifications
- Native mobile app (iOS / Android)
- Integration with KAU's SSO or student information system
- Nutrition information or allergen labels
- Table reservation or seating management
- Push notifications
- Analytics or reporting beyond the admin dashboard stats

---

## 11. Glossary

| Term | Definition |
|---|---|
| Meal slot | A specific combination of day + meal type (e.g., Wednesday Lunch) |
| Ticket | A confirmed booking record with a unique QR-coded ticket_code |
| Redeem | The act of a staff member scanning and consuming a ticket at the restaurant |
| Week | A Sun–Sat calendar week identified by its Sunday start date |
| Admin | A user with `role = 'admin'` who can manage the menu and verify tickets |
