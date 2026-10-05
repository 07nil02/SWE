import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from '../seeds/seedData.js';
import { Vehicle } from '../models/Vehicle.js';
import { VehicleCategory } from '../models/VehicleCategory.js';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';

describe('End-to-End Fleet Automation & Role-Based Access API Test Suite', () => {
  let app: any;
  let adminToken: string;
  let customerToken: string;
  let customerId: string;

  beforeAll(async () => {
    await connectDB();
    await seedDatabase(true);
    app = createApp();

    // Retrieve or generate tokens for testing
    const adminUser = await User.findOne({ email: 'admin@velocefleet.com' });
    const customerUser = await User.findOne({ email: 'customer@velocefleet.com' });

    customerId = customerUser!._id.toString();

    adminToken = generateToken({
      id: adminUser!._id.toString(),
      email: adminUser!.email,
      name: adminUser!.name,
      role: 'ADMIN',
    });

    customerToken = generateToken({
      id: customerUser!._id.toString(),
      email: customerUser!.email,
      name: customerUser!.name,
      role: 'CUSTOMER',
    });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Authentication & Two-Tier Access Roles', () => {
    it('POST /api/auth/register should register a new customer', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Anil Kapoor',
          email: 'anil.kapoor@example.com',
          password: 'password123',
          phone: '+91 98220 33445',
          drivingLicense: 'MH-01202200119',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('CUSTOMER');
      expect(res.body.token).toBeTruthy();
    });

    it('POST /api/auth/login should authenticate valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@velocefleet.com',
          password: 'admin123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('ADMIN');
      expect(res.body.token).toBeTruthy();
    });

    it('GET /api/auth/me should return current user profile with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('CUSTOMER');
    });

    it('POST /api/auth/demo-login should support 1-click evaluation access for ADMIN and CUSTOMER', async () => {
      const adminRes = await request(app).post('/api/auth/demo-login').send({ role: 'ADMIN' });
      expect(adminRes.status).toBe(200);
      expect(adminRes.body.user.role).toBe('ADMIN');

      const custRes = await request(app).post('/api/auth/demo-login').send({ role: 'CUSTOMER' });
      expect(custRes.status).toBe(200);
      expect(custRes.body.user.role).toBe('CUSTOMER');
    });
  });

  describe('2. Public Catalogue Inspection', () => {
    it('GET /api/categories should return all 5 required vehicle categories without auth', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(5);

      const categoryNames = res.body.data.map((c: any) => c.name);
      expect(categoryNames).toContain('Ambassador');
      expect(categoryNames).toContain('Tata Sumo');
      expect(categoryNames).toContain('Maruti Omni');
      expect(categoryNames).toContain('Maruti Esteem');
      expect(categoryNames).toContain('Mahindra Armada');
    });

    it('GET /api/vehicles should contain the seeded fleet composition without auth', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(52);
    });
  });

  describe('3. Role Access Segregation & Guardrails', () => {
    it('Customer should be REJECTED (403) from administrative dispatching', async () => {
      const res = await request(app)
        .post('/api/rentals/any-id/dispatch')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ startOdometer: 1000 });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('restricted to ADMIN');
    });

    it('Customer should be REJECTED (403) from accessing fleet analytics and BI', async () => {
      const res = await request(app)
        .get('/api/analytics/fleet-stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Customer should be REJECTED (403) from adding new vehicles to the fleet', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ registrationNumber: 'DL-HACK-0001' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Admin Fleet Management & Operations', () => {
    it('Admin can acquire and add a new vehicle to the fleet', async () => {
      const category = await VehicleCategory.findOne({ name: 'Tata Sumo' });
      const newVehicleData = {
        registrationNumber: 'DL-99-TEST-7788',
        categoryId: category!._id,
        isAC: true,
        purchasePrice: 650000,
        currentOdometer: 500,
        notes: 'Newly acquired high-capacity Sumo',
      };

      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newVehicleData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.registrationNumber).toBe('DL-99-TEST-7788');
      expect(res.body.data.status).toBe('AVAILABLE');
    });

    it('Admin can update vehicle status to UNDER_REPAIR and back to AVAILABLE', async () => {
      const vehicle = await Vehicle.findOne({ status: 'AVAILABLE', registrationNumber: 'DL-99-TEST-7788' });
      expect(vehicle).toBeTruthy();

      const toRepairRes = await request(app)
        .patch(`/api/vehicles/${vehicle!._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'UNDER_REPAIR', notes: 'Scheduled inspection' });
      expect(toRepairRes.status).toBe(200);
      expect(toRepairRes.body.data.status).toBe('UNDER_REPAIR');

      const toAvailRes = await request(app)
        .patch(`/api/vehicles/${vehicle!._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'AVAILABLE' });
      expect(toAvailRes.status).toBe(200);
      expect(toAvailRes.body.data.status).toBe('AVAILABLE');
    });

    it('Admin can condemn and sell off a vehicle', async () => {
      const vehicle = await Vehicle.findOne({ registrationNumber: 'DL-99-TEST-7788' });
      const res = await request(app)
        .post(`/api/vehicles/${vehicle!._id}/condemn`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ salvageValue: 85000, notes: 'Decommissioned test vehicle' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONDEMNED_SOLD');
      expect(res.body.data.salvageValue).toBe(85000);
    });
  });

  describe('5. Customer Booking & Dispatch Settlement Lifecycle', () => {
    let bookingId: string;

    it('Customer books an available vehicle with advance deposit', async () => {
      const car = await Vehicle.findOne({
        categoryName: 'Ambassador',
        isAC: false,
        status: 'AVAILABLE',
      });

      const bookRes = await request(app)
        .post('/api/rentals/book')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          customerName: 'Rajesh Sharma',
          customerPhone: '+91 98765 10001',
          customerLicense: 'DL-04202100889',
          vehicleId: car!._id,
          expectedReturnDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          advanceAmount: 1500,
          notes: 'City tour and airport pickup',
        });

      expect(bookRes.status).toBe(201);
      expect(bookRes.body.data.status).toBe('BOOKED');
      bookingId = bookRes.body.data._id;
    });

    it('Customer can query their personal reservations via /api/rentals/my-bookings', async () => {
      const res = await request(app)
        .get('/api/rentals/my-bookings')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
      expect(res.body.data.some((b: any) => b._id === bookingId)).toBe(true);
    });

    it('Admin dispatches vehicle, customer returns it, and bill settles with 4-hr floor & refund', async () => {
      const booking = await Vehicle.findOne({ registrationNumber: 'DL-01-AM-1001' });
      const currentOdo = booking ? booking.currentOdometer : 20000;

      // Dispatch
      const dispatchRes = await request(app)
        .post(`/api/rentals/${bookingId}/dispatch`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dispatchedAt: new Date().toISOString(),
          startOdometer: currentOdo,
        });

      expect(dispatchRes.status).toBe(200);
      expect(dispatchRes.body.data.status).toBe('DISPATCHED');

      // Return
      const returnRes = await request(app)
        .post(`/api/rentals/${bookingId}/return`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          actualReturnDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
          endOdometer: currentOdo + 20, // 20 km
          nightHalts: 0,
        });

      expect(returnRes.status).toBe(200);
      const calc = returnRes.body.data.calculationDetails;
      expect(calc.min4HourCharge).toBe(360); // 4 * 90
      expect(calc.totalAmount).toBe(360);
      expect(calc.settlementType).toBe('REFUND');
      expect(calc.settlementAmount).toBe(1140); // 1500 - 360
    });
  });

  describe('6. Maintenance, Fuel Logging & Analytics (Admin Only)', () => {
    it('Admin can log maintenance expense and fuel fill-up', async () => {
      const car = await Vehicle.findOne({ status: 'AVAILABLE' });

      const maintRes = await request(app)
        .post('/api/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vehicleId: car!._id,
          description: 'Clutch plate and cable renewal',
          cost: 3200,
          repairType: 'Routine Service',
          workshopName: 'Depot Repair Workshop',
        });
      expect(maintRes.status).toBe(201);

      const fuelRes = await request(app)
        .post('/api/fuel')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vehicleId: car!._id,
          liters: 35,
          costPerLiter: 92,
        });
      expect(fuelRes.status).toBe(201);
    });

    it('Admin can view comprehensive fleet profitability intelligence', async () => {
      const res = await request(app)
        .get('/api/analytics/fleet-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpis.totalVehicles).toBeGreaterThan(0);
      expect(res.body.data.categoryStatistics.length).toBe(5);
    });
  });
});
