import { Request, Response } from 'express';
import { MaintenanceLog } from '../models/MaintenanceLog.js';
import { FuelLog } from '../models/FuelLog.js';
import { Vehicle } from '../models/Vehicle.js';

export async function getMaintenanceLogs(req: Request, res: Response) {
  try {
    const { vehicleId, category } = req.query;
    const filter: Record<string, any> = {};

    if (vehicleId) filter.vehicle = vehicleId;
    if (category) filter.categoryName = category;

    const logs = await MaintenanceLog.find(filter).sort({ repairDate: -1 });
    const totalSpent = logs.reduce((sum, log) => sum + log.cost, 0);

    res.json({ success: true, count: logs.length, totalSpent, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function createMaintenanceLog(req: Request, res: Response) {
  try {
    const { vehicleId, description, cost, workshop, repairType, setUnderRepair } = req.body;

    if (!vehicleId || !description || typeof description !== 'string' || description.trim().length === 0 || cost == null) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle, non-empty description, and cost are required',
      });
    }

    const numCost = Number(cost);
    if (isNaN(numCost) || numCost <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Maintenance cost must be a positive number',
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.status === 'CONDEMNED_SOLD') {
      return res.status(400).json({
        success: false,
        message: 'Cannot log maintenance on a decommissioned/sold vehicle',
      });
    }

    if (setUnderRepair && vehicle.status === 'RENTED_OUT') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is currently rented out and cannot be grounded under repair until returned',
      });
    }

    const log = await MaintenanceLog.create({
      vehicle: vehicle._id,
      vehicleReg: vehicle.registrationNumber,
      categoryName: vehicle.categoryName,
      repairDate: new Date(),
      description: description.trim(),
      cost: numCost,
      workshop: typeof workshop === 'string' ? workshop.trim() : undefined,
      repairType: repairType || 'Routine Service',
    });

    vehicle.lastServiceDate = new Date();
    if (setUnderRepair && vehicle.status === 'AVAILABLE') {
      vehicle.status = 'UNDER_REPAIR';
    }
    await vehicle.save();

    res.status(201).json({
      success: true,
      data: log,
      message: `Maintenance expense of Rs. ${numCost} recorded for ${vehicle.registrationNumber}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getFuelLogs(req: Request, res: Response) {
  try {
    const { vehicleId, category } = req.query;
    const filter: Record<string, any> = {};

    if (vehicleId) filter.vehicle = vehicleId;
    if (category) filter.categoryName = category;

    const logs = await FuelLog.find(filter).sort({ fuelDate: -1 });
    const totalLiters = logs.reduce((sum, log) => sum + log.liters, 0);
    const totalCost = logs.reduce((sum, log) => sum + log.totalCost, 0);

    res.json({
      success: true,
      count: logs.length,
      totalLiters,
      totalCost,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function createFuelLog(req: Request, res: Response) {
  try {
    const { vehicleId, liters, costPerLiter, odometerAtFill } = req.body;

    if (!vehicleId || liters == null || costPerLiter == null) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle, liters, and cost per liter are required',
      });
    }

    const numLiters = Number(liters);
    const numCostPerLiter = Number(costPerLiter);
    if (isNaN(numLiters) || numLiters <= 0 || isNaN(numCostPerLiter) || numCostPerLiter <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Liters and cost per liter must be positive numbers',
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.status === 'CONDEMNED_SOLD') {
      return res.status(400).json({
        success: false,
        message: 'Cannot log fuel for a decommissioned/sold vehicle',
      });
    }

    let finalOdo = vehicle.currentOdometer;
    if (odometerAtFill != null) {
      const numOdo = Number(odometerAtFill);
      if (isNaN(numOdo) || numOdo < vehicle.currentOdometer) {
        return res.status(400).json({
          success: false,
          message: `Odometer at fill (${odometerAtFill}) cannot be lower than the vehicle's current odometer (${vehicle.currentOdometer})`,
        });
      }
      finalOdo = numOdo;
    }

    const totalCost = Number((numLiters * numCostPerLiter).toFixed(2));

    const log = await FuelLog.create({
      vehicle: vehicle._id,
      vehicleReg: vehicle.registrationNumber,
      categoryName: vehicle.categoryName,
      fuelDate: new Date(),
      liters: numLiters,
      costPerLiter: numCostPerLiter,
      totalCost,
      odometerAtFill: finalOdo,
    });

    if (finalOdo > vehicle.currentOdometer) {
      vehicle.currentOdometer = finalOdo;
      await vehicle.save();
    }

    res.status(201).json({
      success: true,
      data: log,
      message: `Fuel log of ${numLiters} liters (Rs. ${totalCost}) recorded for ${vehicle.registrationNumber}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
