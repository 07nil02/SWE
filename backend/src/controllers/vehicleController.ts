import { Request, Response } from 'express';
import { Vehicle } from '../models/Vehicle.js';
import { VehicleCategory } from '../models/VehicleCategory.js';
import { MaintenanceLog } from '../models/MaintenanceLog.js';
import { FuelLog } from '../models/FuelLog.js';
import { RentalBooking } from '../models/RentalBooking.js';

export async function getVehicles(req: Request, res: Response) {
  try {
    const { status, category, isAC, search } = req.query;
    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (category) filter.categoryName = category;
    if (isAC !== undefined && isAC !== '') filter.isAC = isAC === 'true';
    if (search) {
      filter.$or = [
        { registrationNumber: { $regex: String(search), $options: 'i' } },
        { categoryName: { $regex: String(search), $options: 'i' } },
      ];
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getVehicleById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id).populate('category');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const maintenanceLogs = await MaintenanceLog.find({ vehicle: vehicle._id }).sort({ repairDate: -1 });
    const fuelLogs = await FuelLog.find({ vehicle: vehicle._id }).sort({ fuelDate: -1 });
    const rentalHistory = await RentalBooking.find({ vehicle: vehicle._id }).sort({ bookingDate: -1 }).limit(10);

    const totalRepairCost = maintenanceLogs.reduce((acc, log) => acc + log.cost, 0);
    const totalFuelLiters = fuelLogs.reduce((acc, log) => acc + log.liters, 0);
    const totalFuelCost = fuelLogs.reduce((acc, log) => acc + log.totalCost, 0);
    const totalRevenue = rentalHistory
      .filter((r) => r.status === 'RETURNED_SETTLED')
      .reduce((acc, r) => acc + (r.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        vehicle,
        maintenanceLogs,
        fuelLogs,
        rentalHistory,
        stats: {
          totalRepairCost,
          totalFuelLiters,
          totalFuelCost,
          totalRevenue,
          netContribution: totalRevenue - (totalRepairCost + totalFuelCost),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function addVehicle(req: Request, res: Response) {
  try {
    const { registrationNumber, categoryId, isAC, purchasePrice, currentOdometer, notes } = req.body;

    if (!registrationNumber || !categoryId || purchasePrice == null) {
      return res.status(400).json({ success: false, message: 'Registration number, category, and purchase price are required' });
    }

    const category = await VehicleCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const existing = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A vehicle with this registration number already exists' });
    }

    const vehicle = await Vehicle.create({
      registrationNumber: registrationNumber.toUpperCase().trim(),
      category: category._id,
      categoryName: category.name,
      isAC: Boolean(isAC),
      purchasePrice: Number(purchasePrice),
      currentOdometer: Number(currentOdometer) || 0,
      status: 'AVAILABLE',
      notes,
    });

    res.status(201).json({ success: true, data: vehicle, message: 'New vehicle acquired and added to fleet!' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function updateVehicleStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowed = ['AVAILABLE', 'UNDER_REPAIR'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Direct status update only allowed for: ${allowed.join(', ')}. Use dispatch/return for rentals, or condemn endpoint to sell.`,
      });
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.status === 'RENTED_OUT') {
      return res.status(400).json({
        success: false,
        message: 'Cannot manually change status while vehicle is currently rented out. Return the rental first.',
      });
    }

    if (vehicle.status === 'CONDEMNED_SOLD') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is condemned and sold off. Status cannot be modified.',
      });
    }

    vehicle.status = status;
    if (notes) vehicle.notes = notes;
    await vehicle.save();

    res.json({ success: true, data: vehicle, message: `Vehicle status changed to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function condemnVehicle(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { salvageValue, notes } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.status === 'RENTED_OUT') {
      return res.status(400).json({
        success: false,
        message: 'Cannot condemn a vehicle that is currently rented out!',
      });
    }

    vehicle.status = 'CONDEMNED_SOLD';
    vehicle.salvageValue = Number(salvageValue) || 0;
    vehicle.condemnedDate = new Date();
    if (notes) vehicle.notes = notes;
    await vehicle.save();

    res.json({
      success: true,
      data: vehicle,
      message: `Vehicle ${vehicle.registrationNumber} condemned and sold off for Rs. ${vehicle.salvageValue}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
