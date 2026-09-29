import React, { useState } from 'react';
import { RentalBooking, Vehicle, api } from '../api/client';
import { SectionLabel } from './SectionLabel';

interface RentalsTabProps {
  rentals: RentalBooking[];
  vehicles: Vehicle[];
  onRefresh: () => void;
  selectedVehicleIdForBooking?: string | null;
  onClearSelectedVehicle?: () => void;
}

export const RentalsTab: React.FC<RentalsTabProps> = ({
  rentals,
  vehicles,
  onRefresh,
  selectedVehicleIdForBooking,
  onClearSelectedVehicle,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Modals
  const [showBookModal, setShowBookModal] = useState<boolean>(Boolean(selectedVehicleIdForBooking));
  const [dispatchModalRental, setDispatchModalRental] = useState<RentalBooking | null>(null);
  const [returnModalRental, setReturnModalRental] = useState<RentalBooking | null>(null);
  const [billReceipt, setBillReceipt] = useState<any | null>(null);

  // Form states
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custLicense, setCustLicense] = useState<string>('');
  const [bookVehicleId, setBookVehicleId] = useState<string>(
    selectedVehicleIdForBooking || vehicles.find((v) => v.status === 'AVAILABLE')?._id || ''
  );
  const [expectedReturn, setExpectedReturn] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [advanceAmount, setAdvanceAmount] = useState<number>(2000);
  const [bookNotes, setBookNotes] = useState<string>('');
  const [bookError, setBookError] = useState<string>('');

  const [dispatchOdo, setDispatchOdo] = useState<number>(0);
  const [dispatchTime, setDispatchTime] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  const [returnOdo, setReturnOdo] = useState<number>(0);
  const [returnTime, setReturnTime] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [nightHalts, setNightHalts] = useState<number>(0);
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [returnError, setReturnError] = useState<string>('');

  const filteredRentals = rentals.filter((r) => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.bookingNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.toLowerCase().includes(q) ||
        r.vehicleReg.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE');
  const selectedCarDetails = vehicles.find((v) => v._id === bookVehicleId);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookError('');
    if (!custName || !custPhone || !bookVehicleId || !expectedReturn || advanceAmount <= 0) {
      setBookError('All required fields and a valid advance remittance must be provided.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.createBooking({
        customerName: custName,
        customerPhone: custPhone,
        customerLicense: custLicense,
        vehicleId: bookVehicleId,
        expectedReturnDate: expectedReturn,
        advanceAmount: Number(advanceAmount),
        notes: bookNotes,
      });
      if (res.success) {
        setShowBookModal(false);
        setCustName('');
        setCustPhone('');
        setCustLicense('');
        setBookNotes('');
        if (onClearSelectedVehicle) onClearSelectedVehicle();
        onRefresh();
      } else {
        setBookError(res.message);
      }
    } catch (err) {
      setBookError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDispatch = (rental: RentalBooking) => {
    setDispatchModalRental(rental);
    const v = vehicles.find((veh) => veh.registrationNumber === rental.vehicleReg);
    setDispatchOdo(v?.currentOdometer || 0);
    setDispatchTime(new Date().toISOString().slice(0, 16));
  };

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalRental) return;
    setLoading(true);
    try {
      await api.dispatchVehicle(dispatchModalRental._id, {
        dispatchedAt: dispatchTime ? new Date(dispatchTime).toISOString() : undefined,
        startOdometer: Number(dispatchOdo),
      });
      setDispatchModalRental(null);
      onRefresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReturn = (rental: RentalBooking) => {
    setReturnModalRental(rental);
    const startOdo = rental.startOdometer || 0;
    setReturnOdo(startOdo + 60);
    setReturnTime(new Date().toISOString().slice(0, 16));
    if (rental.dispatchedAt) {
      const hours = (Date.now() - new Date(rental.dispatchedAt).getTime()) / (1000 * 60 * 60);
      setNightHalts(Math.floor(hours / 24));
    } else {
      setNightHalts(0);
    }
    setReturnError('');
  };

  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalRental) return;
    setReturnError('');
    if (returnOdo < (returnModalRental.startOdometer || 0)) {
      setReturnError(`Ending odometer (${returnOdo}) cannot be less than departure reading (${returnModalRental.startOdometer})`);
      return;
    }
    setLoading(true);
    try {
      const res = await api.returnVehicle(returnModalRental._id, {
        actualReturnDate: returnTime ? new Date(returnTime).toISOString() : undefined,
        endOdometer: Number(returnOdo),
        nightHalts: Number(nightHalts),
        notes: returnNotes,
      });
      if (res.success) {
        setBillReceipt(res.data.calculationDetails);
        setReturnModalRental(null);
        onRefresh();
      } else {
        setReturnError(res.message);
      }
    } catch (err) {
      setReturnError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="border-b border-ivory-100/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-archival text-tan-500 mb-1">
            Section 03 • Operations & Dispatch Registry
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-ivory-100 font-normal">
            Dispatch Manifest, Odometer Deposition & Gazette Settlements
          </h2>
          <p className="font-sans text-xs text-ivory-300/70 font-light mt-2 max-w-2xl">
            Issuance of authorized trip reservations, departure verification with mile-meter logging, trip re-entry filings, and statutory tariff reconciliations.
          </p>
        </div>
        <button
          onClick={() => {
            if (availableVehicles.length === 0) {
              alert('All enrolled fleet vehicles are currently dispatched or grounded in workshop.');
              return;
            }
            setShowBookModal(true);
          }}
          className="px-5 py-2.5 border border-tan-500/50 bg-tan-500/10 hover:bg-tan-500/20 text-tan-400 hover:text-ivory-100 text-xs font-mono tracking-widest uppercase transition-colors"
        >
          + Issue New Reservation Docket
        </button>
      </div>

      {/* Control & Query Bar */}
      <div className="bg-navy-900 border border-ivory-100/10 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <input
            type="text"
            placeholder="Search booking #, customer, or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-navy-950 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-tan-500/60 w-full sm:w-64"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-navy-950 border border-ivory-100/10 text-ivory-200 focus:outline-none focus:border-tan-500/60"
          >
            <option value="ALL">All Manifest Records ({rentals.length})</option>
            <option value="BOOKED">Booked (Pending Departure)</option>
            <option value="DISPATCHED">Dispatched (Active Journey)</option>
            <option value="RETURNED_SETTLED">Returned & Gazette Settled</option>
          </select>
        </div>

        <div className="text-[11px] font-mono text-ivory-300/40">
          {availableVehicles.length} Sovereign Assets Ready for Deployment
        </div>
      </div>

      {/* Manifest Table */}
      <div>
        <SectionLabel number="04" label="Trip Manifest & Settlement Registry" badge={`${filteredRentals.length} Dockets`} />
        <div className="border border-ivory-100/10 overflow-hidden bg-navy-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-ivory-100/10 bg-navy-950/80 text-[10px] font-mono text-ivory-300/60 uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-3.5">Docket Identifier</th>
                  <th className="px-5 py-3.5">Citizen / Customer</th>
                  <th className="px-5 py-3.5">Assigned Asset</th>
                  <th className="px-5 py-3.5">Advance Remittance</th>
                  <th className="px-5 py-3.5">Deposition Data</th>
                  <th className="px-5 py-3.5">Custody Status</th>
                  <th className="px-5 py-3.5">Settlement Outcome</th>
                  <th className="px-5 py-3.5 text-right">Procedural Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-100/5 font-light">
                {filteredRentals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-ivory-300/40 font-mono text-xs">
                      No operational records correspond to query parameters.
                    </td>
                  </tr>
                ) : (
                  filteredRentals.map((r) => {
                    let statusBadge = 'border-ivory-100/20 text-ivory-300 bg-ivory-100/5';
                    if (r.status === 'BOOKED') statusBadge = 'border-amber-500/40 text-amber-300 bg-amber-500/5';
                    if (r.status === 'DISPATCHED') statusBadge = 'border-blue-500/40 text-blue-300 bg-blue-500/5';
                    if (r.status === 'RETURNED_SETTLED') statusBadge = 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5';

                    return (
                      <tr key={r._id} className="hover:bg-navy-850/60 transition-colors">
                        <td className="px-5 py-4 font-mono font-medium text-ivory-100">
                          {r.bookingNumber}
                          <div className="text-[10px] text-ivory-300/40">
                            {new Date(r.bookingDate).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-serif text-sm text-ivory-100 font-medium">{r.customerName}</div>
                          <div className="font-mono text-[10px] text-ivory-300/50">{r.customerPhone}</div>
                        </td>

                        <td className="px-5 py-4 font-mono">
                          <div className="text-ivory-200 font-semibold">{r.vehicleReg}</div>
                          <div className="text-[10px] text-ivory-300/40">
                            {r.categoryName} • {r.isAC ? 'AC (+50%)' : 'Non-AC'}
                          </div>
                        </td>

                        <td className="px-5 py-4 font-mono text-tan-400 font-medium">
                          ₹{r.advanceAmount.toLocaleString()}
                        </td>

                        <td className="px-5 py-4 font-mono text-[11px]">
                          {r.status === 'BOOKED' && (
                            <div className="text-ivory-300/60">
                              Exp: {new Date(r.expectedReturnDate).toLocaleDateString()}
                            </div>
                          )}
                          {r.status === 'DISPATCHED' && (
                            <div>
                              <div className="text-blue-300/90 font-medium">
                                Start: {r.startOdometer} KM
                              </div>
                              <div className="text-ivory-300/40 text-[10px]">
                                Dep: {new Date(r.dispatchedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          )}
                          {r.status === 'RETURNED_SETTLED' && (
                            <div>
                              <span className="text-ivory-200">{r.distanceKm} KM</span> ({r.durationHours}h)
                              {r.nightHalts > 0 && <span className="text-tan-400 block text-[10px]">{r.nightHalts} Night Halts</span>}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-block px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${statusBadge}`}>
                            {r.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-mono">
                          {r.status === 'RETURNED_SETTLED' ? (
                            <div>
                              <div className="text-ivory-100 font-medium">Bill: ₹{r.totalAmount?.toLocaleString()}</div>
                              <span className={`text-[10px] uppercase font-semibold ${
                                r.settlementType === 'REFUND' ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                {r.settlementType === 'REFUND' && `Refund: ₹${r.settlementAmount}`}
                                {r.settlementType === 'ADDITIONAL_PAYMENT' && `Due: ₹${r.settlementAmount}`}
                                {r.settlementType === 'EXACT' && 'Exact Balance'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-ivory-300/30 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {r.status === 'BOOKED' && (
                            <button
                              onClick={() => handleOpenDispatch(r)}
                              className="px-3 py-1 border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-mono text-[11px] uppercase tracking-wider transition-colors"
                            >
                              Dispatch Asset
                            </button>
                          )}

                          {r.status === 'DISPATCHED' && (
                            <button
                              onClick={() => handleOpenReturn(r)}
                              className="px-3 py-1 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-mono text-[11px] uppercase tracking-wider transition-colors"
                            >
                              File Return
                            </button>
                          )}

                          {r.status === 'RETURNED_SETTLED' && (
                            <button
                              onClick={() => {
                                setBillReceipt({
                                  effectiveHourlyRate: r.hourlyRate,
                                  effectiveKmRate: r.kmRate,
                                  hoursUsed: r.durationHours,
                                  distanceKm: r.distanceKm,
                                  nightHalts: r.nightHalts,
                                  hourlyCharge: r.hourlyChargeAmount,
                                  kmCharge: r.kmChargeAmount,
                                  min4HourCharge: r.minChargeAmount,
                                  usageCharge: Math.max(r.hourlyChargeAmount || 0, r.kmChargeAmount || 0, r.minChargeAmount || 0),
                                  nightHaltCharge: r.nightHaltCharge,
                                  totalAmount: r.totalAmount,
                                  advanceAmount: r.advanceAmount,
                                  settlementType: r.settlementType,
                                  settlementAmount: r.settlementAmount,
                                  customerName: r.customerName,
                                  vehicleReg: r.vehicleReg,
                                  bookingNumber: r.bookingNumber,
                                  categoryName: r.categoryName,
                                  isAC: r.isAC,
                                });
                              }}
                              className="px-2.5 py-1 text-[11px] font-mono text-tan-400 hover:text-ivory-100 border border-tan-500/30 hover:border-tan-400 transition-colors uppercase tracking-wider"
                            >
                              Inspect Voucher
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Booking Filing Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-ivory-100/20 max-w-lg w-full p-8 shadow-2xl">
            <div className="border-b border-ivory-100/10 pb-4 mb-6">
              <div className="font-mono text-[10px] uppercase tracking-archival text-tan-500">
                Official Docket Entry • Form TR-02
              </div>
              <h3 className="font-serif text-2xl text-ivory-100 font-normal mt-1">
                Citizen Rental Reservation & Advance Deposition
              </h3>
            </div>

            {bookError && (
              <div className="mb-4 p-3 border border-rose-500/30 bg-rose-500/10 text-rose-300 font-mono text-xs">
                {bookError}
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                    Citizen / Hirer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand R. Varma"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-tan-500/60"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                    Official Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98220 11223"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-tan-500/60 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Select Certified Available Asset *
                </label>
                <select
                  value={bookVehicleId}
                  onChange={(e) => setBookVehicleId(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-200 font-mono focus:outline-none focus:border-tan-500/60"
                >
                  {availableVehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} — {v.categoryName} ({v.isAC ? 'AC: +50% Surcharge' : 'Non-AC Standard'}) [Odo: {v.currentOdometer} KM]
                    </option>
                  ))}
                </select>
              </div>

              {selectedCarDetails && (
                <div className="p-3 bg-navy-950 border border-ivory-100/10 font-mono text-[11px] text-ivory-300/70">
                  <div className="text-tan-400 font-semibold">
                    Tariff Notice: {selectedCarDetails.categoryName} ({selectedCarDetails.isAC ? 'Climate Controlled' : 'Standard Non-AC'})
                  </div>
                  <div className="text-ivory-300/50 mt-1">
                    Minimum statutory billing: 4.0 Hours. Demurrage for overnight halt: ₹150 flat.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                    Expected Re-Entry Timestamp *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                    Advance Remittance Deposition (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Driving License Number / Identity Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. DL-1420110098765"
                  value={custLicense}
                  onChange={(e) => setCustLicense(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-ivory-100/10">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 font-mono text-xs text-ivory-300/60 hover:text-ivory-100 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 border border-tan-500/60 bg-tan-500/10 hover:bg-tan-500/20 text-tan-400 font-mono text-xs uppercase tracking-widest"
                >
                  {loading ? 'Executing...' : 'Enact Booking Docket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {dispatchModalRental && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-amber-500/40 max-w-md w-full p-8 shadow-2xl">
            <div className="border-b border-ivory-100/10 pb-4 mb-6">
              <div className="font-mono text-[10px] uppercase tracking-archival text-amber-400">
                Departure Protocol • Form TR-03
              </div>
              <h3 className="font-serif text-2xl text-ivory-100 font-normal mt-1">
                Record Departure Mile-Meter Deposition
              </h3>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-4 font-sans text-xs">
              <div className="p-3 bg-navy-950 border border-ivory-100/10 font-mono text-[11px] space-y-1">
                <div>Docket: <span className="text-ivory-100 font-medium">{dispatchModalRental.bookingNumber}</span></div>
                <div>Citizen: <span className="text-ivory-100 font-medium">{dispatchModalRental.customerName}</span></div>
                <div>Asset: <span className="text-tan-400 font-semibold">{dispatchModalRental.vehicleReg}</span> ({dispatchModalRental.categoryName})</div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Starting Mile-Meter Reading (KM) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={dispatchOdo}
                  onChange={(e) => setDispatchOdo(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Departure Timestamp *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={dispatchTime}
                  onChange={(e) => setDispatchTime(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-ivory-100/10">
                <button
                  type="button"
                  onClick={() => setDispatchModalRental(null)}
                  className="px-4 py-2 font-mono text-xs text-ivory-300/60 hover:text-ivory-100 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 border border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs uppercase tracking-widest"
                >
                  {loading ? 'Authorizing...' : 'Authorize Departure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return & Re-Entry Modal */}
      {returnModalRental && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-emerald-500/40 max-w-md w-full p-8 shadow-2xl">
            <div className="border-b border-ivory-100/10 pb-4 mb-6">
              <div className="font-mono text-[10px] uppercase tracking-archival text-emerald-400">
                Re-Entry Deposition • Form TR-04
              </div>
              <h3 className="font-serif text-2xl text-ivory-100 font-normal mt-1">
                Vehicle Return & Settlement Deposition
              </h3>
            </div>

            {returnError && (
              <div className="mb-4 p-3 border border-rose-500/30 bg-rose-500/10 text-rose-300 font-mono text-xs">
                {returnError}
              </div>
            )}

            <form onSubmit={handleConfirmReturn} className="space-y-4 font-sans text-xs">
              <div className="p-3 bg-navy-950 border border-ivory-100/10 font-mono text-[11px] space-y-1">
                <div>Docket: <span className="text-ivory-100">{returnModalRental.bookingNumber}</span> ({returnModalRental.customerName})</div>
                <div>Departure Odometer: <span className="text-tan-400">{returnModalRental.startOdometer} KM</span></div>
                <div>Advance Remitted: <span className="text-emerald-400">₹{returnModalRental.advanceAmount}</span></div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Ending Mile-Meter Reading (KM) *
                </label>
                <input
                  type="number"
                  required
                  min={returnModalRental.startOdometer || 0}
                  value={returnOdo}
                  onChange={(e) => setReturnOdo(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-emerald-500/60"
                />
                <span className="font-mono text-[10px] text-ivory-300/40 mt-1 block">
                  Computed Traverse Distance: {Math.max(0, returnOdo - (returnModalRental.startOdometer || 0))} KM
                </span>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Actual Re-Entry Timestamp *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Overnight Demurrage Halts (@ ₹150 / halt)
                </label>
                <input
                  type="number"
                  min={0}
                  value={nightHalts}
                  onChange={(e) => setNightHalts(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Deposition Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional re-entry condition report"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-ivory-100/10">
                <button
                  type="button"
                  onClick={() => setReturnModalRental(null)}
                  className="px-4 py-2 font-mono text-xs text-ivory-300/60 hover:text-ivory-100 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 border border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-widest"
                >
                  {loading ? 'Computing...' : 'Calculate & Issue Gazette Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Gazette Settlement Voucher Receipt */}
      {billReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-navy-900 border-2 border-tan-500/50 max-w-lg w-full p-8 shadow-2xl relative">
            {/* Archival Decorative Border Frame */}
            <div className="absolute inset-1.5 border border-tan-500/20 pointer-events-none" />

            <div className="border-b border-ivory-100/15 pb-5 mb-5 text-center">
              <div className="font-mono text-[10px] uppercase tracking-archival text-tan-500 mb-1">
                Statutory Settlement Voucher • Gazette Series 2026
              </div>
              <h3 className="font-serif text-3xl text-ivory-100 font-normal">
                Official Remittance & Refund Statement
              </h3>
              <div className="font-mono text-[11px] text-ivory-300/60 mt-1">
                Docket: {billReceipt.bookingNumber} • Asset: {billReceipt.vehicleReg}
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 p-3 bg-navy-950 border border-ivory-100/10">
                <div>Citizen: <span className="text-ivory-100">{billReceipt.customerName || 'Recorded'}</span></div>
                <div>Model: <span className="text-ivory-100">{billReceipt.categoryName}</span></div>
                <div>Elapsed Duration: <span className="text-tan-400">{billReceipt.hoursUsed} Hours</span></div>
                <div>Odometer Traverse: <span className="text-tan-400">{billReceipt.distanceKm} KM</span></div>
              </div>

              <div className="space-y-2 border-t border-ivory-100/10 pt-3">
                <div className="flex justify-between text-ivory-300/70">
                  <span>Hourly Charge ({billReceipt.hoursUsed}h × ₹{billReceipt.effectiveHourlyRate}/h)</span>
                  <span className="text-ivory-200">₹{billReceipt.hourlyCharge}</span>
                </div>
                <div className="flex justify-between text-ivory-300/70">
                  <span>Kilometer Charge ({billReceipt.distanceKm}km × ₹{billReceipt.effectiveKmRate}/km)</span>
                  <span className="text-ivory-200">₹{billReceipt.kmCharge}</span>
                </div>
                <div className="flex justify-between text-ivory-300/50 italic">
                  <span>Mandatory Statutory 4-Hour Floor Clause</span>
                  <span>₹{billReceipt.min4HourCharge}</span>
                </div>
                <div className="flex justify-between font-semibold text-ivory-100 border-t border-ivory-100/5 pt-1.5">
                  <span>Selected Regulated Usage Charge (Higher of Above)</span>
                  <span className="text-tan-400">₹{billReceipt.usageCharge}</span>
                </div>
                <div className="flex justify-between text-ivory-300/70">
                  <span>Overnight Demurrage ({billReceipt.nightHalts} Halts × ₹150)</span>
                  <span className="text-ivory-200">₹{billReceipt.nightHaltCharge}</span>
                </div>
                <div className="flex justify-between font-serif text-lg text-ivory-100 border-t border-ivory-100/15 pt-2">
                  <span>Total Statutory Chargeable Assessment:</span>
                  <span className="font-mono text-tan-400">₹{billReceipt.totalAmount}</span>
                </div>
                <div className="flex justify-between text-ivory-300/70">
                  <span>Advance Remittance Received by Treasury:</span>
                  <span className="text-ivory-100">- ₹{billReceipt.advanceAmount}</span>
                </div>
              </div>

              {/* Settlement Banner */}
              <div className={`p-4 border text-center ${
                billReceipt.settlementType === 'REFUND'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : billReceipt.settlementType === 'ADDITIONAL_PAYMENT'
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-ivory-100/20 bg-ivory-100/5 text-ivory-200'
              }`}>
                <div className="text-[10px] uppercase tracking-archival">
                  {billReceipt.settlementType === 'REFUND' && 'Official Refund Remittance Issued to Citizen'}
                  {billReceipt.settlementType === 'ADDITIONAL_PAYMENT' && 'Additional Remittance Due from Citizen'}
                  {billReceipt.settlementType === 'EXACT' && 'Exact Fiscal Reconciliation'}
                </div>
                <div className="font-serif text-3xl font-medium mt-1">
                  ₹{billReceipt.settlementAmount?.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setBillReceipt(null)}
                className="px-6 py-2 border border-tan-500/60 bg-navy-950 text-tan-400 hover:text-ivory-100 font-mono text-xs uppercase tracking-widest"
              >
                Conclude Deposition Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
