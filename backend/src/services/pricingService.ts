export interface PricingInput {
  baseHourlyRate: number;
  baseKmRate: number;
  isAC: boolean;
  hoursUsed: number;
  distanceKm: number;
  nightHalts: number;
  advanceAmount: number;
}

export interface PricingResult {
  effectiveHourlyRate: number;
  effectiveKmRate: number;
  hoursUsed: number;
  distanceKm: number;
  nightHalts: number;
  hourlyCharge: number;
  kmCharge: number;
  maxCharge: number;
  min4HourCharge: number;
  usageCharge: number;
  nightHaltCharge: number;
  totalAmount: number;
  advanceAmount: number;
  settlementType: 'REFUND' | 'ADDITIONAL_PAYMENT' | 'EXACT';
  settlementAmount: number;
  breakdown: string;
}

/**
 * Calculates rental charges based on the official business rules:
 * 1. Base per hour and per km charge.
 * 2. AC vehicle is charged 50% more (1.5x) on both rates.
 * 3. Chargeable amount = max(hours * hourlyRate, km * kmRate),
 *    subject to a minimum amount decided by 4 hours use of the car.
 * 4. Rs 150 for every night halt regardless of vehicle type.
 * 5. Settlement: compare totalAmount to advanceAmount -> Refund or Additional payment.
 */
export function calculateRentalCharges(input: PricingInput): PricingResult {
  const {
    baseHourlyRate,
    baseKmRate,
    isAC,
    hoursUsed,
    distanceKm,
    nightHalts,
    advanceAmount,
  } = input;

  if (isNaN(hoursUsed) || hoursUsed < 0) throw new Error('Rental duration must be a valid non-negative number');
  if (isNaN(distanceKm) || distanceKm < 0) throw new Error('Distance must be a valid non-negative number');
  if (isNaN(nightHalts) || nightHalts < 0) throw new Error('Night halts must be a valid non-negative number');
  if (isNaN(advanceAmount) || advanceAmount < 0) throw new Error('Advance amount must be a valid non-negative number');
  if (isNaN(baseHourlyRate) || baseHourlyRate <= 0) throw new Error('Base hourly rate must be a positive number');
  if (isNaN(baseKmRate) || baseKmRate <= 0) throw new Error('Base km rate must be a positive number');

  // AC vehicle is charged 50% more
  const acMultiplier = isAC ? 1.5 : 1.0;
  const effectiveHourlyRate = Number((baseHourlyRate * acMultiplier).toFixed(2));
  const effectiveKmRate = Number((baseKmRate * acMultiplier).toFixed(2));

  // Minimum rental charge for 4 hours
  const min4HourCharge = Number((4 * effectiveHourlyRate).toFixed(2));

  // Chargeable calculations
  const hourlyCharge = Number((hoursUsed * effectiveHourlyRate).toFixed(2));
  const kmCharge = Number((distanceKm * effectiveKmRate).toFixed(2));

  // Maximum of per hour charge and per km charge
  const maxCharge = Math.max(hourlyCharge, kmCharge);

  // Subject to minimum 4 hours charge
  const usageCharge = Math.max(maxCharge, min4HourCharge);

  // Night halt charges (Rs 150 per night halt)
  const nightHaltRate = 150;
  const nightHaltCharge = nightHalts * nightHaltRate;

  // Final Total
  const totalAmount = Number((usageCharge + nightHaltCharge).toFixed(2));

  // Settlement calculation
  const diff = Number((advanceAmount - totalAmount).toFixed(2));
  let settlementType: 'REFUND' | 'ADDITIONAL_PAYMENT' | 'EXACT';
  let settlementAmount = 0;

  if (diff > 0) {
    settlementType = 'REFUND';
    settlementAmount = diff;
  } else if (diff < 0) {
    settlementType = 'ADDITIONAL_PAYMENT';
    settlementAmount = Math.abs(diff);
  } else {
    settlementType = 'EXACT';
    settlementAmount = 0;
  }

  let dominantFactor = '';
  if (usageCharge === min4HourCharge && maxCharge < min4HourCharge) {
    dominantFactor = 'Minimum 4-hour floor applied';
  } else if (hourlyCharge >= kmCharge) {
    dominantFactor = 'Hourly rate dominated';
  } else {
    dominantFactor = 'Kilometer rate dominated';
  }

  const breakdown = `Rates: Rs. ${effectiveHourlyRate}/hr, Rs. ${effectiveKmRate}/km (${isAC ? 'AC: 50% surcharge' : 'Non-AC'}). ` +
    `Hours: ${hoursUsed} hrs (Rs. ${hourlyCharge}), KM: ${distanceKm} km (Rs. ${kmCharge}). ` +
    `Selected Usage Charge: Rs. ${usageCharge} (${dominantFactor}, min 4-hr floor: Rs. ${min4HourCharge}). ` +
    `Night Halts: ${nightHalts} @ Rs. 150 = Rs. ${nightHaltCharge}. ` +
    `Total: Rs. ${totalAmount}. Advance: Rs. ${advanceAmount}. Result: ${settlementType} of Rs. ${settlementAmount}.`;

  return {
    effectiveHourlyRate,
    effectiveKmRate,
    hoursUsed,
    distanceKm,
    nightHalts,
    hourlyCharge,
    kmCharge,
    maxCharge,
    min4HourCharge,
    usageCharge,
    nightHaltCharge,
    totalAmount,
    advanceAmount,
    settlementType,
    settlementAmount,
    breakdown,
  };
}
