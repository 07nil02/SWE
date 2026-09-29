import React, { useState } from 'react';
import { Vehicle, CategoryStat } from '../api/client';

interface FleetSectionProps {
  vehicles: Vehicle[];
  categories: CategoryStat[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onQuickBook: (vehicle: Vehicle) => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  'Ambassador': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
  'Tata Sumo': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
  'Maruti Omni': 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&q=80&w=1200',
  'Maruti Esteem': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200',
  'Mahindra Armada': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1200',
};

const CATEGORY_TAGLINES: Record<string, string> = {
  'Ambassador': 'Timeless Heritage Saloon · Supreme Ride Comfort',
  'Tata Sumo': 'High-Capacity Multi-Utility · Outstation Touring',
  'Maruti Omni': 'Versatile Passenger Microvan · City Transit',
  'Maruti Esteem': 'Executive Midsize Sedan · Refined Power',
  'Mahindra Armada': 'Heavy-Duty Expedition 4x4 · All-Terrain Utility',
};

export const FleetSection: React.FC<FleetSectionProps> = ({
  vehicles,
  categories,
  onSelectVehicle,
  onQuickBook,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [acFilter, setAcFilter] = useState<'ALL' | 'AC' | 'NON_AC'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE'>('ALL');
  const [search, setSearch] = useState<string>('');

  const filteredVehicles = vehicles.filter((v) => {
    if (activeCategory !== 'ALL' && v.categoryName !== activeCategory) return false;
    if (acFilter === 'AC' && !v.isAC) return false;
    if (acFilter === 'NON_AC' && v.isAC) return false;
    if (statusFilter === 'AVAILABLE' && v.status !== 'AVAILABLE') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.registrationNumber.toLowerCase().includes(q) ||
        v.categoryName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <section id="fleet" className="py-24 max-w-7xl mx-auto px-6 sm:px-10">
      {/* Section Masthead */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-stone-200 pb-8 mb-10">
        <div>
          <span className="font-mono text-xs text-champagne-500 uppercase tracking-editorial font-medium block mb-2">
            THE FLEET
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl text-charcoal-950 font-normal tracking-tight">
            Choose how you want to move.
          </h2>
        </div>
        <p className="font-sans text-sm text-charcoal-500 font-light max-w-md mt-4 md:mt-0 leading-relaxed">
          52 pristine vehicles spanning executive sedans, heavy-duty utility SUVs, and spacious group transporters. Every model inspected before departure.
        </p>
      </div>

      {/* Editorial Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-stone-200/80">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors border ${
              activeCategory === 'ALL'
                ? 'bg-charcoal-950 text-stone-50 border-charcoal-950'
                : 'text-charcoal-600 hover:text-charcoal-950 border-transparent hover:border-stone-300'
            }`}
          >
            All Classes ({vehicles.length})
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setActiveCategory(c.name)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors border ${
                activeCategory === c.name
                  ? 'bg-charcoal-950 text-stone-50 border-charcoal-950'
                  : 'text-charcoal-600 hover:text-charcoal-950 border-transparent hover:border-stone-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          {/* AC Filter */}
          <select
            value={acFilter}
            onChange={(e) => setAcFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-stone-300 text-charcoal-800 focus:outline-none focus:border-charcoal-950"
          >
            <option value="ALL">Climate: Any</option>
            <option value="AC">AC (+50% Rate)</option>
            <option value="NON_AC">Non-AC Standard</option>
          </select>

          {/* Availability */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'ALL' ? 'AVAILABLE' : 'ALL')}
            className={`px-3 py-1.5 border transition-colors ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-charcoal-700 border-stone-300'
            }`}
          >
            {statusFilter === 'AVAILABLE' ? '✓ Ready Only' : 'Available Readiness'}
          </button>

          {/* Search */}
          <input
            type="text"
            placeholder="Search reg / model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 bg-white border border-stone-300 text-charcoal-800 focus:outline-none focus:border-charcoal-950 w-44"
          />
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVehicles.map((v) => {
          const category = categories.find((c) => c.name === v.categoryName);
          const acMult = v.isAC ? 1.5 : 1.0;
          const hrRate = category ? Math.round(category.baseHourlyRate * acMult) : 100;
          const kmRate = category ? Number((category.baseKmRate * acMult).toFixed(1)) : 12;
          const min4Hr = hrRate * 4;
          const imageUrl = CATEGORY_IMAGES[v.categoryName] || CATEGORY_IMAGES['Ambassador'];
          const tagline = CATEGORY_TAGLINES[v.categoryName] || 'Curated Fleet Asset';

          const isAvailable = v.status === 'AVAILABLE';

          return (
            <div
              key={v._id}
              className="editorial-card group bg-white border border-stone-200/90 hover:border-charcoal-900 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Container with Editorial Proportions */}
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-charcoal-900">
                  <img
                    src={imageUrl}
                    alt={v.categoryName}
                    className="editorial-image w-full h-full object-cover transition-transform duration-700 ease-out filter brightness-[0.92] contrast-[1.05]"
                  />
                  {/* Subtle Top Badge */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                    <span className="font-mono text-[10px] tracking-wider uppercase bg-charcoal-950/80 text-stone-100 px-2.5 py-1 backdrop-blur-sm border border-stone-200/10">
                      {v.registrationNumber}
                    </span>
                    <span
                      className={`font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 backdrop-blur-sm border ${
                        isAvailable
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                          : v.status === 'RENTED_OUT'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-500/30'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {v.status === 'AVAILABLE' ? 'Ready for Drive' : v.status === 'RENTED_OUT' ? 'On Road' : 'Workshop'}
                    </span>
                  </div>
                </div>

                {/* Card Editorial Details */}
                <div className="p-6">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-luxury text-charcoal-500">
                      {v.categoryName.toUpperCase()}
                    </span>
                    <span className={`font-mono text-[10px] uppercase font-semibold ${
                      v.isAC ? 'text-champagne-600' : 'text-charcoal-400'
                    }`}>
                      {v.isAC ? 'Climate: AC (+50%)' : 'Standard Non-AC'}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl text-charcoal-950 font-normal tracking-tight mb-1">
                    {v.categoryName}
                  </h3>

                  <p className="font-sans text-xs text-charcoal-500 font-light mb-4">
                    {tagline}
                  </p>

                  {/* Specifications Strip */}
                  <div className="py-3 border-y border-stone-100 flex items-center justify-between text-xs font-sans text-charcoal-600">
                    <span>{category?.seatingCapacity || 5} Seats</span>
                    <span>•</span>
                    <span>{category?.fuelType || 'Diesel'}</span>
                    <span>•</span>
                    <span>Manual</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-charcoal-400">{v.currentOdometer.toLocaleString()} km</span>
                  </div>

                  {/* Rates Structure */}
                  <div className="mt-4 flex justify-between items-baseline">
                    <div>
                      <div className="font-serif text-xl text-charcoal-950 font-semibold">
                        ₹{hrRate} <span className="font-sans text-xs font-normal text-charcoal-500">/ hour</span>
                      </div>
                      <span className="font-mono text-[11px] text-charcoal-500 block">
                        ₹{kmRate} / kilometer
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-[10px] text-charcoal-400 block uppercase tracking-wider">
                        Statutory 4-Hr Floor
                      </span>
                      <span className="font-mono text-xs font-semibold text-charcoal-900">
                        ₹{min4Hr.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 pt-0 border-t border-transparent flex items-center justify-between gap-3">
                <button
                  onClick={() => onSelectVehicle(v)}
                  className="flex-1 py-2.5 border border-stone-300 hover:border-charcoal-950 text-charcoal-900 font-mono text-xs uppercase tracking-wider transition-colors text-center"
                >
                  View Details
                </button>

                {isAvailable ? (
                  <button
                    onClick={() => onQuickBook(v)}
                    className="flex-1 py-2.5 bg-charcoal-950 hover:bg-charcoal-800 text-stone-50 font-mono text-xs uppercase tracking-wider transition-colors text-center"
                  >
                    Reserve Now →
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-2.5 bg-stone-100 text-stone-400 font-mono text-xs uppercase tracking-wider cursor-not-allowed text-center"
                  >
                    Unavailable
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
