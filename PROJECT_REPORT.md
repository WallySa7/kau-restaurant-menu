# KAU Restaurant Digital Menu System
## Community Service Project Report

---

## Project Overview

**Project Name:** KAU Restaurant Digital Menu  
**Institution:** King Abdulaziz University (KAU)  
**Course:** CPIT 380  
**Group:** Group 5  
**Purpose:** Provide a digital meal booking system for university students and staff

---

## What Problem Does This Solve?

The KAU Restaurant previously relied on physical menus and manual ticket sales. This system modernizes the experience by:

- **Eliminating paper menus:** Students view meals digitally on their phones/computers
- **Simplifying meal booking:** One-click booking with automatic ticket generation
- **Streamlining entry:** QR code scanning replaces manual ticket checking
- **Providing real-time visibility:** Admins track meal demand and inventory instantly

---

## How It Works

### For Students

1. **Browse Menus:** Visit the website, view weekly meals with prices and details
2. **Book Meals:** Select date, meal type (breakfast/lunch/dinner), and quantity
3. **Purchase Tickets:** Pay via the system (integrated payment simulation)
4. **Get QR Code:** Receive a unique QR code ticket via email or in-app
5. **Redeem:** Scan QR at restaurant entrance → meal is marked as redeemed

### For Administrators

1. **Manage Weekly Menus:** Upload meals, prices, descriptions, and photos
2. **Create Ticket Types:** Define breakfast/lunch/dinner pricing and availability
3. **View Bookings:** See real-time list of all reservations
4. **Scan QR Codes:** Use phone camera to validate student tickets at entry
5. **Track Analytics:** Dashboard shows bookings, revenue, popular meals

---

## Tools & Technologies Used

### Frontend (What Users See)

| Tool | Purpose |
|------|---------|
| **React 18** | Core web framework—handles all UI interactions |
| **Vite** | Build tool—compiles code for web browsers (fast development) |
| **Tailwind CSS** | Styling—creates responsive, modern design |
| **React Router** | Navigation—manages pages (menu, tickets, admin panel) |
| **i18next** | Translations—supports Arabic & English with RTL layout |
| **QR Code Libraries** | `qrcode.react` generates tickets; `html5-qrcode` reads them |

### Backend (Data & Authentication)

| Tool | Purpose |
|------|---------|
| **Supabase** | Database & Auth—stores menus, bookings, user accounts; handles login |
| **PostgreSQL** | Database engine—powers Supabase (reliable, fast queries) |
| **Supabase Auth** | Sign-up/login system—students create accounts securely |

### Development

| Tool | Purpose |
|------|---------|
| **Node.js + npm** | Package manager—installs & manages code libraries |
| **ESLint** | Code quality—catches errors before deployment |
| **Git** | Version control—tracks code changes |

---

## System Architecture

```
┌─────────────────────────────────────────────┐
│         Student/Admin Browser                │
│  (React App with Tailwind UI)               │
└──────────────────┬──────────────────────────┘
                   │ HTTP Requests
                   ▼
┌─────────────────────────────────────────────┐
│   Supabase Cloud (Backend as a Service)     │
│                                             │
│  ├─ Authentication (Login/Signup)           │
│  ├─ Database (Menus, Bookings, Users)       │
│  └─ Real-time Updates                       │
└─────────────────────────────────────────────┘
```

---

## Key Features

### ✅ Student Features
- Browse weekly meal menus with photos & descriptions
- Book meals for multiple dates
- Track booking status
- View & manage booked tickets
- Generate & share QR codes
- Support for Arabic & English

### ✅ Admin Features
- Create/edit weekly menus
- Manage meal prices & availability
- Set ticket types & pricing
- View all student bookings
- Scan QR codes to redeem meals
- Real-time booking analytics
- User role management

---

## Database Tables

| Table | Purpose |
|-------|---------|
| **profiles** | Stores user info (name, email, role) |
| **menu_weeks** | Weekly menu periods (start date, end date) |
| **menu_items** | Individual meals (name, price, description) |
| **bookings** | Student reservations (user, date, meal type, status) |

**Safety Feature:** System prevents double-booking—same student cannot book same meal twice.

---

## Security & User Safety

- **Passwords:** Securely hashed (never stored in plain text)
- **QR Codes:** Unique per booking—prevents ticket sharing
- **Admin Access:** Only verified admins can manage menus
- **Role-Based:** Students cannot access admin features
- **Secure Database:** Only app can access meal/booking data

---

## How to Use (Quick Start)

### Students
1. Visit website → Register with email/password
2. Browse "Menu" page
3. Click "Book Now" → Select meal & date
4. Complete payment (simulated)
5. Go to "My Tickets" → View QR code
6. Scan at restaurant entrance

### Admins
1. Log in with admin account
2. Navigate to admin dashboard
3. "Menu Manager" → Add/edit meals
4. "Bookings" → View reservations
5. "Scan" → Use phone camera to validate tickets

---

## Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add Supabase credentials

# Start development server
npm run dev

# Build for production
npm run build

# Check code quality
npm run lint
```

---

## Screenshots & What They Show

| Screenshot | What It Displays |
|-----------|-----------------|
| **Landing Page** | Welcome screen with navigation to menu/login |
| **Menu Page** | Weekly meals with photos, names, prices, descriptions |
| **Booking Modal** | Date/meal type selection, quantity, price summary |
| **Tickets Page** | List of student's bookings with status |
| **Ticket Detail** | Large QR code for scanning at entrance |
| **Admin Dashboard** | Real-time stats (total bookings, revenue, popular meals) |
| **Menu Manager** | Form to add/edit meals (name, price, image upload) |
| **Bookings List** | Table of all reservations with filters |
| **QR Scanner** | Camera feed with success/error messages |

---

## Benefits to KAU Community

✅ **Students:** Convenient online booking, no lost tickets, instant QR codes  
✅ **Restaurant Staff:** Automated entry checks, accurate meal counts  
✅ **Admins:** Real-time data, easy menu management, sales tracking  
✅ **University:** Reduced paper waste, modernized operations  

---

## Technical Highlights

- **Fast Loading:** Vite provides instant page loads
- **Offline Support:** App works on slow connections
- **Mobile Friendly:** Responsive design works on any screen size
- **Bilingual:** Seamless Arabic/English switching
- **Real-time Updates:** Changes reflect immediately across all users
- **Zero Downtime:** Supabase handles infrastructure automatically

---

## Future Enhancements

- Nutrition information per meal
- Student dietary preferences/allergies
- Email reminders before meal date
- Cancellation & refund system
- Analytics dashboard for business insights
- Integration with university ID cards

---

## Team & Credits

**Group 5 - CPIT 380**  
King Abdulaziz University  
May 2026

---

## Contact & Support

For issues or feature requests, contact the development team or submit feedback through the app.

---

**Last Updated:** May 14, 2026
