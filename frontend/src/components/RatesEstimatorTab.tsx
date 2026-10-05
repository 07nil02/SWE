import React, { useState } from 'react';
import { CategoryStat, api } from '../api/client';
import { SectionLabel } from './SectionLabel';

interface RatesEstimatorTabProps {
  categories: CategoryStat[];
  onRefresh: () => void;
}

export const RatesEstimatorTab: React.FC<RatesEstimatorTabProps> = ({ categories, onRefresh }) => {
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?._id || '');
  const [isAC, setIsAC] = useState<boolean>(false);
  const [hoursUsed, setHoursUsed] = useState<number>(4);
  const [distanceKm, setDistanceKm] = useState<number>(60);
  const [nightHalts, setNightHalts] = useState<number>(0);
  const [advanceAmount, setAdvanceAmount] = useState<number>(1500);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHourly, setEditHourly] = useState<number>(0);
  const [editKm, setEditKm] = useState<number>(0);
  const [savingRate, setSavingRate] = useState<boolean>(false);
  const [rateError, setRateError] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c._id === selectedCatId) || categories[0];

  const acMultiplier = isAC ? 1.5 : 1.0;
  const effectiveHourlyRate = selectedCategory ? Number((selectedCategory.baseHourlyRate * acMultiplier).toFixed(2)) : 0;
  const effectiveKmRate = selectedCategory ? Number((selectedCategory.baseKmRate * acMultiplier).toFixed(2)) : 0;

  const validHours = Math.max(0, hoursUsed || 0);
  const validDist = Math.max(0, distanceKm || 0);
  const validNight = Math.max(0, nightHalts || 0);
  const validAdv = Math.max(0, advanceAmount || 0);

  const hourlyCharge = Number((validHours * effectiveHourlyRate).toFixed(2));
  const kmCharge = Number((validDist * effectiveKmRate).toFixed(2));
  const min4HourCharge = Number((4 * effectiveHourlyRate).toFixed(2));
  const maxUsage = Math.max(hourlyCharge, kmCharge);
  const usageCharge = Math.max(maxUsage, min4HourCharge);
  const nightHaltCharge = validNight * 150;
  const totalAmount = Number((usageCharge + nightHaltCharge).toFixed(2));
  const diff = Number((validAdv - totalAmount).toFixed(2));

  let dominantNote = '';
  if (usageCharge === min4HourCharge && maxUsage < min4HourCharge) {
    dominantNote = 'Statutory 4-Hour Floor Clause Enforced (Elapsed trip under minimum threshold)';
  } else if (hourlyCharge >= kmCharge) {
    dominantNote = 'Hourly Tariff Component Dominated';
  } else {
    dominantNote = 'Kilometer Distance Tariff Dominated';
  }

  const handleStartEdit = (cat: CategoryStat) => {
    setRateError(null);
    setEditingId(cat._id);
    setEditHourly(cat.baseHourlyRate);
    setEditKm(cat.baseKmRate);
  };

  const handleSaveRate = async (id: string) => {
    setRateError(null);
    if (isNaN(editHourly) || editHourly <= 0 || isNaN(editKm) || editKm <= 0) {
      setRateError('Base hourly rate and kilometer rate must be positive numbers');
      return;
    }
    setSavingRate(true);
    try {
      await api.updateCategoryRates(id, editHourly, editKm);
      setEditingId(null);
      onRefresh();
    } catch (err) {
      setRateError((err as Error).message);
    } finally {
      setSavingRate(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Editorial Header */}
      <div className="border-b border-ivory-100/10 pb-6">
        <div className="font-mono text-[11px] uppercase tracking-archival text-tan-500 mb-1">
          Section 04 • Statutory Pricing Codex
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-ivory-100 font-normal">
          Regulated Tariff Schedule & Dual-Formula Fare Simulator
        </h2>
        <p className="font-sans text-xs text-ivory-300/70 font-light mt-2 max-w-2xl">
          Codified regulatory pricing structure applying the maximum of elapsed hours versus traversed kilometers, subject to the mandatory statutory 4-hour floor, 1.5× climate apparatus surcharge, and overnight demurrage.
        </p>
      </div>

      {/* Simulator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 bg-navy-900 border border-ivory-100/10 p-8 space-y-6">
          <SectionLabel number="05" label="Tariff Parameter Deposition" badge="Live Math Engine" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans text-xs">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                Vehicle Classification
              </label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-200 font-mono focus:outline-none focus:border-tan-500/60"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                Climate Apparatus
              </label>
              <button
                type="button"
                onClick={() => setIsAC(!isAC)}
                className={`w-full px-3 py-2 text-xs font-mono uppercase tracking-wider border text-left flex justify-between items-center transition-colors ${
                  isAC
                    ? 'border-tan-500/60 bg-tan-500/10 text-tan-400'
                    : 'border-ivory-100/10 bg-navy-950 text-ivory-300/60'
                }`}
              >
                <span>{isAC ? 'AC (+50% Surcharge)' : 'Standard Non-AC'}</span>
                <span>{isAC ? '1.5×' : '1.0×'}</span>
              </button>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                Elapsed Hours (Minimum: 4h)
              </label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={hoursUsed}
                onChange={(e) => setHoursUsed(Math.max(0.5, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                Traverse Distance (KM)
              </label>
              <input
                type="number"
                min={0}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                Overnight Demurrage Halts (₹150 / Halt)
              </label>
              <input
                type="number"
                min={0}
                value={nightHalts}
                onChange={(e) => setNightHalts(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                Citizen Advance Remittance (₹)
              </label>
              <input
                type="number"
                min={0}
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
              />
            </div>
          </div>

          <div className="p-4 bg-navy-950 border border-ivory-100/10 font-mono text-[11px] space-y-1">
            <div className="text-tan-400 font-semibold uppercase tracking-wider">
              Dominant Statutory Principle:
            </div>
            <div className="text-ivory-300/70">{dominantNote}</div>
          </div>
        </div>

        {/* Right Output Card (5 Cols) */}
        <div className="lg:col-span-5 bg-navy-900 border-2 border-tan-500/40 p-8 flex flex-col justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-archival text-tan-500">
              Statutory Calculation Output
            </div>
            <h3 className="font-serif text-3xl text-ivory-100 font-normal mt-1">
              {selectedCategory?.name} {isAC ? '(AC Equipped)' : '(Standard)'}
            </h3>

            <div className="mt-6 space-y-2.5 font-mono text-xs text-ivory-300/70">
              <div className="flex justify-between border-b border-ivory-100/5 pb-1.5">
                <span>Effective Rates:</span>
                <span className="text-ivory-100">₹{effectiveHourlyRate}/hr • ₹{effectiveKmRate}/km</span>
              </div>
              <div className="flex justify-between">
                <span>Duration Charge ({hoursUsed}h × ₹{effectiveHourlyRate}):</span>
                <span className="text-ivory-200">₹{hourlyCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Distance Charge ({distanceKm}km × ₹{effectiveKmRate}):</span>
                <span className="text-ivory-200">₹{kmCharge}</span>
              </div>
              <div className="flex justify-between text-ivory-300/50">
                <span>Minimum 4-Hour Floor Clause:</span>
                <span>₹{min4HourCharge}</span>
              </div>
              <div className="flex justify-between border-t border-ivory-100/10 pt-2 font-semibold text-ivory-100">
                <span>Gross Usage Charge:</span>
                <span className="text-tan-400">₹{usageCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Demurrage ({nightHalts} × ₹150):</span>
                <span className="text-ivory-200">₹{nightHaltCharge}</span>
              </div>
              <div className="flex justify-between border-t border-ivory-100/15 pt-3 font-serif text-xl text-ivory-100">
                <span>Total Statutory Amount:</span>
                <span className="font-mono text-tan-400 font-medium">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-ivory-300/60">
                <span>Advance Remittance:</span>
                <span>₹{advanceAmount}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-ivory-100/10">
            <div className={`p-4 border text-center font-mono ${
              diff > 0
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : diff < 0
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-ivory-100/20 bg-ivory-100/5 text-ivory-200'
            }`}>
              <div className="text-[10px] uppercase tracking-archival">
                {diff > 0 && 'Citizen Refund Remittance Due'}
                {diff < 0 && 'Additional Citizen Remittance Due'}
                {diff === 0 && 'Exact Fiscal Reconciliation'}
              </div>
              <div className="font-serif text-3xl font-medium mt-1">
                ₹{Math.abs(diff).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Tariff Schedule Table */}
      <div>
        <SectionLabel number="06" label="Authorized Sovereign Tariff Master Schedule" badge="Codex 2026" />
        {rateError && (
          <div className="mb-4 p-3 bg-red-950/70 border border-red-500/50 text-red-200 text-xs font-mono flex items-center justify-between">
            <span>⚠ {rateError}</span>
            <button onClick={() => setRateError(null)} className="text-red-400 hover:text-white">✕</button>
          </div>
        )}
        <div className="border border-ivory-100/10 overflow-hidden bg-navy-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-ivory-100/10 bg-navy-950/80 text-[10px] font-mono text-ivory-300/60 uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-3.5">Category Model</th>
                  <th className="px-5 py-3.5">Seating & Propulsion</th>
                  <th className="px-5 py-3.5">Standard Base Tariffs (Non-AC)</th>
                  <th className="px-5 py-3.5">Climate Controlled (+50%)</th>
                  <th className="px-5 py-3.5">Statutory 4-Hr Floor</th>
                  <th className="px-5 py-3.5">Enrolled Fleet Readiness</th>
                  <th className="px-5 py-3.5 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-100/5 font-light">
                {categories.map((c) => (
                  <tr key={c._id} className="hover:bg-navy-850/60 transition-colors">
                    <td className="px-5 py-4 font-serif text-sm text-ivory-100 font-medium">
                      {c.name}
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-ivory-300/50">
                      {c.seatingCapacity} Seater • {c.fuelType}
                    </td>
                    <td className="px-5 py-4 font-mono">
                      {editingId === c._id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={editHourly}
                            onChange={(e) => setEditHourly(Number(e.target.value))}
                            className="w-16 px-1.5 py-1 bg-navy-950 border border-ivory-100/20 text-ivory-100 text-xs"
                          />
                          <span>/hr,</span>
                          <input
                            type="number"
                            value={editKm}
                            onChange={(e) => setEditKm(Number(e.target.value))}
                            className="w-16 px-1.5 py-1 bg-navy-950 border border-ivory-100/20 text-ivory-100 text-xs"
                          />
                          <span>/km</span>
                        </div>
                      ) : (
                        <span className="text-ivory-200">₹{c.baseHourlyRate}/hr • ₹{c.baseKmRate}/km</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-tan-400 font-medium">
                      ₹{c.acHourlyRate}/hr • ₹{c.acKmRate}/km
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px]">
                      <div>Non-AC: ₹{c.minNonAcCharge}</div>
                      <div className="text-tan-400">AC: ₹{c.minAcCharge}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px]">
                      <span className="text-emerald-400">{c.availableNonAc} Non-AC</span>,{' '}
                      <span className="text-tan-400">{c.availableAc} AC</span>
                      <div className="text-[10px] text-ivory-300/40">Total {c.totalVehicles} in Custody</div>
                    </td>
                    <td className="px-5 py-4 text-right font-mono">
                      {editingId === c._id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-[10px] text-ivory-300/60 uppercase"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveRate(c._id)}
                            disabled={savingRate}
                            className="px-3 py-1 border border-emerald-500/50 text-emerald-400 bg-emerald-500/10 text-[10px] uppercase"
                          >
                            Save Rate
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(c)}
                          className="px-3 py-1 border border-tan-500/30 text-tan-400 hover:text-ivory-100 hover:border-tan-400 text-[10px] uppercase tracking-wider transition-colors"
                        >
                          Modify Tariff
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
