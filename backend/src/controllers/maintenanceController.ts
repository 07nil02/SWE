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

    if (!vehicleId || !description || cost == null) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle, description, and cost are required',
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const log = await MaintenanceLog.create({
      vehicle: vehicle._id,
      vehicleReg: vehicle.registrationNumber,
      categoryName: vehicle.categoryName,
      repairDate: new Date(),
      description: description.trim(),
      cost: Number(cost),
      workshop: workshop?.trim(),
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
      message: `Maintenance expense of Rs. ${cost} recorded for ${vehicle.registrationNumber}.`,
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

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const totalCost = Number((Number(liters) * Number(costPerLiter)).toFixed(2));

    const log = await FuelLog.create({
      vehicle: vehicle._id,
      vehicleReg: vehicle.registrationNumber,
      categoryName: vehicle.categoryName,
      fuelDate: new Date(),
      liters: Number(liters),
      costPerLiter: Number(costPerLiter),
      totalCost,
      odometerAtFill: odometerAtFill != null ? Number(odometerAtFill) : vehicle.currentOdometer,
    });

    if (odometerAtFill && Number(odometerAtFill) > vehicle.currentOdometer) {
      vehicle.currentOdometer = Number(odometerAtFill);
      await vehicle.save();
    }

    res.status(201).json({
      success: true,
      data: log,
      message: `Fuel log of ${liters} liters (Rs. ${totalCost}) recorded for ${vehicle.registrationNumber}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
