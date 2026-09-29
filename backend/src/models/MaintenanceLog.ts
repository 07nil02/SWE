import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMaintenanceLog extends Document {
  vehicle: Types.ObjectId;
  vehicleReg: string;
  categoryName: string;
  repairDate: Date;
  description: string;
  cost: number;
  workshop?: string;
  repairType: 'Routine Service' | 'Major Overhaul' | 'Accident Repair' | 'Tyre Replacement' | 'AC Repair' | 'Other';
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceLogSchema = new Schema<IMaintenanceLog>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    vehicleReg: { type: String, required: true },
    categoryName: { type: String, required: true },
    repairDate: { type: Date, default: Date.now },
    description: { type: String, required: true },
    cost: { type: Number, required: true, min: 0 },
    workshop: { type: String },
    repairType: {
      type: String,
      enum: ['Routine Service', 'Major Overhaul', 'Accident Repair', 'Tyre Replacement', 'AC Repair', 'Other'],
      default: 'Routine Service',
    },
  },
  { timestamps: true }
);

export const MaintenanceLog = mongoose.models.MaintenanceLog || mongoose.model<IMaintenanceLog>('MaintenanceLog', MaintenanceLogSchema);
