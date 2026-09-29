import { Request, Response } from 'express';
import { VehicleCategory } from '../models/VehicleCategory.js';
import { Vehicle } from '../models/Vehicle.js';

export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await VehicleCategory.find().sort({ name: 1 });
    
    // Count available vehicles per category
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const totalVehicles = await Vehicle.countDocuments({ category: cat._id });
        const availableNonAc = await Vehicle.countDocuments({ category: cat._id, isAC: false, status: 'AVAILABLE' });
        const availableAc = await Vehicle.countDocuments({ category: cat._id, isAC: true, status: 'AVAILABLE' });
        const rented = await Vehicle.countDocuments({ category: cat._id, status: 'RENTED_OUT' });
        const inRepair = await Vehicle.countDocuments({ category: cat._id, status: 'UNDER_REPAIR' });
        const condemned = await Vehicle.countDocuments({ category: cat._id, status: 'CONDEMNED_SOLD' });

        return {
          ...cat.toObject(),
          totalVehicles,
          availableNonAc,
          availableAc,
          rented,
          inRepair,
          condemned,
          acHourlyRate: Number((cat.baseHourlyRate * 1.5).toFixed(2)),
          acKmRate: Number((cat.baseKmRate * 1.5).toFixed(2)),
          minNonAcCharge: Number((cat.baseHourlyRate * 4).toFixed(2)),
          minAcCharge: Number((cat.baseHourlyRate * 1.5 * 4).toFixed(2)),
        };
      })
    );

    res.json({ success: true, data: categoryStats });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function updateCategoryRates(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { baseHourlyRate, baseKmRate } = req.body;

    if (baseHourlyRate == null || baseKmRate == null) {
      return res.status(400).json({ success: false, message: 'Base hourly and km rates are required' });
    }

    const updated = await VehicleCategory.findByIdAndUpdate(
      id,
      { baseHourlyRate: Number(baseHourlyRate), baseKmRate: Number(baseKmRate) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: updated, message: 'Category rates updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
