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
Run the 18 automated unit and integration tests:
```bash
npm run test
```

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
3. **Minimum Rental Duration**: Minimum **4 hours** rental duration.
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

- **Backend**: TypeScript, Node.js, Express.js, MongoDB, Mongoose, Vitest, Supertest, mongodb-memory-server.
- **Frontend**: TypeScript, React 19, Vite, Tailwind CSS, Plus Jakarta Sans typography.

---

## 📑 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection with auto in-memory fallback
│   │   ├── models/             # VehicleCategory, Vehicle, RentalBooking, MaintenanceLog, FuelLog
│   │   ├── services/           # pricingService.ts (Core billing calculation)
│   │   ├── controllers/        # Category, Vehicle, Rental, Maintenance, Analytics
│   │   ├── routes/             # REST API routes
│   │   ├── seeds/              # Seed data for 52 vehicles & historical data
│   │   ├── tests/              # Vitest unit & integration test suites
│   │   ├── app.ts              # Express application factory
│   │   └── server.ts           # Server bootstrap
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/client.ts       # Fully typed API client
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Global navigation and real-time fleet chips
│   │   │   ├── AnalyticsTab.tsx       # Profitability, demand, repair, and fuel BI
│   │   │   ├── FleetTab.tsx           # Vehicle inventory, acquire & condemn modals
│   │   │   ├── RentalsTab.tsx         # Booking, dispatch, return & receipt modal
│   │   │   ├── RatesEstimatorTab.tsx  # Dynamic math estimator & tariff editor
│   │   │   └── MaintenanceTab.tsx     # Workshop repairs & fuel logs
│   │   ├── App.tsx             # Root layout and state coordination
│   │   └── main.tsx            # React 19 bootstrap
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── package.json
```

---

## 🧪 Edge Cases Covered

1. **Short Trips (< 4 Hours)**: Automatically enforces 4-hour floor.
2. **Dominant Rate Selection**: Automatically chooses whether KM or Duration yields higher charge.
3. **Rollback Prevention**: Rejects return odometer readings less than dispatch odometer.
4. **Advance vs Total Discrepancies**: Accurately computes refunds and additional payments.
5. **Night Halt Billing**: Adds ₹150 flat per night halt regardless of vehicle category.
6. **State Machine Integrity**: Rejects double dispatch or condemning an active vehicle.
