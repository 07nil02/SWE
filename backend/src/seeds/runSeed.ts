import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seedData.js';
import { VehicleCategory } from '../models/VehicleCategory.js';
import { Vehicle } from '../models/Vehicle.js';
import { RentalBooking } from '../models/RentalBooking.js';
import { MaintenanceLog } from '../models/MaintenanceLog.js';
import { FuelLog } from '../models/FuelLog.js';

async function main() {
  const force = process.argv.includes('--force') || process.argv.includes('-f');
  console.log(`[Seed CLI] Starting seed runner (force=${force})...`);

  try {
    const connectedUri = await connectDB();
    console.log(`[Seed CLI] Target DB: ${connectedUri.replace(/:([^:@]+)@/, ':****@')}`);

    await seedDatabase(force);

    // Detailed verification report
    const [categories, vehicles, rentals, maintenance, fuel] = await Promise.all([
      VehicleCategory.find().lean(),
      Vehicle.find().lean(),
      RentalBooking.find().lean(),
      MaintenanceLog.find().lean(),
      FuelLog.find().lean(),
    ]);

    console.log('\n================ FLEET DATABASE SEED REPORT ================');
    console.log(`✓ Vehicle Categories: ${categories.length}`);
    categories.forEach((cat) => {
      console.log(`   • ${cat.name.padEnd(16)} | Base Rate: ₹${cat.baseHourlyRate}/hr, ₹${cat.baseKmRate}/km | Capacity: ${cat.seatingCapacity} seats`);
    });

    console.log(`\n✓ Fleet Vehicles: ${vehicles.length} units enrolled`);
    const byCategory: Record<string, { nonAc: number; ac: number; available: number; repair: number; rented: number }> = {};
    for (const v of vehicles) {
      if (!byCategory[v.categoryName]) {
        byCategory[v.categoryName] = { nonAc: 0, ac: 0, available: 0, repair: 0, rented: 0 };
      }
      if (v.isAC) byCategory[v.categoryName].ac++;
      else byCategory[v.categoryName].nonAc++;

      if (v.status === 'AVAILABLE') byCategory[v.categoryName].available++;
      else if (v.status === 'UNDER_REPAIR') byCategory[v.categoryName].repair++;
      else if (v.status === 'RENTED_OUT') byCategory[v.categoryName].rented++;
    }

    for (const [name, stats] of Object.entries(byCategory)) {
      console.log(`   • ${name.padEnd(16)} | Non-AC: ${String(stats.nonAc).padStart(2)} | AC (+50%): ${String(stats.ac).padStart(2)} | Total: ${String(stats.nonAc + stats.ac).padStart(2)} [Ready: ${stats.available}, Repair: ${stats.repair}, Active: ${stats.rented}]`);
    }

    const totalRevenue = rentals.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
    const totalRepairCost = maintenance.reduce((acc, m) => acc + (m.cost || 0), 0);
    const totalFuelCost = fuel.reduce((acc, f) => acc + (f.totalCost || 0), 0);

    console.log(`\n✓ Rental Operations: ${rentals.length} bookings created`);
    console.log(`   • Settled Bookings: ${rentals.filter((r) => r.status === 'RETURNED_SETTLED').length} (Gross Revenue: ₹${totalRevenue.toLocaleString()})`);
    console.log(`   • Active Dispatches: ${rentals.filter((r) => r.status === 'DISPATCHED').length}`);

    console.log(`\n✓ Workshop & Maintenance: ${maintenance.length} work orders (Total Cost: ₹${totalRepairCost.toLocaleString()})`);
    console.log(`✓ Fuel Dispensation: ${fuel.length} fill-up logs (Total Cost: ₹${totalFuelCost.toLocaleString()})`);
    console.log('============================================================\n');

    console.log('🎉 Seeding and verification completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

main();
