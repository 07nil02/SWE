import mongoose, { Schema, Document, Types } from 'mongoose';

export type VehicleStatus = 'AVAILABLE' | 'RENTED_OUT' | 'UNDER_REPAIR' | 'CONDEMNED_SOLD';

export interface IVehicle extends Document {
  registrationNumber: string;
  category: Types.ObjectId;
  categoryName: string;
  isAC: boolean;
  status: VehicleStatus;
  purchasePrice: number;
  purchaseDate: Date;
  currentOdometer: number;
  lastServiceDate?: Date;
  salvageValue?: number;
  condemnedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'VehicleCategory', required: true },
    categoryName: { type: String, required: true },
    isAC: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RENTED_OUT', 'UNDER_REPAIR', 'CONDEMNED_SOLD'],
      default: 'AVAILABLE',
      index: true,
    },
    purchasePrice: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, default: Date.now },
    currentOdometer: { type: Number, required: true, default: 0, min: 0 },
    lastServiceDate: { type: Date },
    salvageValue: { type: Number, min: 0 },
    condemnedDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
