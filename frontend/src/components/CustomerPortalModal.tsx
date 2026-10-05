import React, { useState, useEffect } from 'react';
import { api, RentalBooking } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface CustomerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrowseFleet: () => void;
}

export const CustomerPortalModal: React.FC<CustomerPortalModalProps> = ({
  isOpen,
  onClose,
  onBrowseFleet,
}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<RentalBooking | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBookings();
    }
  }, [isOpen]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getMyBookings();
      setBookings(data);
      if (data.length > 0 && !selectedBooking) {
        setSelectedBooking(data[0]);
      }
    } catch (err) {
      console.error('Failed to load customer reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: RentalBooking['status']) => {
    switch (status) {
      case 'BOOKED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/30">
            CONFIRMED BOOKING
          </span>
        );
      case 'DISPATCHED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/30">
            ON VOYAGE / DISPATCHED
          </span>
        );
      case 'RETURNED_SETTLED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            SETTLED & RETURNED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide bg-red-500/10 text-red-400 border border-red-500/30">
            CANCELLED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#0c0e12] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#12151b] flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#c5a880] uppercase">
              Client Portal &bull; Reservations Ledger
            </div>
            <h2 className="text-2xl font-serif text-white mt-1">
              {user?.name ? `${user.name}’s Fleet Reservations` : 'My Reservations & Settlement Vouchers'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 flex overflow-hidden">
          {loading ? (
            <div className="w-full flex items-center justify-center text-neutral-400 font-mono text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-[#c5a880] animate-ping mr-2"></span>
              Retrieving encrypted customer reservation records...
            </div>
          ) : bookings.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl text-[#c5a880] mb-4">
                ✦
              </div>
              <h3 className="text-lg font-serif text-white mb-2">No Active or Past Reservations</h3>
              <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
                You have not booked any luxury vehicles yet. Browse our curated fleet, configure your hire terms, and secure your reservation.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onBrowseFleet();
                }}
                className="px-6 py-2.5 bg-[#c5a880] hover:bg-[#d8be99] text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition"
              >
                Explore Fleet Inventory
              </button>
            </div>
          ) : (
            <>
              {/* Left sidebar: Booking list */}
              <div className="w-2/5 border-r border-white/10 overflow-y-auto divide-y divide-white/5 p-3 space-y-2">
                {bookings.map((b) => {
                  const isSelected = selectedBooking?._id === b._id;
                  return (
                    <div
                      key={b._id}
                      onClick={() => setSelectedBooking(b)}
                      className={`p-4 rounded-xl cursor-pointer transition border ${
                        isSelected
                          ? 'bg-[#181c24] border-[#c5a880]/50 shadow-lg'
                          : 'bg-[#11141a]/60 hover:bg-[#151921] border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-semibold text-[#c5a880]">
                          {b.bookingNumber}
                        </span>
                        {getStatusBadge(b.status)}
                      </div>

                      <div className="text-sm font-medium text-white mb-1">
                        {b.categoryName} {b.isAC ? '(Air-Conditioned)' : '(Executive Standard)'}
                      </div>

                      <div className="text-xs text-neutral-400 font-mono mb-2">
                        Reg: <span className="text-neutral-200">{b.vehicleReg}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-2 border-t border-white/5">
                        <span>Advance: ${b.advanceAmount.toFixed(2)}</span>
                        <span>{new Date(b.bookingDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right view: Voucher & settlement docket */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#090b0e]">
                {selectedBooking ? (
                  <div className="space-y-6">
                    {/* Voucher Header Card */}
                    <div className="p-6 rounded-xl bg-gradient-to-br from-[#131720] to-[#0d0f14] border border-[#c5a880]/30 shadow-xl">
                      <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
                        <div>
                          <div className="text-[10px] font-mono tracking-widest text-[#c5a880] uppercase">
                            Official Rental Docket &amp; Voucher
                          </div>
                          <div className="text-2xl font-serif text-white mt-1">
                            {selectedBooking.categoryName}
                          </div>
                          <div className="text-xs text-neutral-400 font-mono mt-0.5">
                            Chassis / Reg: <span className="text-white font-semibold">{selectedBooking.vehicleReg}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-neutral-400">Booking Ref</div>
                          <div className="text-lg font-mono font-bold text-[#c5a880]">
                            {selectedBooking.bookingNumber}
                          </div>
                          <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                        <div>
                          <div className="text-neutral-500 uppercase text-[10px]">Client Name</div>
                          <div className="text-neutral-200 font-medium mt-0.5">{selectedBooking.customerName}</div>
                        </div>
                        <div>
                          <div className="text-neutral-500 uppercase text-[10px]">Contact Phone</div>
                          <div className="text-neutral-200 font-medium mt-0.5">{selectedBooking.customerPhone}</div>
                        </div>
                        <div>
                          <div className="text-neutral-500 uppercase text-[10px]">Driver's License</div>
                          <div className="text-neutral-200 font-medium mt-0.5">{selectedBooking.customerLicense || 'Verified on file'}</div>
                        </div>
                        <div>
                          <div className="text-neutral-500 uppercase text-[10px]">Advance Retained</div>
                          <div className="text-[#c5a880] font-semibold mt-0.5">${selectedBooking.advanceAmount.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline & Odometers */}
                    <div className="p-5 rounded-xl bg-[#12151b] border border-white/5 space-y-4">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                        Dispatch &amp; Voyage Metrics
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                          <div className="text-[10px] font-mono text-neutral-500 uppercase">Reservation Schedule</div>
                          <div className="mt-1 text-white">Booked: {new Date(selectedBooking.bookingDate).toLocaleString()}</div>
                          <div className="text-neutral-400 mt-0.5">Expected: {new Date(selectedBooking.expectedReturnDate).toLocaleString()}</div>
                          {selectedBooking.dispatchedAt && (
                            <div className="text-blue-400 mt-1 font-mono text-[11px]">
                              Dispatched: {new Date(selectedBooking.dispatchedAt).toLocaleString()}
                            </div>
                          )}
                          {selectedBooking.actualReturnDate && (
                            <div className="text-emerald-400 mt-0.5 font-mono text-[11px]">
                              Returned: {new Date(selectedBooking.actualReturnDate).toLocaleString()}
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono">
                          <div className="text-[10px] text-neutral-500 uppercase">Odometer &amp; Distance</div>
                          <div className="mt-1 text-white">
                            Start: {selectedBooking.startOdometer !== undefined ? `${selectedBooking.startOdometer.toLocaleString()} km` : 'Pending Dispatch'}
                          </div>
                          <div className="text-white mt-0.5">
                            End: {selectedBooking.endOdometer !== undefined ? `${selectedBooking.endOdometer.toLocaleString()} km` : 'Pending Return'}
                          </div>
                          {selectedBooking.distanceKm !== undefined && (
                            <div className="text-[#c5a880] font-semibold mt-1">
                              Distance Logged: {selectedBooking.distanceKm} km
                            </div>
                          )}
                          {selectedBooking.durationHours !== undefined && (
                            <div className="text-neutral-300 mt-0.5">
                              Duration: {selectedBooking.durationHours.toFixed(1)} hrs
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial Settlement Breakdown */}
                    {selectedBooking.status === 'RETURNED_SETTLED' ? (
                      <div className="p-5 rounded-xl bg-gradient-to-br from-[#121c16] to-[#0e1411] border border-emerald-500/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                            <span>✓</span> Certified Final Financial Settlement
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            OFFICIALLY AUDITED
                          </span>
                        </div>

                        <div className="space-y-2 text-xs font-mono divide-y divide-white/5">
                          <div className="flex justify-between py-1.5 text-neutral-300">
                            <span>Time Usage Charge ({selectedBooking.durationHours?.toFixed(1)}h @ ${selectedBooking.hourlyRate}/h)</span>
                            <span>${(selectedBooking.hourlyChargeAmount || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-1.5 text-neutral-300">
                            <span>Distance Run Charge ({selectedBooking.distanceKm}km @ ${selectedBooking.kmRate}/km)</span>
                            <span>${(selectedBooking.kmChargeAmount || 0).toFixed(2)}</span>
                          </div>
                          {(selectedBooking.nightHalts || 0) > 0 && (
                            <div className="flex justify-between py-1.5 text-neutral-300">
                              <span>Night Halts Charge ({selectedBooking.nightHalts} night(s) @ $50/night)</span>
                              <span>${(selectedBooking.nightHaltCharge || 0).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between py-2 text-white font-bold text-sm">
                            <span>Gross Rental Total</span>
                            <span>${(selectedBooking.totalAmount || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-1.5 text-neutral-400">
                            <span>Less: Advance Deposit Paid</span>
                            <span className="text-emerald-400">-${selectedBooking.advanceAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-2.5 text-base font-bold">
                            {selectedBooking.settlementType === 'REFUND' ? (
                              <>
                                <span className="text-emerald-300">Net Refund Due to Client:</span>
                                <span className="text-emerald-300">${(selectedBooking.settlementAmount || 0).toFixed(2)}</span>
                              </>
                            ) : selectedBooking.settlementType === 'ADDITIONAL_PAYMENT' ? (
                              <>
                                <span className="text-amber-300">Additional Settlement Due:</span>
                                <span className="text-amber-300">${(selectedBooking.settlementAmount || 0).toFixed(2)}</span>
                              </>
                            ) : (
                              <>
                                <span className="text-neutral-300">Settled Even:</span>
                                <span className="text-neutral-300">$0.00</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-neutral-400 font-mono">
                        ℹ Vehicle is currently in active reservation status. Final settlement will be computed upon return at fleet depot based on total elapsed hours, kilometer delta, and night halts.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-500 font-mono">
                    Select a reservation docket on the left to inspect voucher &amp; metrics
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
