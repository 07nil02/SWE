import React from 'react';
import { Vehicle, CategoryStat } from '../api/client';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  category?: CategoryStat;
  onClose: () => void;
  onProceedToBooking: (vehicle: Vehicle) => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  'Ambassador': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1400',
  'Tata Sumo': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1400',
  'Maruti Omni': 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&q=80&w=1400',
  'Maruti Esteem': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1400',
  'Mahindra Armada': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1400',
};

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  category,
  onClose,
  onProceedToBooking,
}) => {
  if (!vehicle) return null;

  const acMult = vehicle.isAC ? 1.5 : 1.0;
  const baseHr = category ? category.baseHourlyRate : 100;
  const baseKm = category ? category.baseKmRate : 12;
  const effectiveHr = Math.round(baseHr * acMult);
  const effectiveKm = Number((baseKm * acMult).toFixed(1));
  const min4Hr = effectiveHr * 4;
  const imageUrl = CATEGORY_IMAGES[vehicle.categoryName] || CATEGORY_IMAGES['Ambassador'];

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white max-w-5xl w-full border border-stone-300 shadow-2xl overflow-hidden my-8">
        {/* Top Minimal Bar */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-stone-200 bg-stone-50">
          <div className="font-mono text-xs text-charcoal-500 tracking-luxury uppercase">
            Catalogue Dossier // {vehicle.registrationNumber}
          </div>
          <button
            onClick={onClose}
            className="text-charcoal-400 hover:text-charcoal-900 font-mono text-sm tracking-wider uppercase transition-colors"
          >
            [ Close ✕ ]
          </button>
        </div>

        {/* Two-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Automotive Photography (7 Cols) */}
          <div className="lg:col-span-7 bg-charcoal-900 relative min-h-[360px] lg:min-h-full">
            <img
              src={imageUrl}
              alt={vehicle.categoryName}
              className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05]"
            />
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-charcoal-950/85 backdrop-blur-sm border border-stone-200/10 text-stone-100 flex justify-between items-center text-xs font-mono">
              <span>Status: {vehicle.status}</span>
              <span>Odometer: {vehicle.currentOdometer.toLocaleString()} KM</span>
            </div>
          </div>

          {/* Right Column: Specifications & Booking Form (5 Cols) */}
          <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="font-mono text-xs uppercase tracking-luxury text-champagne-600 mb-2">
                {vehicle.categoryName} Series
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-normal tracking-tight mb-2">
                {vehicle.categoryName}
              </h2>

              <p className="font-sans text-xs text-charcoal-500 font-light leading-relaxed mb-6">
                Meticulously inspected transport asset enrolled in sovereign company fleet. Fully certified for local and outstation transit.
              </p>

              {/* Pricing Cards */}
              <div className="p-4 bg-stone-50 border border-stone-200 mb-6">
                <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal-500 block mb-1">
                  Standard Tariff Structure
                </span>
                <div className="flex justify-between items-baseline">
                  <div className="font-serif text-2xl text-charcoal-950 font-semibold">
                    ₹{effectiveHr} <span className="font-sans text-xs text-charcoal-500 font-normal">/ hr</span>
                  </div>
                  <div className="font-mono text-xs text-charcoal-800 font-medium">
                    ₹{effectiveKm} / km
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-200/80 flex justify-between items-center text-xs font-mono">
                  <span className="text-charcoal-500">Statutory 4-Hr Floor:</span>
                  <span className="font-semibold text-charcoal-950">₹{min4Hr.toLocaleString()}</span>
                </div>
              </div>

              {/* Specifications Grid */}
              <div className="space-y-2.5 font-sans text-xs border-t border-stone-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-mono text-[11px] uppercase">Climate Apparatus</span>
                  <span className="font-medium text-charcoal-900">
                    {vehicle.isAC ? 'Air Conditioned (1.5× Rate Surcharge)' : 'Standard Non-AC'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-mono text-[11px] uppercase">Seating Capacity</span>
                  <span className="font-medium text-charcoal-900">{category?.seatingCapacity || 5} Passengers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-mono text-[11px] uppercase">Fuel Propulsion</span>
                  <span className="font-medium text-charcoal-900">{category?.fuelType || 'Diesel'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-mono text-[11px] uppercase">Overnight Demurrage</span>
                  <span className="font-medium text-charcoal-900">₹150 Flat per night halt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500 font-mono text-[11px] uppercase">Registration Mark</span>
                  <span className="font-mono font-semibold text-charcoal-900">{vehicle.registrationNumber}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-stone-200">
              {vehicle.status === 'AVAILABLE' ? (
                <button
                  onClick={() => {
                    onClose();
                    onProceedToBooking(vehicle);
                  }}
                  className="w-full py-3.5 bg-charcoal-950 hover:bg-charcoal-800 text-stone-50 font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Reserve This Vehicle</span>
                  <span>→</span>
                </button>
              ) : (
                <div className="p-3 bg-stone-100 text-stone-500 font-mono text-xs text-center border border-stone-200">
                  Currently {vehicle.status}. Inquire with dispatcher for next readiness.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
