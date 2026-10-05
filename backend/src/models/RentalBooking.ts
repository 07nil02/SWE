import mongoose, { Schema, Document, Types } from 'mongoose';

export type BookingStatus = 'BOOKED' | 'DISPATCHED' | 'RETURNED_SETTLED' | 'CANCELLED';
export type SettlementType = 'REFUND' | 'ADDITIONAL_PAYMENT' | 'EXACT';

export interface IRentalBooking extends Document {
  bookingNumber: string;
  user?: Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerLicense?: string;
  vehicle: Types.ObjectId;
  vehicleReg: string;
  categoryName: string;
  isAC: boolean;
  hourlyRate: number;
  kmRate: number;
  advanceAmount: number;
  bookingDate: Date;
  expectedReturnDate: Date;
  dispatchedAt?: Date;
  startOdometer?: number;
  actualReturnDate?: Date;
  endOdometer?: number;
  distanceKm?: number;
  durationHours?: number;
  nightHalts: number;
  hourlyChargeAmount?: number;
  kmChargeAmount?: number;
  minChargeAmount?: number;
  nightHaltCharge?: number;
  totalAmount?: number;
  settlementType?: SettlementType;
  settlementAmount?: number;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RentalBookingSchema = new Schema<IRentalBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerLicense: { type: String, trim: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    vehicleReg: { type: String, required: true },
    categoryName: { type: String, required: true },
    isAC: { type: Boolean, default: false },
    hourlyRate: { type: Number, required: true, min: 0 },
    kmRate: { type: Number, required: true, min: 0 },
    advanceAmount: { type: Number, required: true, min: 0 },
    bookingDate: { type: Date, default: Date.now },
    expectedReturnDate: { type: Date, required: true },
    dispatchedAt: { type: Date },
    startOdometer: { type: Number, min: 0 },
    actualReturnDate: { type: Date },
    endOdometer: { type: Number, min: 0 },
    distanceKm: { type: Number, min: 0 },
    durationHours: { type: Number, min: 0 },
    nightHalts: { type: Number, default: 0, min: 0 },
    hourlyChargeAmount: { type: Number, min: 0 },
    kmChargeAmount: { type: Number, min: 0 },
    minChargeAmount: { type: Number, min: 0 },
    nightHaltCharge: { type: Number, min: 0 },
    totalAmount: { type: Number, min: 0 },
    settlementType: { type: String, enum: ['REFUND', 'ADDITIONAL_PAYMENT', 'EXACT'] },
    settlementAmount: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['BOOKED', 'DISPATCHED', 'RETURNED_SETTLED', 'CANCELLED'],
      default: 'BOOKED',
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const RentalBooking = mongoose.models.RentalBooking || mongoose.model<IRentalBooking>('RentalBooking', RentalBookingSchema);
