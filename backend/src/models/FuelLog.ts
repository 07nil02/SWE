import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFuelLog extends Document {
  vehicle: Types.ObjectId;
  vehicleReg: string;
  categoryName: string;
  fuelDate: Date;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometerAtFill?: number;
  createdAt: Date;
  updatedAt: Date;
}

const FuelLogSchema = new Schema<IFuelLog>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    vehicleReg: { type: String, required: true },
    categoryName: { type: String, required: true },
    fuelDate: { type: Date, default: Date.now },
    liters: { type: Number, required: true, min: 0 },
    costPerLiter: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    odometerAtFill: { type: Number, min: 0 },
  },
  { timestamps: true }
);

export const FuelLog = mongoose.models.FuelLog || mongoose.model<IFuelLog>('FuelLog', FuelLogSchema);
