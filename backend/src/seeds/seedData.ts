import { VehicleCategory } from '../models/VehicleCategory.js';
import { Vehicle } from '../models/Vehicle.js';
import { RentalBooking } from '../models/RentalBooking.js';
import { MaintenanceLog } from '../models/MaintenanceLog.js';
import { FuelLog } from '../models/FuelLog.js';
import { calculateRentalCharges } from '../services/pricingService.js';

export async function seedDatabase(force: boolean = false) {
  const existingCount = await VehicleCategory.countDocuments();
  if (force) {
    console.log('[Seed] Force re-seed active: resetting existing fleet collections...');
    await Promise.all([
      VehicleCategory.deleteMany({}),
      Vehicle.deleteMany({}),
      RentalBooking.deleteMany({}),
      MaintenanceLog.deleteMany({}),
      FuelLog.deleteMany({}),
    ]);
  } else if (existingCount > 0) {
    console.log(`[Seed] Database already contains ${existingCount} categories. Skipping re-seeding.`);
    return;
  }

  console.log('[Seed] Initializing categories and fleet inventory...');

  // 1. Categories
  const categoriesData = [
    {
      name: 'Ambassador',
      baseHourlyRate: 90,
      baseKmRate: 12,
      seatingCapacity: 5,
      fuelType: 'Diesel' as const,
      description: 'Classic durable sedan for long trips and city tours',
    },
    {
      name: 'Tata Sumo',
      baseHourlyRate: 120,
      baseKmRate: 15,
      seatingCapacity: 9,
      fuelType: 'Diesel' as const,
      description: 'Spacious high-capacity multi-utility vehicle',
    },
    {
      name: 'Maruti Omni',
      baseHourlyRate: 75,
      baseKmRate: 10,
      seatingCapacity: 8,
      fuelType: 'Petrol' as const,
      description: 'Economical versatile van for family and utility travel',
    },
    {
      name: 'Maruti Esteem',
      baseHourlyRate: 110,
      baseKmRate: 14,
      seatingCapacity: 5,
      fuelType: 'Petrol' as const,
      description: 'Comfortable executive sedan with smooth ride quality',
    },
    {
      name: 'Mahindra Armada',
      baseHourlyRate: 115,
      baseKmRate: 14,
      seatingCapacity: 8,
      fuelType: 'Diesel' as const,
      description: 'Rugged tough SUV for outstation and rough terrains',
    },
  ];

  const categoryMap = new Map();
  for (const cat of categoriesData) {
    const created = await VehicleCategory.create(cat);
    categoryMap.set(cat.name, created);
  }

  // 2. Vehicles creation according to exact problem statement:
  // Ambassadors : 10 Non-AC, 2 AC
  // Tata Sumo : 5 Non-AC, 5 AC
  // Maruti Omni : 10 Non-AC
  // Maruti Esteem : 10 AC
  // Mahindra Armada : 10 Non-AC
  interface FleetSpec {
    categoryName: string;
    nonAcCount: number;
    acCount: number;
    regPrefix: string;
    purchasePrice: number;
  }

  const fleetSpecs: FleetSpec[] = [
    { categoryName: 'Ambassador', nonAcCount: 10, acCount: 2, regPrefix: 'DL-01-AM', purchasePrice: 420000 },
    { categoryName: 'Tata Sumo', nonAcCount: 5, acCount: 5, regPrefix: 'DL-02-TS', purchasePrice: 620000 },
    { categoryName: 'Maruti Omni', nonAcCount: 10, acCount: 0, regPrefix: 'DL-03-MO', purchasePrice: 280000 },
    { categoryName: 'Maruti Esteem', nonAcCount: 0, acCount: 10, regPrefix: 'DL-04-ME', purchasePrice: 540000 },
    { categoryName: 'Mahindra Armada', nonAcCount: 10, acCount: 0, regPrefix: 'DL-05-MA', purchasePrice: 580000 },
  ];

  const allVehicles = [];

  for (const spec of fleetSpecs) {
    const cat = categoryMap.get(spec.categoryName);
    let serial = 1001;

    // Non-AC vehicles
    for (let i = 0; i < spec.nonAcCount; i++) {
      allVehicles.push({
        registrationNumber: `${spec.regPrefix}-${serial++}`,
        category: cat._id,
        categoryName: cat.name,
        isAC: false,
        status: 'AVAILABLE' as 'AVAILABLE' | 'RENTED_OUT' | 'UNDER_REPAIR' | 'CONDEMNED_SOLD',
        purchasePrice: spec.purchasePrice,
        purchaseDate: new Date('2024-01-15'),
        currentOdometer: Math.floor(15000 + Math.random() * 25000),
      });
    }

    // AC vehicles
    for (let i = 0; i < spec.acCount; i++) {
      allVehicles.push({
        registrationNumber: `${spec.regPrefix}-${serial++}`,
        category: cat._id,
        categoryName: cat.name,
        isAC: true,
        status: 'AVAILABLE' as 'AVAILABLE' | 'RENTED_OUT' | 'UNDER_REPAIR' | 'CONDEMNED_SOLD',
        purchasePrice: spec.purchasePrice + 35000,
        purchaseDate: new Date('2024-02-10'),
        currentOdometer: Math.floor(12000 + Math.random() * 20000),
      });
    }
  }

  // Put a few vehicles in UNDER_REPAIR or RENTED_OUT to showcase live state handling
  allVehicles[2].status = 'UNDER_REPAIR';
  allVehicles[14].status = 'UNDER_REPAIR';

  const insertedVehicles = await Vehicle.insertMany(allVehicles);
  console.log(`[Seed] Seeded ${insertedVehicles.length} vehicles matching exact fleet requirements.`);

  // 3. Historical Bookings & Active Bookings
  const customerNames = [
    'Rajesh Sharma', 'Priya Patel', 'Amit Verma', 'Sunita Rao',
    'Vikram Malhotra', 'Ananya Gupta', 'Deepak Joshi', 'Kavita Mehta'
  ];

  // Completed bookings for analytics
  let bookingIndex = 1001;
  const historicalBookings = [];

  for (let i = 0; i < 15; i++) {
    const v = insertedVehicles[i % insertedVehicles.length];
    const cat = categoryMap.get(v.categoryName);
    const hoursUsed = 5 + (i * 3) % 20; // 5 to 24 hrs
    const distanceKm = 60 + (i * 35) % 350; // 60 to 380 km
    const nightHalts = hoursUsed > 24 ? 1 : (i % 5 === 0 ? 1 : 0);
    const advanceAmount = 2500 + (i % 4) * 1000;

    const pricing = calculateRentalCharges({
      baseHourlyRate: cat.baseHourlyRate,
      baseKmRate: cat.baseKmRate,
      isAC: v.isAC,
      hoursUsed,
      distanceKm,
      nightHalts,
      advanceAmount,
    });

    const bookingDate = new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000);
    const dispatchedAt = bookingDate;
    const actualReturnDate = new Date(dispatchedAt.getTime() + hoursUsed * 60 * 60 * 1000);

    historicalBookings.push({
      bookingNumber: `BK-${bookingIndex++}`,
      customerName: customerNames[i % customerNames.length],
      customerPhone: `+91 98765 ${10000 + i}`,
      customerLicense: `DL-${1000000 + i}`,
      vehicle: v._id,
      vehicleReg: v.registrationNumber,
      categoryName: v.categoryName,
      isAC: v.isAC,
      hourlyRate: pricing.effectiveHourlyRate,
      kmRate: pricing.effectiveKmRate,
      advanceAmount,
      bookingDate,
      expectedReturnDate: actualReturnDate,
      dispatchedAt,
      startOdometer: v.currentOdometer - distanceKm - 100,
      actualReturnDate,
      endOdometer: v.currentOdometer - 100,
      distanceKm,
      durationHours: hoursUsed,
      nightHalts,
      hourlyChargeAmount: pricing.hourlyCharge,
      kmChargeAmount: pricing.kmCharge,
      minChargeAmount: pricing.min4HourCharge,
      nightHaltCharge: pricing.nightHaltCharge,
      totalAmount: pricing.totalAmount,
      settlementType: pricing.settlementType,
      settlementAmount: pricing.settlementAmount,
      status: 'RETURNED_SETTLED' as const,
      notes: 'Trip completed and settled successfully.',
    });
  }

  await RentalBooking.insertMany(historicalBookings);

  // 4. One currently active rental
  const activeCar = insertedVehicles[5]; // Tata Sumo AC
  const activeCat = categoryMap.get(activeCar.categoryName);
  activeCar.status = 'RENTED_OUT';
  await activeCar.save();

  const dispatchedAt = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const expectedReturnDate = new Date(Date.now() + 18 * 60 * 60 * 1000);

  await RentalBooking.create({
    bookingNumber: `BK-${bookingIndex++}`,
    customerName: 'Sanjay Deshmukh',
    customerPhone: '+91 99887 66554',
    customerLicense: 'MH-14-20180029',
    vehicle: activeCar._id,
    vehicleReg: activeCar.registrationNumber,
    categoryName: activeCar.categoryName,
    isAC: activeCar.isAC,
    hourlyRate: activeCar.isAC ? activeCat.baseHourlyRate * 1.5 : activeCat.baseHourlyRate,
    kmRate: activeCar.isAC ? activeCat.baseKmRate * 1.5 : activeCat.baseKmRate,
    advanceAmount: 4000,
    bookingDate: dispatchedAt,
    expectedReturnDate,
    dispatchedAt,
    startOdometer: activeCar.currentOdometer,
    nightHalts: 1,
    status: 'DISPATCHED',
    notes: 'Outstation business trip to Jaipur.',
  });

  // 5. Maintenance records
  const maintenanceData = [
    { vehicle: insertedVehicles[0]._id, vehicleReg: insertedVehicles[0].registrationNumber, categoryName: 'Ambassador', cost: 4500, description: 'Engine oil replacement, brake shoe adjustment', repairType: 'Routine Service' as const },
    { vehicle: insertedVehicles[2]._id, vehicleReg: insertedVehicles[2].registrationNumber, categoryName: 'Ambassador', cost: 12000, description: 'Gearbox synchronizer replacement', repairType: 'Major Overhaul' as const },
    { vehicle: insertedVehicles[10]._id, vehicleReg: insertedVehicles[10].registrationNumber, categoryName: 'Tata Sumo', cost: 8500, description: 'Suspension bush replacement and alignment', repairType: 'Routine Service' as const },
    { vehicle: insertedVehicles[14]._id, vehicleReg: insertedVehicles[14].registrationNumber, categoryName: 'Tata Sumo', cost: 15500, description: 'Radiator replacement and coolant leak fix', repairType: 'Major Overhaul' as const },
    { vehicle: insertedVehicles[22]._id, vehicleReg: insertedVehicles[22].registrationNumber, categoryName: 'Maruti Omni', cost: 3200, description: 'Clutch cable change & battery health service', repairType: 'Routine Service' as const },
    { vehicle: insertedVehicles[32]._id, vehicleReg: insertedVehicles[32].registrationNumber, categoryName: 'Maruti Esteem', cost: 6800, description: 'AC gas refill and compressor coil service', repairType: 'AC Repair' as const },
    { vehicle: insertedVehicles[42]._id, vehicleReg: insertedVehicles[42].registrationNumber, categoryName: 'Mahindra Armada', cost: 9500, description: 'Rear axle leaf spring reinforcement', repairType: 'Routine Service' as const },
  ];
  await MaintenanceLog.insertMany(maintenanceData);

  // 6. Fuel logs
  const fuelData = [
    { vehicle: insertedVehicles[0]._id, vehicleReg: insertedVehicles[0].registrationNumber, categoryName: 'Ambassador', liters: 40, costPerLiter: 89, totalCost: 3560 },
    { vehicle: insertedVehicles[1]._id, vehicleReg: insertedVehicles[1].registrationNumber, categoryName: 'Ambassador', liters: 45, costPerLiter: 89, totalCost: 4005 },
    { vehicle: insertedVehicles[10]._id, vehicleReg: insertedVehicles[10].registrationNumber, categoryName: 'Tata Sumo', liters: 60, costPerLiter: 89, totalCost: 5340 },
    { vehicle: insertedVehicles[11]._id, vehicleReg: insertedVehicles[11].registrationNumber, categoryName: 'Tata Sumo', liters: 55, costPerLiter: 89, totalCost: 4895 },
    { vehicle: insertedVehicles[20]._id, vehicleReg: insertedVehicles[20].registrationNumber, categoryName: 'Maruti Omni', liters: 30, costPerLiter: 96, totalCost: 2880 },
    { vehicle: insertedVehicles[30]._id, vehicleReg: insertedVehicles[30].registrationNumber, categoryName: 'Maruti Esteem', liters: 40, costPerLiter: 96, totalCost: 3840 },
    { vehicle: insertedVehicles[40]._id, vehicleReg: insertedVehicles[40].registrationNumber, categoryName: 'Mahindra Armada', liters: 50, costPerLiter: 89, totalCost: 4450 },
  ];
  await FuelLog.insertMany(fuelData);

  console.log('[Seed] Seeding completed successfully!');
}
