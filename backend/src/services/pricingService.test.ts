import { describe, it, expect } from 'vitest';
import { calculateRentalCharges } from './pricingService.js';

describe('Pricing Calculation Service - Business Logic Verification', () => {
  const baseCategory = {
    baseHourlyRate: 100, // Non-AC Rs 100/hr
    baseKmRate: 12,       // Non-AC Rs 12/km
  };

  it('Case 1: Should enforce minimum 4-hour floor when duration is under 4 hours and km is low', () => {
    // 2 hours, 10 km on Non-AC.
    // Hourly: 2 * 100 = 200
    // Km: 10 * 12 = 120
    // Max is 200, but 4-hour min is 4 * 100 = 400.
    // Total should be 400.
    const result = calculateRentalCharges({
      baseHourlyRate: baseCategory.baseHourlyRate,
      baseKmRate: baseCategory.baseKmRate,
      isAC: false,
      hoursUsed: 2,
      distanceKm: 10,
      nightHalts: 0,
      advanceAmount: 500,
    });

    expect(result.effectiveHourlyRate).toBe(100);
    expect(result.effectiveKmRate).toBe(12);
    expect(result.min4HourCharge).toBe(400);
    expect(result.usageCharge).toBe(400);
    expect(result.totalAmount).toBe(400);
    expect(result.settlementType).toBe('REFUND');
    expect(result.settlementAmount).toBe(100); // 500 - 400 = 100 refund
  });

  it('Case 2: Should charge based on KM when KM charge is higher than Hourly charge', () => {
    // 5 hours, 100 km on Non-AC.
    // Hourly: 5 * 100 = 500
    // Km: 100 * 12 = 1200
    // 4-hr min: 400
    // Max is 1200 (> 400)
    // Total: 1200. Advance: 1000. Customer pays 200 additional.
    const result = calculateRentalCharges({
      baseHourlyRate: 100,
      baseKmRate: 12,
      isAC: false,
      hoursUsed: 5,
      distanceKm: 100,
      nightHalts: 0,
      advanceAmount: 1000,
    });

    expect(result.hourlyCharge).toBe(500);
    expect(result.kmCharge).toBe(1200);
    expect(result.usageCharge).toBe(1200);
    expect(result.totalAmount).toBe(1200);
    expect(result.settlementType).toBe('ADDITIONAL_PAYMENT');
    expect(result.settlementAmount).toBe(200);
  });

  it('Case 3: Should charge based on Hours when Hourly charge is higher than KM charge', () => {
    // 10 hours, 30 km on Non-AC.
    // Hourly: 10 * 100 = 1000
    // Km: 30 * 12 = 360
    // Max: 1000
    // Total: 1000
    const result = calculateRentalCharges({
      baseHourlyRate: 100,
      baseKmRate: 12,
      isAC: false,
      hoursUsed: 10,
      distanceKm: 30,
      nightHalts: 0,
      advanceAmount: 1000,
    });

    expect(result.hourlyCharge).toBe(1000);
    expect(result.kmCharge).toBe(360);
    expect(result.usageCharge).toBe(1000);
    expect(result.totalAmount).toBe(1000);
    expect(result.settlementType).toBe('EXACT');
    expect(result.settlementAmount).toBe(0);
  });

  it('Case 4: AC vehicles should be charged 50% more on both hourly and km rates', () => {
    // Non-AC: 100/hr, 12/km
    // AC: 150/hr, 18/km
    // 6 hours, 60 km
    // Hourly: 6 * 150 = 900
    // Km: 60 * 18 = 1080
    // Max: 1080
    // Min 4-hr: 4 * 150 = 600
    // Usage: 1080
    const result = calculateRentalCharges({
      baseHourlyRate: 100,
      baseKmRate: 12,
      isAC: true,
      hoursUsed: 6,
      distanceKm: 60,
      nightHalts: 0,
      advanceAmount: 1080,
    });

    expect(result.effectiveHourlyRate).toBe(150);
    expect(result.effectiveKmRate).toBe(18);
    expect(result.min4HourCharge).toBe(600);
    expect(result.usageCharge).toBe(1080);
    expect(result.totalAmount).toBe(1080);
  });

  it('Case 5: Should accurately add Rs 150 per night halt regardless of vehicle type', () => {
    // 48 hours, 200 km, 2 night halts on AC vehicle
    // Hourly: 48 * 150 = 7200
    // Km: 200 * 18 = 3600
    // Usage: 7200
    // Night halts: 2 * 150 = 300
    // Total: 7200 + 300 = 7500
    // Advance: 8000 -> Refund 500
    const result = calculateRentalCharges({
      baseHourlyRate: 100,
      baseKmRate: 12,
      isAC: true,
      hoursUsed: 48,
      distanceKm: 200,
      nightHalts: 2,
      advanceAmount: 8000,
    });

    expect(result.nightHaltCharge).toBe(300);
    expect(result.totalAmount).toBe(7500);
    expect(result.settlementType).toBe('REFUND');
    expect(result.settlementAmount).toBe(500);
  });

  it('Case 6: Should reject negative inputs', () => {
    expect(() => calculateRentalCharges({
      baseHourlyRate: 100,
      baseKmRate: 12,
      isAC: false,
      hoursUsed: -1,
      distanceKm: 10,
      nightHalts: 0,
      advanceAmount: 500,
    })).toThrow();
  });
});
