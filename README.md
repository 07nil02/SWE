# FleetTrans - Transport Fleet Operations & Rental Automation System

A production-ready full-stack automation system for a transport enterprise managing fleet inventory, rental bookings, dynamic billing rules, maintenance/repair costs, fuel tracking, and profitability analytics.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v20+ or v26+)
- npm (v10+ or v12+)
- *(Optional)* Local MongoDB instance. If no MongoDB instance is detected, the backend **automatically spins up an embedded in-memory MongoDB engine**, allowing zero-configuration out-of-the-box execution!

### Installation
Both backend and frontend dependencies are already configured:
```bash
# In backend
cd backend && npm install

# In frontend
cd frontend && npm install
```

### Running the System
You can start backend and frontend concurrently:

```bash
# Terminal 1: Start Backend (Port 5001)
npm run dev:backend

# Terminal 2: Start Frontend (Port 5173)
npm run dev:frontend
```

Open your browser at **`http://localhost:5173`**.

### Running Automated Test Suite
Run the 29 automated unit and integration tests:
```bash
npm run test
```

---

## 🔐 Two-Tier Role-Based Access Control (RBAC)

The system enforces two segregated operational tiers:
* **Private Clients / Customers**:
  * Browse the fleet catalogue with climate/category filters.
  * Real-time dual-formula tariff simulator with statutory 4-hour floor.
  * Book available vehicles with advance deposits.
  * Dedicated **Client Portal** (`CustomerPortalModal`) to track personal booking statuses and print official settlement receipts.
* **Fleet Operations / Administrators**:
  * Dedicated **Operations Workspace** (`OperationsWorkspace`) restricted via `isAdmin` guardrails (HTTP 403 enforcement).
  * Authorize vehicle departures with starting odometer verification.
  * Process vehicle returns with statutory billing calculations (refunds / balance due).
  * Enrol/acquire new vehicles and decommission/condemn assets with salvage tracking.
  * Record workshop maintenance work orders and fuel dispensation logs.
  * Adjust category master tariffs and inspect business intelligence (BI) profitability.
* **1-Click Evaluation Access**: Instant switching between `ADMIN` and `CUSTOMER` roles in the authentication modal for seamless testing.

---

## 📋 Problem Statement & Fleet Composition

The system manages the company's initial fleet of **52 vehicles**:
- **Ambassador**: 10 Non-AC, 2 AC (Total: 12)
- **Tata Sumo**: 5 Non-AC, 5 AC (Total: 10)
- **Maruti Omni**: 10 Non-AC (Total: 10)
- **Maruti Esteem**: 10 AC (Total: 10)
- **Mahindra Armada**: 10 Non-AC (Total: 10)

---

## 💡 Core Business Logic & Pricing Engine

1. **Category Rates**: Base hourly rate and base kilometer rate per category.
2. **AC Surcharge**: AC vehicles in any category are charged **50% more** ($1.5\times$) on both hourly and km tariffs.
3. **Minimum Rental Duration**: Mandatory statutory **4 hours** rental duration floor.
4. **Billing Formula**:
   $$\text{Gross Charge} = \max(\text{Hours Used} \times \text{Hourly Rate}, \text{Kilometers Run} \times \text{Km Rate})$$
   $$\text{Usage Charge} = \max(\text{Gross Charge}, 4 \times \text{Hourly Rate})$$
   $$\text{Total Charge} = \text{Usage Charge} + (\text{Night Halts} \times ₹150)$$
5. **Financial Settlement Against Advance Deposit**:
   - $\text{Balance} = \text{Advance Deposited} - \text{Total Charge}$
   - If $\text{Balance} > 0$: **Refund to Customer**
   - If $\text{Balance} < 0$: **Customer Pays Additional Due**
   - If $\text{Balance} = 0$: **Settled Exactly**
6. **Vehicle States**:
   - `AVAILABLE` (Ready for booking/dispatch)
   - `RENTED_OUT` (Currently dispatched on a trip)
   - `UNDER_REPAIR` (In workshop for maintenance)
   - `CONDEMNED_SOLD` (Decommissioned/sold off from active fleet)

---

## 🛠️ Tech Stack

- **Backend**: TypeScript, Node.js, Express.js, MongoDB, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, Vitest, Supertest, `mongodb-memory-server`.
- **Frontend**: TypeScript, React 19, Vite, Tailwind CSS, Playfair Display & JetBrains Mono typography.

---

## 📑 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection with auto in-memory fallback
│   │   ├── middleware/         # authMiddleware.ts (JWT verification & requireRole)
│   │   ├── models/             # User, VehicleCategory, Vehicle, RentalBooking, MaintenanceLog, FuelLog
│   │   ├── services/           # pricingService.ts (Core billing calculation & NaN guards)
│   │   ├── controllers/        # Auth, Category, Vehicle, Rental, Maintenance, Analytics
│   │   ├── routes/             # REST API routes
│   │   ├── seeds/              # Seed data for 52 vehicles, default admin & customer
│   │   ├── tests/              # Vitest unit & integration test suites (29 tests)
│   │   ├── app.ts              # Express application factory
│   │   └── server.ts           # Server bootstrap
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/client.ts       # Fully typed API client with JWT bearer tokens
│   │   ├── context/            # AuthContext.tsx (User state, login, register, demoLogin)
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Executive nav, role switcher, fleet readiness
│   │   │   ├── Hero.tsx                # Cinematic billboard
│   │   │   ├── BookingSearch.tsx       # Date-validated route search bar
│   │   │   ├── FleetSection.tsx        # Filterable catalogue grid
│   │   │   ├── BookingFlowModal.tsx    # 5-step client reservation flow
│   │   │   ├── OperationsWorkspace.tsx # Administrative dispatch, settlement, inventory & BI
│   │   │   ├── CustomerPortalModal.tsx # Client reservations ledger & settlement vouchers
│   │   │   ├── AuthModal.tsx           # Two-tier sign-in & registration with 1-click access
│   │   │   ├── VehicleDetailModal.tsx  # Full vehicle specifications dossier
│   │   │   └── HowItWorksSection.tsx   # Dual-metric tariff codex & live calculator
│   │   ├── App.tsx             # Root layout & modal coordination
│   │   └── main.tsx            # React 19 bootstrap
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── package.json
```

---

## 🧪 Edge Cases & Illegal Values Handled

1. **Short Trips (< 4 Hours)**: Automatically enforces statutory 4-hour floor.
2. **Dominant Rate Selection**: Automatically determines whether KM or Duration yields higher charge.
3. **Mile-Meter Rollback Prevention**: Rejects return odometer readings less than starting dispatch odometer.
4. **Advance Reconciliation**: Accurately computes refunds and additional payments without IEEE 754 precision artifacts.
5. **Night Halt Billing**: Adds ₹150 flat per night halt regardless of vehicle category.
6. **State Machine Integrity**: Rejects double dispatch or condemning an active/booked vehicle.
7. **Active Reservation Concurrency**: Prevents two customers from booking the same available car simultaneously before dispatch.
8. **Input Type & NaN Shielding**: Rejects `NaN`, zero, and negative values on advance payments, purchase prices, repair costs, fuel liters, and category tariffs.
9. **Credential & Contact Validation**: Enforces RFC-compliant email regex, minimum password length (6 chars), driver name length ($\ge 2$), and phone sanitization.
10. **Temporal Validity**: Rejects past pickup dates and ensures expected return dates are strictly in the future and after pickup.
