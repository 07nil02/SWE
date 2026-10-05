import React, { useState, useEffect } from 'react';
import { Vehicle, CategoryStat, api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface BookingFlowModalProps {
  initialVehicle?: Vehicle | null;
  vehicles: Vehicle[];
  categories: CategoryStat[];
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  initialVehicle,
  vehicles,
  categories,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<number>(initialVehicle ? 3 : 1);

  // Form State
  const [pickupHub, setPickupHub] = useState('New Delhi Airport (DEL)');
  const [pickupDate, setPickupDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [expectedReturn, setExpectedReturn] = useState(
    new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialVehicle?._id || vehicles.find((v) => v.status === 'AVAILABLE')?._id || ''
  );

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerLicense, setCustomerLicense] = useState(user?.drivingLicense || '');
  const [advanceAmount, setAdvanceAmount] = useState<number>(2500);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!customerLicense && user.drivingLicense) setCustomerLicense(user.drivingLicense);
    }
  }, [user]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  const selectedVehicle = vehicles.find((v) => v._id === selectedVehicleId) || initialVehicle;
  const selectedCategory = selectedVehicle ? categories.find((c) => c.name === selectedVehicle.categoryName) : undefined;

  const acMult = selectedVehicle?.isAC ? 1.5 : 1.0;
  const hrRate = selectedCategory ? Math.round(selectedCategory.baseHourlyRate * acMult) : 100;
  const kmRate = selectedCategory ? Number((selectedCategory.baseKmRate * acMult).toFixed(1)) : 12;
  const min4Hr = hrRate * 4;

  // Estimated hours
  const startMs = new Date(pickupDate).getTime();
  const endMs = new Date(expectedReturn).getTime();
  const estimatedHours = Math.max(4, Math.ceil((endMs - startMs) / (1000 * 60 * 60)));
  const estimatedDays = Math.max(1, Math.ceil(estimatedHours / 24));
  const estimatedMinCost = Math.max(min4Hr, estimatedHours * hrRate);

  const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE');

  const validateDates = (): boolean => {
    setErrorMsg('');
    const pMs = new Date(pickupDate).getTime();
    const rMs = new Date(expectedReturn).getTime();
    if (isNaN(pMs) || isNaN(rMs)) {
      setErrorMsg('Please specify valid departure and return dates/times.');
      return false;
    }
    if (pMs < Date.now() - 10 * 60 * 1000) {
      setErrorMsg('Departure date cannot be in the past.');
      return false;
    }
    if (rMs <= pMs) {
      setErrorMsg('Expected return time must be strictly after departure time.');
      return false;
    }
    const durationHours = (rMs - pMs) / (1000 * 60 * 60);
    if (durationHours < 4) {
      setErrorMsg('Rental duration must be at least 4 hours (statutory minimum rental).');
      return false;
    }
    return true;
  };

  const validateDriverAndAdvance = (): boolean => {
    setErrorMsg('');
    if (!customerName || customerName.trim().length < 2) {
      setErrorMsg('Driver full name must be at least 2 characters.');
      return false;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!customerPhone || cleanPhone.length < 7) {
      setErrorMsg('Please provide a valid contact phone number with at least 7 digits.');
      return false;
    }
    if (isNaN(advanceAmount) || advanceAmount <= 0) {
      setErrorMsg('Advance deposit must be a valid positive amount.');
      return false;
    }
    if (!selectedVehicleId) {
      setErrorMsg('Please select a vehicle asset for reservation.');
      return false;
    }
    return true;
  };

  const handleConfirmReservation = async () => {
    if (!validateDates()) return;
    if (!validateDriverAndAdvance()) return;
    setSubmitting(true);
    try {
      const res = await api.createBooking({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerLicense: customerLicense?.trim() || undefined,
        vehicleId: selectedVehicleId,
        expectedReturnDate: expectedReturn,
        advanceAmount: Number(advanceAmount),
        notes: `Pickup Hub: ${pickupHub} | ${notes.trim()}`,
      });
      if (res.success) {
        setConfirmedBooking(res.data);
        setStep(5);
        onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-950/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white max-w-4xl w-full border border-stone-300 shadow-2xl my-8 overflow-hidden">
        {/* Top Progress Masthead */}
        <div className="px-8 py-5 border-b border-stone-200 bg-stone-50 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-luxury text-champagne-600 block">
              RESERVATION FLOW
            </span>
            <div className="flex items-center space-x-3 text-xs font-mono mt-1 text-charcoal-500">
              <span className={step === 1 ? 'font-bold text-charcoal-950 border-b border-charcoal-950' : ''}>
                01 DATES
              </span>
              <span>·</span>
              <span className={step === 2 ? 'font-bold text-charcoal-950 border-b border-charcoal-950' : ''}>
                02 VEHICLE
              </span>
              <span>·</span>
              <span className={step === 3 ? 'font-bold text-charcoal-950 border-b border-charcoal-950' : ''}>
                03 DRIVER & ADVANCE
              </span>
              <span>·</span>
              <span className={step === 4 ? 'font-bold text-charcoal-950 border-b border-charcoal-950' : ''}>
                04 REVIEW
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-charcoal-400 hover:text-charcoal-950 font-mono text-xs tracking-wider uppercase"
          >
            [ Close ✕ ]
          </button>
        </div>

        {/* Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
          {/* Main Step Workspace (7 Cols) */}
          <div className="lg:col-span-7 p-8">
            {errorMsg && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {/* STEP 1: Dates & Location */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl text-charcoal-950 font-normal">
                    Select Dates & Pickup Hub
                  </h3>
                  <p className="font-sans text-xs text-charcoal-500 font-light mt-1">
                    All rentals carry a mandatory statutory 4-hour minimum rental guarantee.
                  </p>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-charcoal-600 mb-1">
                      Pick-up Location Hub
                    </label>
                    <select
                      value={pickupHub}
                      onChange={(e) => setPickupHub(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-charcoal-900 focus:outline-none focus:border-charcoal-950"
                    >
                      <option value="New Delhi Airport (DEL)">New Delhi Airport (DEL)</option>
                      <option value="New Delhi Central (Connaught Place)">New Delhi Central (Connaught Place)</option>
                      <option value="Jaipur International Airport">Jaipur International Airport</option>
                      <option value="Agra Cantonment Hub">Agra Cantonment Hub</option>
                      <option value="Mumbai International (BOM)">Mumbai International (BOM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-charcoal-600 mb-1">
                      Departure Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-charcoal-900 font-mono focus:outline-none focus:border-charcoal-950"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-charcoal-600 mb-1">
                      Expected Return Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-charcoal-900 font-mono focus:outline-none focus:border-charcoal-950"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      if (validateDates()) {
                        setStep(2);
                      }
                    }}
                    className="px-6 py-2.5 bg-charcoal-950 text-stone-50 font-mono text-xs uppercase tracking-widest hover:bg-charcoal-800"
                  >
                    Select Vehicle →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Vehicle Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl text-charcoal-950 font-normal">
                    Choose Your Vehicle
                  </h3>
                  <p className="font-sans text-xs text-charcoal-500 font-light mt-1">
                    Select from available cars in the company fleet.
                  </p>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {availableVehicles.map((v) => {
                    const cat = categories.find((c) => c.name === v.categoryName);
                    const acM = v.isAC ? 1.5 : 1.0;
                    const hRate = cat ? Math.round(cat.baseHourlyRate * acM) : 100;
                    const isSelected = v._id === selectedVehicleId;

                    return (
                      <div
                        key={v._id}
                        onClick={() => setSelectedVehicleId(v._id)}
                        className={`p-4 border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-charcoal-950 bg-stone-100 shadow-sm'
                            : 'border-stone-200 hover:border-stone-400 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal-500">
                              {v.registrationNumber}
                            </span>
                            <h4 className="font-serif text-lg text-charcoal-950 font-medium">
                              {v.categoryName}
                            </h4>
                            <div className="font-sans text-xs text-charcoal-500 mt-0.5">
                              {v.isAC ? 'Climate Controlled (+50%)' : 'Standard Non-AC'} · {cat?.seatingCapacity || 5} Seats · {cat?.fuelType || 'Diesel'}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-xs font-bold text-charcoal-950">
                              ₹{hRate} / hr
                            </span>
                            <span className="font-mono text-[10px] text-charcoal-500 block">
                              Min 4-hr: ₹{hRate * 4}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-stone-300 text-charcoal-700 font-mono text-xs uppercase"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!selectedVehicleId}
                    className="px-6 py-2.5 bg-charcoal-950 text-stone-50 font-mono text-xs uppercase tracking-widest hover:bg-charcoal-800 disabled:opacity-50"
                  >
                    Enter Driver Details →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Driver Details & Advance */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl text-charcoal-950 font-normal">
                    Driver Identification & Advance Remittance
                  </h3>
                  <p className="font-sans text-xs text-charcoal-500 font-light mt-1">
                    An advance deposit is deposited upon booking. Balance is refunded or paid on return.
                  </p>
                </div>

                {user && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-900 text-[11px] font-mono flex items-center justify-between rounded-sm">
                    <span>✦ Client Profile: <strong>{user.name}</strong> ({user.email})</span>
                    <span className="text-[10px] text-amber-700 font-semibold uppercase">Auto-Linked to Ledger</span>
                  </div>
                )}

                <div className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-charcoal-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Malhotra"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-charcoal-900 focus:outline-none focus:border-charcoal-950"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-charcoal-600 mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-charcoal-900 font-mono focus:outline-none focus:border-charcoal-950"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-charcoal-600 mb-1">
                        Driving License No.
                      </label>
                      <input
                        type="text"
                        placeholder="DL-0420110012345"
                        value={customerLicense}
                        onChange={(e) => setCustomerLicense(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-charcoal-900 font-mono focus:outline-none focus:border-charcoal-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-charcoal-600 mb-1">
                      Advance Deposit Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-charcoal-900 font-mono text-sm focus:outline-none focus:border-charcoal-950"
                    />
                    <span className="font-mono text-[10px] text-charcoal-400 mt-1 block">
                      Recommended: ₹{min4Hr * 2} (covers baseline floor and estimated mileage)
                    </span>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-charcoal-600 mb-1">
                      Trip Notes / Requests
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Airport pickup at terminal 3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-charcoal-900 focus:outline-none focus:border-charcoal-950"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border border-stone-300 text-charcoal-700 font-mono text-xs uppercase"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      if (validateDriverAndAdvance()) {
                        setStep(4);
                      }
                    }}
                    className="px-6 py-2.5 bg-charcoal-950 text-stone-50 font-mono text-xs uppercase tracking-widest hover:bg-charcoal-800"
                  >
                    Review Reservation →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Finalize */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl text-charcoal-950 font-normal">
                    Review Reservation & Pricing Breakdown
                  </h3>
                  <p className="font-sans text-xs text-charcoal-500 font-light mt-1">
                    Please confirm the driver details and statutory rental terms.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Driver:</span>
                    <span className="text-charcoal-950 font-semibold">{customerName} ({customerPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Asset:</span>
                    <span className="text-charcoal-950 font-semibold">{selectedVehicle?.registrationNumber} ({selectedVehicle?.categoryName})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Pick-up Hub:</span>
                    <span className="text-charcoal-950">{pickupHub}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Advance Deposited:</span>
                    <span className="text-champagne-600 font-bold">₹{advanceAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 border border-stone-200 text-xs text-charcoal-600 space-y-2 font-light">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-charcoal-900 font-semibold">
                    Statutory Settlement Agreement:
                  </div>
                  <p>
                    Upon return, the customer is billed the maximum of (duration hours × ₹{hrRate}/hr) or (kilometers run × ₹{kmRate}/km), with a guaranteed statutory floor of 4 hours (₹{min4Hr}). An overnight charge of ₹150 applies for every night halt.
                  </p>
                  <p>
                    If total charges are less than your deposit, the difference is refunded immediately. If charges exceed the deposit, the remaining balance is settled upon vehicle re-entry.
                  </p>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 border border-stone-300 text-charcoal-700 font-mono text-xs uppercase"
                  >
                    ← Edit Details
                  </button>
                  <button
                    onClick={handleConfirmReservation}
                    disabled={submitting}
                    className="px-8 py-3 bg-champagne-400 hover:bg-champagne-500 text-charcoal-950 font-mono text-xs uppercase tracking-widest font-semibold"
                  >
                    {submitting ? 'Confirming...' : 'Confirm Reservation ✓'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Confirmation Voucher */}
            {step === 5 && confirmedBooking && (
              <div className="space-y-6 text-center py-6">
                <div className="w-12 h-12 border border-champagne-400 bg-champagne-400/10 text-champagne-500 flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="font-serif text-3xl text-charcoal-950 font-normal">
                  Reservation Certified
                </h3>
                <p className="font-sans text-xs text-charcoal-500 max-w-sm mx-auto">
                  Your reservation docket has been registered with the fleet dispatcher.
                </p>

                <div className="p-6 bg-stone-50 border border-stone-200 text-left font-mono text-xs max-w-md mx-auto space-y-2">
                  <div className="flex justify-between border-b border-stone-200 pb-2">
                    <span className="text-charcoal-500">Booking Docket:</span>
                    <span className="font-bold text-charcoal-950">{confirmedBooking.bookingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Assigned Vehicle:</span>
                    <span className="font-semibold text-charcoal-950">{confirmedBooking.vehicleReg}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Advance Remitted:</span>
                    <span className="text-champagne-600 font-bold">₹{confirmedBooking.advanceAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Status:</span>
                    <span className="text-emerald-700 font-semibold">{confirmedBooking.status}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-charcoal-950 text-stone-50 font-mono text-xs uppercase tracking-widest hover:bg-charcoal-800"
                  >
                    Conclude & Return to Fleet
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Reservation Summary Sidebar (5 Cols) */}
          <div className="lg:col-span-5 p-8 bg-stone-50 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-luxury text-charcoal-500 block mb-4">
                RESERVATION SUMMARY
              </span>

              {selectedVehicle ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-serif text-2xl text-charcoal-950 font-normal">
                      {selectedVehicle.categoryName}
                    </h4>
                    <span className="font-mono text-xs text-charcoal-500">
                      {selectedVehicle.registrationNumber} · {selectedVehicle.isAC ? 'AC (+50%)' : 'Non-AC'}
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-stone-200 text-xs font-mono space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Duration Est.:</span>
                      <span className="text-charcoal-900">{estimatedHours} Hours (~{estimatedDays} Days)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Hourly Rate:</span>
                      <span className="text-charcoal-900">₹{hrRate} / hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Kilometer Rate:</span>
                      <span className="text-charcoal-900">₹{kmRate} / km</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-100 pt-1">
                      <span className="text-charcoal-500">4-Hour Min Floor:</span>
                      <span className="text-charcoal-900 font-semibold">₹{min4Hr}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono text-charcoal-600">
                    <div className="flex justify-between">
                      <span>Baseline Usage Est.:</span>
                      <span className="font-semibold text-charcoal-900">₹{estimatedMinCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-champagne-600 font-semibold">
                      <span>Advance Deposition:</span>
                      <span>₹{advanceAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-charcoal-400 italic">
                  Select a vehicle to view tariff breakdown.
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-stone-200/80 text-[11px] font-mono text-charcoal-400">
              Guaranteed by Statutory Transport Operations Codex. Demurrage: ₹150 / night halt.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
