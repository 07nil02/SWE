import { Request, Response } from 'express';
import { VehicleCategory } from '../models/VehicleCategory.js';
import { Vehicle } from '../models/Vehicle.js';
import { RentalBooking } from '../models/RentalBooking.js';
import { MaintenanceLog } from '../models/MaintenanceLog.js';
import { FuelLog } from '../models/FuelLog.js';

export async function getFleetStatistics(req: Request, res: Response) {
  try {
    const categories = await VehicleCategory.find().sort({ name: 1 });

    // High-level fleet KPIs
    const totalVehicles = await Vehicle.countDocuments();
    const availableCount = await Vehicle.countDocuments({ status: 'AVAILABLE' });
    const rentedCount = await Vehicle.countDocuments({ status: 'RENTED_OUT' });
    const repairCount = await Vehicle.countDocuments({ status: 'UNDER_REPAIR' });
    const condemnedCount = await Vehicle.countDocuments({ status: 'CONDEMNED_SOLD' });

    // Category-wise statistical breakdown
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        // Vehicles in category
        const vehicles = await Vehicle.find({ category: cat._id });
        const count = vehicles.length;
        const acCount = vehicles.filter((v) => v.isAC).length;
        const nonAcCount = count - acCount;

        const totalPurchasePrice = vehicles.reduce((sum, v) => sum + v.purchasePrice, 0);
        const avgPurchasePrice = count > 0 ? Math.round(totalPurchasePrice / count) : 0;

        // Maintenance
        const maintenanceLogs = await MaintenanceLog.find({ categoryName: cat.name });
        const totalRepairExpense = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
        const avgRepairExpense = count > 0 ? Math.round(totalRepairExpense / count) : 0;

        // Fuel
        const fuelLogs = await FuelLog.find({ categoryName: cat.name });
        const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
        const totalFuelExpense = fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);

        // Rentals / Demand & Revenue
        const rentals = await RentalBooking.find({
          categoryName: cat.name,
          status: 'RETURNED_SETTLED',
        });

        const totalBookings = rentals.length;
        const totalHoursRented = Number(rentals.reduce((sum, r) => sum + (r.durationHours || 0), 0).toFixed(1));
        const totalKmRun = Number(rentals.reduce((sum, r) => sum + (r.distanceKm || 0), 0).toFixed(1));
        const totalRevenue = rentals.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
        const avgRevenuePerBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

        // Profitability
        const operationalExpenses = totalRepairExpense + totalFuelExpense;
        const netProfit = totalRevenue - operationalExpenses;
        const profitMargin = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;

        // Decision Recommendation
        let recommendation = 'Adequate pricing and demand.';
        if (profitMargin > 30) {
          recommendation = 'High profit margin. Consider expanding fleet for this model.';
        } else if (profitMargin < 0) {
          recommendation = 'Operating at loss due to high repairs/low rates. Increase per-hour/km rate or inspect older cars.';
        } else if (totalBookings === 0) {
          recommendation = 'Low market demand. Consider promotional pricing or rate discount.';
        }

        return {
          categoryId: cat._id,
          categoryName: cat.name,
          baseHourlyRate: cat.baseHourlyRate,
          baseKmRate: cat.baseKmRate,
          seatingCapacity: cat.seatingCapacity,
          fuelType: cat.fuelType,
          totalVehicles: count,
          acVehicles: acCount,
          nonAcVehicles: nonAcCount,
          avgPurchasePrice,
          totalRepairExpense,
          avgRepairExpense,
          totalFuelLiters,
          totalFuelExpense,
          demandBookingsCount: totalBookings,
          totalHoursRented,
          totalKmRun,
          totalRevenue,
          avgRevenuePerBooking,
          operationalExpenses,
          netProfit,
          profitMargin,
          recommendation,
        };
      })
    );

    // Global totals
    const totalFleetRevenue = categoryStats.reduce((sum, c) => sum + c.totalRevenue, 0);
    const totalFleetRepairs = categoryStats.reduce((sum, c) => sum + c.totalRepairExpense, 0);
    const totalFleetFuel = categoryStats.reduce((sum, c) => sum + c.totalFuelExpense, 0);
    const totalFleetProfit = totalFleetRevenue - (totalFleetRepairs + totalFleetFuel);
    const totalDemandBookings = categoryStats.reduce((sum, c) => sum + c.demandBookingsCount, 0);

    res.json({
      success: true,
      data: {
        kpis: {
          totalVehicles,
          availableCount,
          rentedCount,
          repairCount,
          condemnedCount,
          fleetUtilizationRate: totalVehicles > 0 ? Number(((rentedCount / totalVehicles) * 100).toFixed(1)) : 0,
          totalFleetRevenue,
          totalFleetRepairs,
          totalFleetFuel,
          totalFleetProfit,
          totalDemandBookings,
        },
        categoryStatistics: categoryStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
