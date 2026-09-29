import { Request, Response } from 'express';
import { RentalBooking } from '../models/RentalBooking.js';
import { Vehicle } from '../models/Vehicle.js';
import { VehicleCategory } from '../models/VehicleCategory.js';
import { calculateRentalCharges } from '../services/pricingService.js';

export async function getRentals(req: Request, res: Response) {
  try {
    const { status, vehicleId, search } = req.query;
    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (vehicleId) filter.vehicle = vehicleId;
    if (search) {
      filter.$or = [
        { bookingNumber: { $regex: String(search), $options: 'i' } },
        { customerName: { $regex: String(search), $options: 'i' } },
        { customerPhone: { $regex: String(search), $options: 'i' } },
        { vehicleReg: { $regex: String(search), $options: 'i' } },
      ];
    }

    const rentals = await RentalBooking.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: rentals.length, data: rentals });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getRentalById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const rental = await RentalBooking.findById(id).populate('vehicle');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental booking not found' });
    }

    res.json({ success: true, data: rental });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function calculateQuote(req: Request, res: Response) {
  try {
    const { categoryId, isAC, hoursUsed, distanceKm, nightHalts, advanceAmount } = req.body;

    const category = await VehicleCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Vehicle category not found' });
    }

    const quote = calculateRentalCharges({
      baseHourlyRate: category.baseHourlyRate,
      baseKmRate: category.baseKmRate,
      isAC: Boolean(isAC),
      hoursUsed: Number(hoursUsed) || 4,
      distanceKm: Number(distanceKm) || 0,
      nightHalts: Number(nightHalts) || 0,
      advanceAmount: Number(advanceAmount) || 0,
    });

    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
}

export async function createBooking(req: Request, res: Response) {
  try {
    const {
      customerName,
      customerPhone,
      customerLicense,
      vehicleId,
      expectedReturnDate,
      advanceAmount,
      notes,
    } = req.body;

    if (!customerName || !customerPhone || !vehicleId || !expectedReturnDate || advanceAmount == null) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone, vehicle, expected return date, and advance amount are required',
      });
    }

    if (Number(advanceAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Advance deposit must be greater than zero',
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `Vehicle is not available for booking. Current state: ${vehicle.status}`,
      });
    }

    const category = await VehicleCategory.findById(vehicle.category);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Rate calculations
    const acMultiplier = vehicle.isAC ? 1.5 : 1.0;
    const hourlyRate = Number((category.baseHourlyRate * acMultiplier).toFixed(2));
    const kmRate = Number((category.baseKmRate * acMultiplier).toFixed(2));

    const bookingNumber = `BK-${Date.now().toString().slice(-6)}`;

    const booking = await RentalBooking.create({
      bookingNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerLicense: customerLicense?.trim(),
      vehicle: vehicle._id,
      vehicleReg: vehicle.registrationNumber,
      categoryName: vehicle.categoryName,
      isAC: vehicle.isAC,
      hourlyRate,
      kmRate,
      advanceAmount: Number(advanceAmount),
      bookingDate: new Date(),
      expectedReturnDate: new Date(expectedReturnDate),
      nightHalts: 0,
      status: 'BOOKED',
      notes,
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: `Booking created successfully with advance deposit of Rs. ${advanceAmount}. Ready for dispatch.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function dispatchVehicle(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { dispatchedAt, startOdometer } = req.body;

    const booking = await RentalBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'BOOKED') {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be dispatched in '${booking.status}' status`,
      });
    }

    const vehicle = await Vehicle.findById(booking.vehicle);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `Cannot dispatch: Vehicle is currently ${vehicle.status}`,
      });
    }

    const dispatchTime = dispatchedAt ? new Date(dispatchedAt) : new Date();
    const meter = startOdometer != null ? Number(startOdometer) : vehicle.currentOdometer;

    if (meter < vehicle.currentOdometer) {
      return res.status(400).json({
        success: false,
        message: `Start odometer (${meter}) cannot be less than car's current odometer (${vehicle.currentOdometer})`,
      });
    }

    booking.dispatchedAt = dispatchTime;
    booking.startOdometer = meter;
    booking.status = 'DISPATCHED';
    await booking.save();

    vehicle.status = 'RENTED_OUT';
    vehicle.currentOdometer = meter;
    await vehicle.save();

    res.json({
      success: true,
      data: booking,
      message: `Vehicle ${vehicle.registrationNumber} dispatched at ${dispatchTime.toLocaleString()} with meter ${meter} km.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function returnAndSettleVehicle(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { actualReturnDate, endOdometer, nightHalts, notes } = req.body;

    const booking = await RentalBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'DISPATCHED') {
      return res.status(400).json({
        success: false,
        message: `Only currently dispatched rentals can be returned. Current status: ${booking.status}`,
      });
    }

    const vehicle = await Vehicle.findById(booking.vehicle);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const returnTime = actualReturnDate ? new Date(actualReturnDate) : new Date();
    const startTime = booking.dispatchedAt || booking.bookingDate;

    if (returnTime.getTime() < startTime.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'Actual return time cannot be earlier than dispatch time',
      });
    }

    const finalMeter = Number(endOdometer);
    const startMeter = booking.startOdometer ?? vehicle.currentOdometer;

    if (isNaN(finalMeter) || finalMeter < startMeter) {
      return res.status(400).json({
        success: false,
        message: `End mile-meter reading (${finalMeter}) cannot be less than starting reading (${startMeter})`,
      });
    }

    const distanceKm = Number((finalMeter - startMeter).toFixed(1));
    const durationMs = returnTime.getTime() - startTime.getTime();
    // Fractional hours rounded to 1 decimal place, minimum counted for bill calculation
    const rawHours = durationMs / (1000 * 60 * 60);
    const durationHours = Math.max(0.1, Number(rawHours.toFixed(1)));

    // Night halts calculation: user input takes precedence; default calculated by days if not provided
    const halts = nightHalts != null ? Math.max(0, Number(nightHalts)) : Math.floor(rawHours / 24);

    const category = await VehicleCategory.findById(vehicle.category);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Vehicle category not found' });
    }

    // Execute core pricing algorithm
    const pricing = calculateRentalCharges({
      baseHourlyRate: category.baseHourlyRate,
      baseKmRate: category.baseKmRate,
      isAC: vehicle.isAC,
      hoursUsed: durationHours,
      distanceKm,
      nightHalts: halts,
      advanceAmount: booking.advanceAmount,
    });

    // Update booking record
    booking.actualReturnDate = returnTime;
    booking.endOdometer = finalMeter;
    booking.distanceKm = distanceKm;
    booking.durationHours = durationHours;
    booking.nightHalts = halts;
    booking.hourlyChargeAmount = pricing.hourlyCharge;
    booking.kmChargeAmount = pricing.kmCharge;
    booking.minChargeAmount = pricing.min4HourCharge;
    booking.nightHaltCharge = pricing.nightHaltCharge;
    booking.totalAmount = pricing.totalAmount;
    booking.settlementType = pricing.settlementType;
    booking.settlementAmount = pricing.settlementAmount;
    booking.status = 'RETURNED_SETTLED';
    if (notes) booking.notes = `${booking.notes ? booking.notes + ' | ' : ''}${notes}`;
    await booking.save();

    // Release vehicle back to available state and update current odometer
    vehicle.status = 'AVAILABLE';
    vehicle.currentOdometer = finalMeter;
    await vehicle.save();

    res.json({
      success: true,
      data: {
        booking,
        calculationDetails: pricing,
      },
      message: `Car returned successfully! Total Amount: Rs. ${pricing.totalAmount}. Advance Paid: Rs. ${booking.advanceAmount}. Result: ${pricing.settlementType} of Rs. ${pricing.settlementAmount}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
