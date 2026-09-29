import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicleCategory extends Document {
  name: string;
  baseHourlyRate: number; // Non-AC base rate per hour
  baseKmRate: number;     // Non-AC base rate per km
  seatingCapacity: number;
  fuelType: 'Petrol' | 'Diesel';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleCategorySchema = new Schema<IVehicleCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    baseHourlyRate: { type: Number, required: true, min: 0 },
    baseKmRate: { type: Number, required: true, min: 0 },
    seatingCapacity: { type: Number, required: true, min: 1 },
    fuelType: { type: String, enum: ['Petrol', 'Diesel'], required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const VehicleCategory = mongoose.models.VehicleCategory || mongoose.model<IVehicleCategory>('VehicleCategory', VehicleCategorySchema);
