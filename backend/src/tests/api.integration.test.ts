import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from '../seeds/seedData.js';
import { Vehicle } from '../models/Vehicle.js';
import { VehicleCategory } from '../models/VehicleCategory.js';

describe('End-to-End Fleet Automation API Test Suite', () => {
  let app: any;

  beforeAll(async () => {
    await connectDB();
    await seedDatabase();
    app = createApp();
  }, 45000);

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Categories & Rate Cards', () => {
    it('GET /api/categories should return all 5 required vehicle categories with pricing info', async () => {
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

      // Check Ambassador rates: Non-AC 90/hr, 12/km. AC: 135/hr, 18/km
      const ambassador = res.body.data.find((c: any) => c.name === 'Ambassador');
      expect(ambassador.baseHourlyRate).toBe(90);
      expect(ambassador.baseKmRate).toBe(12);
      expect(ambassador.acHourlyRate).toBe(135);
      expect(ambassador.acKmRate).toBe(18);
      expect(ambassador.minNonAcCharge).toBe(360); // 4 * 90
      expect(ambassador.minAcCharge).toBe(540);     // 4 * 135
    });
  });

  describe('2. Fleet Inventory & Composition Verification', () => {
    it('GET /api/vehicles should contain the seeded fleet composition', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(52);

      // Verify Ambassadors: 10 Non-AC, 2 AC
      const ambassadors = res.body.data.filter((v: any) => v.categoryName === 'Ambassador');
      expect(ambassadors.length).toBe(12);
      expect(ambassadors.filter((v: any) => v.isAC).length).toBe(2);
      expect(ambassadors.filter((v: any) => !v.isAC).length).toBe(10);

      // Verify Maruti Esteem: 10 AC
      const esteems = res.body.data.filter((v: any) => v.categoryName === 'Maruti Esteem');
      expect(esteems.length).toBe(10);
      expect(esteems.every((v: any) => v.isAC)).toBe(true);
    });

    it('POST /api/vehicles should allow acquiring and adding a new vehicle to the fleet', async () => {
      const category = await VehicleCategory.findOne({ name: 'Tata Sumo' });
      const newVehicleData = {
        registrationNumber: 'DL-99-TEST-7788',
        categoryId: category!._id,
        isAC: true,
        purchasePrice: 650000,
        currentOdometer: 500,
        notes: 'Newly acquired high-capacity Sumo',
      };

      const res = await request(app).post('/api/vehicles').send(newVehicleData);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.registrationNumber).toBe('DL-99-TEST-7788');
      expect(res.body.data.status).toBe('AVAILABLE');
    });

    it('PATCH /api/vehicles/:id/status should update vehicle status to UNDER_REPAIR and back to AVAILABLE', async () => {
      const vehicle = await Vehicle.findOne({ status: 'AVAILABLE', registrationNumber: 'DL-99-TEST-7788' });
      expect(vehicle).toBeTruthy();

      // Move to repair
      const toRepairRes = await request(app)
        .patch(`/api/vehicles/${vehicle!._id}/status`)
        .send({ status: 'UNDER_REPAIR', notes: 'Scheduled inspection' });
      expect(toRepairRes.status).toBe(200);
      expect(toRepairRes.body.data.status).toBe('UNDER_REPAIR');

      // Back to available
      const toAvailRes = await request(app)
        .patch(`/api/vehicles/${vehicle!._id}/status`)
        .send({ status: 'AVAILABLE' });
      expect(toAvailRes.status).toBe(200);
      expect(toAvailRes.body.data.status).toBe('AVAILABLE');
    });

    it('POST /api/vehicles/:id/condemn should condemn and sell off a vehicle', async () => {
      const vehicle = await Vehicle.findOne({ registrationNumber: 'DL-99-TEST-7788' });
      const res = await request(app)
        .post(`/api/vehicles/${vehicle!._id}/condemn`)
        .send({ salvageValue: 85000, notes: 'Decommissioned test vehicle' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONDEMNED_SOLD');
      expect(res.body.data.salvageValue).toBe(85000);
    });
  });

  describe('3. Rental Lifecycle: Booking -> Dispatch -> Return & Settlement', () => {
    it('Full Rental Cycle with 4-Hour Minimum & Refund Scenario', async () => {
      // Find an available Non-AC Ambassador (base: Rs 90/hr, Rs 12/km)
      const car = await Vehicle.findOne({
        categoryName: 'Ambassador',
        isAC: false,
        status: 'AVAILABLE',
      });
      expect(car).toBeTruthy();

      // Step 1: Customer books car with Rs. 1000 advance
      const bookRes = await request(app).post('/api/rentals/book').send({
        customerName: 'Rahul Mehra',
        customerPhone: '+91 98111 22233',
        customerLicense: 'DL-TEST-9988',
        vehicleId: car!._id,
        expectedReturnDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        advanceAmount: 1000,
        notes: 'City local trip',
      });

      expect(bookRes.status).toBe(201);
      const booking = bookRes.body.data;
      expect(booking.status).toBe('BOOKED');
      expect(booking.advanceAmount).toBe(1000);
      expect(booking.hourlyRate).toBe(90);
      expect(booking.kmRate).toBe(12);

      // Step 2: Dispatch car (start odometer = 20,000 km, dispatched 2 hours ago)
      const dispatchTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const dispatchRes = await request(app).post(`/api/rentals/${booking._id}/dispatch`).send({
        dispatchedAt: dispatchTime.toISOString(),
        startOdometer: car!.currentOdometer,
      });

      expect(dispatchRes.status).toBe(200);
      expect(dispatchRes.body.data.status).toBe('DISPATCHED');

      // Vehicle must now be RENTED_OUT
      const dispatchedCar = await Vehicle.findById(car!._id);
      expect(dispatchedCar!.status).toBe('RENTED_OUT');

      // Step 3: Return car after 2 hours (under 4 hrs floor!) and only 15 km run
      // Hourly = 2 * 90 = 180. Km = 15 * 12 = 180.
      // Max = 180.
      // But minimum 4 hours = 4 * 90 = 360!
      // Total amount = 360.
      // Advance = 1000.
      // Settlement = REFUND of 1000 - 360 = 640.
      const returnTime = new Date();
      const endMeter = car!.currentOdometer + 15;

      const returnRes = await request(app).post(`/api/rentals/${booking._id}/return`).send({
        actualReturnDate: returnTime.toISOString(),
        endOdometer: endMeter,
        nightHalts: 0,
      });

      expect(returnRes.status).toBe(200);
      const returnedData = returnRes.body.data.booking;
      const calc = returnRes.body.data.calculationDetails;

      expect(calc.min4HourCharge).toBe(360);
      expect(calc.usageCharge).toBe(360); // Enforced 4 hour minimum
      expect(calc.totalAmount).toBe(360);
      expect(calc.settlementType).toBe('REFUND');
      expect(calc.settlementAmount).toBe(640);

      // Vehicle must be released back to AVAILABLE and odometer updated
      const releasedCar = await Vehicle.findById(car!._id);
      expect(releasedCar!.status).toBe('AVAILABLE');
      expect(releasedCar!.currentOdometer).toBe(endMeter);
    });

    it('Full Rental Cycle where KM Charge dominates + Night Halts + Additional Payment Due', async () => {
      // Find an available AC Tata Sumo (Base: 120/hr, 15/km. AC: 180/hr, 22.50/km)
      const car = await Vehicle.findOne({
        categoryName: 'Tata Sumo',
        isAC: true,
        status: 'AVAILABLE',
      });
      expect(car).toBeTruthy();

      // Book car with Rs. 3000 advance
      const bookRes = await request(app).post('/api/rentals/book').send({
        customerName: 'Kunal Kapoor',
        customerPhone: '+91 97777 55555',
        vehicleId: car!._id,
        expectedReturnDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        advanceAmount: 3000,
      });

      const booking = bookRes.body.data;
      const startMeter = car!.currentOdometer;
      const dispatchTime = new Date(Date.now() - 30 * 60 * 60 * 1000); // 30 hours ago

      await request(app).post(`/api/rentals/${booking._id}/dispatch`).send({
        dispatchedAt: dispatchTime.toISOString(),
        startOdometer: startMeter,
      });

      // Customer returns car:
      // Distance = 400 km
      // Night halts = 2 (2 * 150 = 300)
      // Hourly: 30 hrs * 180 = 5400
      // Km: 400 km * 22.50 = 9000 (KM charge dominates!)
      // Usage charge = 9000
      // Night halt charge = 300
      // Total = 9300
      // Advance = 3000
      // Difference = 3000 - 9300 = -6300 -> Customer pays ADDITIONAL 6300!
      const endMeter = startMeter + 400;
      const returnRes = await request(app).post(`/api/rentals/${booking._id}/return`).send({
        actualReturnDate: new Date().toISOString(),
        endOdometer: endMeter,
        nightHalts: 2,
      });

      expect(returnRes.status).toBe(200);
      const calc = returnRes.body.data.calculationDetails;
      expect(calc.effectiveHourlyRate).toBe(180);
      expect(calc.effectiveKmRate).toBe(22.5);
      expect(calc.hourlyCharge).toBe(5400);
      expect(calc.kmCharge).toBe(9000);
      expect(calc.usageCharge).toBe(9000);
      expect(calc.nightHaltCharge).toBe(300);
      expect(calc.totalAmount).toBe(9300);
      expect(calc.settlementType).toBe('ADDITIONAL_PAYMENT');
      expect(calc.settlementAmount).toBe(6300);
    });

    it('Edge Case: Return end odometer less than start odometer must be rejected with 400', async () => {
      const car = await Vehicle.findOne({ status: 'AVAILABLE' });
      const bookRes = await request(app).post('/api/rentals/book').send({
        customerName: 'Error Tester',
        customerPhone: '+91 91234 56789',
        vehicleId: car!._id,
        expectedReturnDate: new Date(Date.now() + 500000).toISOString(),
        advanceAmount: 1000,
      });

      const booking = bookRes.body.data;
      await request(app).post(`/api/rentals/${booking._id}/dispatch`).send({
        startOdometer: 50000,
      });

      // Attempt to return with odometer 49900 (meter rolled back!)
      const invalidReturn = await request(app).post(`/api/rentals/${booking._id}/return`).send({
        endOdometer: 49900,
      });

      expect(invalidReturn.status).toBe(400);
      expect(invalidReturn.body.success).toBe(false);
      expect(invalidReturn.body.message).toContain('cannot be less than starting reading');
    });
  });

  describe('4. Maintenance & Fuel Logging', () => {
    it('POST /api/maintenance should log repair cost and optionally set car to UNDER_REPAIR', async () => {
      const car = await Vehicle.findOne({ status: 'AVAILABLE' });
      const res = await request(app).post('/api/maintenance').send({
        vehicleId: car!._id,
        description: 'Brake pad replacement and wheel alignment',
        cost: 3200,
        workshop: 'City Auto Care',
        repairType: 'Routine Service',
        setUnderRepair: true,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.cost).toBe(3200);

      const updatedCar = await Vehicle.findById(car!._id);
      expect(updatedCar!.status).toBe('UNDER_REPAIR');
    });

    it('POST /api/fuel should log fuel liters, rate, total cost, and update odometer', async () => {
      const car = await Vehicle.findOne({ status: 'AVAILABLE' });
      const nextMeter = car!.currentOdometer + 120;
      const res = await request(app).post('/api/fuel').send({
        vehicleId: car!._id,
        liters: 35,
        costPerLiter: 92,
        odometerAtFill: nextMeter,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.liters).toBe(35);
      expect(res.body.data.totalCost).toBe(3220); // 35 * 92

      const updatedCar = await Vehicle.findById(car!._id);
      expect(updatedCar!.currentOdometer).toBe(nextMeter);
    });
  });

  describe('5. Fleet Statistics & Analytics Pipeline', () => {
    it('GET /api/analytics/fleet-stats should aggregate demand, revenue, repairs, fuel, and profitability', async () => {
      const res = await request(app).get('/api/analytics/fleet-stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { kpis, categoryStatistics } = res.body.data;
      expect(kpis.totalVehicles).toBeGreaterThanOrEqual(47);
      expect(kpis.totalFleetRevenue).toBeGreaterThan(0);
      expect(categoryStatistics.length).toBe(5);

      // Check each category has price, repairs, demand, revenue, fuel, netProfit, recommendation
      for (const stat of categoryStatistics) {
        expect(stat.avgPurchasePrice).toBeGreaterThan(0);
        expect(typeof stat.totalRepairExpense).toBe('number');
        expect(typeof stat.demandBookingsCount).toBe('number');
        expect(typeof stat.totalRevenue).toBe('number');
        expect(typeof stat.netProfit).toBe('number');
        expect(stat.recommendation).toBeTruthy();
      }
    });
  });
});
