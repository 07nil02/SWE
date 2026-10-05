import React, { useState } from 'react';

interface BookingSearchProps {
  onSearch: (criteria: {
    pickupLocation: string;
    returnLocation: string;
    pickupDate: string;
    returnDate: string;
    categoryFilter: string;
    isAC: boolean | null;
  }) => void;
}

export const BookingSearch: React.FC<BookingSearchProps> = ({ onSearch }) => {
  const [pickupLocation, setPickupLocation] = useState('New Delhi Airport (DEL)');
  const [sameReturnLocation, setSameReturnLocation] = useState(true);
  const [returnLocation, setReturnLocation] = useState('New Delhi Airport (DEL)');

  // Default dates: tomorrow to +3 days
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const threeDaysLater = new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [pickupDate, setPickupDate] = useState(tomorrow);
  const [returnDate, setReturnDate] = useState(threeDaysLater);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [acPreference, setAcPreference] = useState<'ANY' | 'AC' | 'NON_AC'>('ANY');
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const pMs = new Date(pickupDate).getTime();
    const rMs = new Date(returnDate).getTime();

    if (isNaN(pMs) || isNaN(rMs)) {
      setSearchError('Please specify valid departure and return dates/times.');
      return;
    }

    if (pMs < Date.now() - 10 * 60 * 1000) {
      setSearchError('Departure date cannot be in the past.');
      return;
    }

    if (rMs <= pMs) {
      setSearchError('Return date must be strictly after departure date.');
      return;
    }

    const durationHours = (rMs - pMs) / (1000 * 60 * 60);
    if (durationHours < 4) {
      setSearchError('Rental duration must be at least 4 hours (statutory minimum rental).');
      return;
    }

    onSearch({
      pickupLocation,
      returnLocation: sameReturnLocation ? pickupLocation : returnLocation,
      pickupDate,
      returnDate,
      categoryFilter,
      isAC: acPreference === 'ANY' ? null : acPreference === 'AC',
    });
  };

  const locations = [
    'New Delhi Airport (DEL)',
    'New Delhi Central (Connaught Place)',
    'Jaipur International Airport',
    'Agra Cantonment Hub',
    'Mumbai International (BOM)',
    'Bangalore Hub (BLR)',
    'Chandigarh Sector 17',
  ];

  return (
    <div className="w-full bg-charcoal-900/95 border border-stone-200/15 shadow-2xl backdrop-blur-md p-6 sm:p-8">
      {searchError && (
        <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded text-red-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>⚠</span>
            <span>{searchError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSearchError(null)}
            className="text-red-300 hover:text-white font-mono text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {/* Top Toggle Strip */}
        <div className="flex flex-wrap items-center justify-between border-b border-stone-200/10 pb-4 mb-6 text-xs font-mono">
          <div className="flex items-center space-x-6 text-stone-300">
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sameReturnLocation}
                onChange={(e) => {
                  setSameReturnLocation(e.target.checked);
                  if (e.target.checked) setReturnLocation(pickupLocation);
                }}
                className="w-3.5 h-3.5 accent-champagne-400 bg-charcoal-800 border-stone-200/20"
              />
              <span className="uppercase tracking-wider text-[11px]">Return to same location</span>
            </label>

            <span className="hidden sm:inline text-stone-200/20">|</span>

            <div className="flex items-center space-x-3">
              <span className="text-stone-400 uppercase tracking-wider text-[11px]">Climate:</span>
              <button
                type="button"
                onClick={() => setAcPreference('ANY')}
                className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border ${
                  acPreference === 'ANY'
                    ? 'border-champagne-400 text-champagne-300 bg-champagne-400/10'
                    : 'border-stone-200/10 text-stone-400'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setAcPreference('AC')}
                className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border ${
                  acPreference === 'AC'
                    ? 'border-champagne-400 text-champagne-300 bg-champagne-400/10'
                    : 'border-stone-200/10 text-stone-400'
                }`}
              >
                AC (+50%)
              </button>
              <button
                type="button"
                onClick={() => setAcPreference('NON_AC')}
                className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border ${
                  acPreference === 'NON_AC'
                    ? 'border-champagne-400 text-champagne-300 bg-champagne-400/10'
                    : 'border-stone-200/10 text-stone-400'
                }`}
              >
                Non-AC
              </button>
            </div>
          </div>

          <div className="text-[11px] text-champagne-400 font-mono mt-2 sm:mt-0 tracking-wider">
            ★ Statutory 4-Hour Minimum Rental Guarantee
          </div>
        </div>

        {/* Main Inputs Grid with Thin Crisp Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 divide-y md:divide-y-0 md:divide-x divide-stone-200/10 border border-stone-200/10 bg-charcoal-950/60">
          {/* Pick-Up Location */}
          <div className="md:col-span-3 p-4 flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-luxury text-stone-400 mb-1">
              Pick-up Hub
            </span>
            <select
              value={pickupLocation}
              onChange={(e) => {
                setPickupLocation(e.target.value);
                if (sameReturnLocation) setReturnLocation(e.target.value);
              }}
              className="w-full bg-transparent font-sans text-stone-100 text-sm font-medium focus:outline-none cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc} className="bg-charcoal-900 text-stone-100">
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Return Location (or Category selector if same return) */}
          <div className="md:col-span-3 p-4 flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-luxury text-stone-400 mb-1">
              {sameReturnLocation ? 'Vehicle Class' : 'Return Hub'}
            </span>
            {sameReturnLocation ? (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-transparent font-sans text-stone-100 text-sm font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-charcoal-900 text-stone-100">All Fleet Classes (52 Cars)</option>
                <option value="Ambassador" className="bg-charcoal-900 text-stone-100">Ambassador (Heritage Classic)</option>
                <option value="Tata Sumo" className="bg-charcoal-900 text-stone-100">Tata Sumo (Multi-Utility MUV)</option>
                <option value="Maruti Omni" className="bg-charcoal-900 text-stone-100">Maruti Omni (8-Seater Van)</option>
                <option value="Maruti Esteem" className="bg-charcoal-900 text-stone-100">Maruti Esteem (Executive Sedan)</option>
                <option value="Mahindra Armada" className="bg-charcoal-900 text-stone-100">Mahindra Armada (All-Terrain SUV)</option>
              </select>
            ) : (
              <select
                value={returnLocation}
                onChange={(e) => setReturnLocation(e.target.value)}
                className="w-full bg-transparent font-sans text-stone-100 text-sm font-medium focus:outline-none cursor-pointer"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc} className="bg-charcoal-900 text-stone-100">
                    {loc}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Pick-Up Date & Time */}
          <div className="md:col-span-2 p-4 flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-luxury text-stone-400 mb-1">
              Pick-up Date & Time
            </span>
            <input
              type="datetime-local"
              required
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-transparent font-mono text-stone-100 text-xs focus:outline-none cursor-pointer"
            />
          </div>

          {/* Return Date & Time */}
          <div className="md:col-span-2 p-4 flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-luxury text-stone-400 mb-1">
              Return Date & Time
            </span>
            <input
              type="datetime-local"
              required
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-transparent font-mono text-stone-100 text-xs focus:outline-none cursor-pointer"
            />
          </div>

          {/* Submit Action */}
          <div className="md:col-span-2 p-2 flex items-center">
            <button
              type="submit"
              className="w-full h-full min-h-[52px] bg-champagne-400 hover:bg-champagne-500 text-charcoal-950 font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <span>Search Fleet</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
