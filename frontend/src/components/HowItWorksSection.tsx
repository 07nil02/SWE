import React, { useState } from 'react';
import { CategoryStat } from '../api/client';

interface HowItWorksProps {
  categories: CategoryStat[];
}

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ categories }) => {
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?._id || '');
  const [isAC, setIsAC] = useState<boolean>(false);
  const [hours, setHours] = useState<number>(4);
  const [km, setKm] = useState<number>(60);
  const [nightHalts, setNightHalts] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(1500);

  const selectedCategory = categories.find((c) => c._id === selectedCatId) || categories[0];

  const acMult = isAC ? 1.5 : 1.0;
  const baseHr = selectedCategory ? selectedCategory.baseHourlyRate : 100;
  const baseKm = selectedCategory ? selectedCategory.baseKmRate : 12;
  const effHr = Math.round(baseHr * acMult);
  const effKm = Number((baseKm * acMult).toFixed(1));

  const hrCost = Math.round(hours * effHr);
  const kmCost = Math.round(km * effKm);
  const min4HrCost = effHr * 4;
  const maxUsage = Math.max(hrCost, kmCost);
  const selectedUsage = Math.max(maxUsage, min4HrCost);
  const nightHaltFee = nightHalts * 150;
  const totalBill = selectedUsage + nightHaltFee;
  const diff = advance - totalBill;

  return (
    <section id="how-it-works" className="py-24 bg-stone-100/70 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-stone-300 pb-8 mb-16">
          <div>
            <span className="font-mono text-xs text-champagne-600 uppercase tracking-editorial font-medium block mb-2">
              TARIFF STRUCTURE & HOW IT WORKS
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl text-charcoal-950 font-normal tracking-tight">
              Fair, dual-metric billing.
            </h2>
          </div>
          <p className="font-sans text-sm text-charcoal-500 font-light max-w-md mt-4 md:mt-0 leading-relaxed">
            Our rate cards apply the maximum of elapsed hours or kilometers traveled, with a protected 4-hour floor.
          </p>
        </div>

        {/* 3 Core Rules Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 bg-white border border-stone-200">
            <span className="font-mono text-xs text-champagne-600 font-semibold tracking-widest block mb-2">
              RULE 01
            </span>
            <h3 className="font-serif text-2xl text-charcoal-950 font-normal mb-3">
              The 4-Hour Minimum Floor
            </h3>
            <p className="font-sans text-xs text-charcoal-600 font-light leading-relaxed">
              Every vehicle can be hired for a minimum duration of 4 hours. Even if you return within 90 minutes, your baseline tariff is protected at the 4-hour floor rate.
            </p>
          </div>

          <div className="p-8 bg-white border border-stone-200">
            <span className="font-mono text-xs text-champagne-600 font-semibold tracking-widest block mb-2">
              RULE 02
            </span>
            <h3 className="font-serif text-2xl text-charcoal-950 font-normal mb-3">
              Max(Hours, Kilometers)
            </h3>
            <p className="font-sans text-xs text-charcoal-600 font-light leading-relaxed">
              You are charged the greater amount between elapsed hours multiplied by the hourly rate, and kilometers driven multiplied by the kilometer rate.
            </p>
          </div>

          <div className="p-8 bg-white border border-stone-200">
            <span className="font-mono text-xs text-champagne-600 font-semibold tracking-widest block mb-2">
              RULE 03
            </span>
            <h3 className="font-serif text-2xl text-charcoal-950 font-normal mb-3">
              Climate & Overnight Halts
            </h3>
            <p className="font-sans text-xs text-charcoal-600 font-light leading-relaxed">
              Air-conditioned vehicles of any category are billed at exactly 50% more than non-AC versions. Every overnight halt is charged a uniform ₹150 flat fee.
            </p>
          </div>
        </div>

        {/* Interactive Rate Simulator Panel */}
        <div className="bg-charcoal-950 text-stone-100 p-8 sm:p-10 border border-stone-200/10">
          <div className="border-b border-stone-200/10 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-luxury text-champagne-400 block mb-1">
                INSTANT FARE CALCULATOR
              </span>
              <h3 className="font-serif text-3xl text-stone-50 font-normal">
                Test the mathematical formula live.
              </h3>
            </div>
            <span className="font-mono text-xs text-stone-400">
              Guaranteed Zero Hidden Surcharges
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Inputs (7 Cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-mono">
              <div>
                <label className="block text-stone-400 text-[10px] uppercase tracking-wider mb-1">
                  Vehicle Model
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3 py-2 bg-charcoal-900 border border-stone-200/15 text-stone-100 focus:outline-none focus:border-champagne-400"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 text-[10px] uppercase tracking-wider mb-1">
                  Air Conditioning
                </label>
                <button
                  type="button"
                  onClick={() => setIsAC(!isAC)}
                  className={`w-full px-3 py-2 text-left uppercase border text-[11px] transition-colors ${
                    isAC
                      ? 'border-champagne-400 bg-champagne-400/10 text-champagne-300'
                      : 'border-stone-200/15 bg-charcoal-900 text-stone-400'
                  }`}
                >
                  {isAC ? 'AC (+50% Surcharge)' : 'Non-AC Standard'}
                </button>
              </div>

              <div>
                <label className="block text-stone-400 text-[10px] uppercase tracking-wider mb-1">
                  Duration (Hours) - Min 4 hrs
                </label>
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={hours}
                  onChange={(e) => setHours(Math.max(0.5, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-charcoal-900 border border-stone-200/15 text-stone-100 focus:outline-none focus:border-champagne-400"
                />
              </div>

              <div>
                <label className="block text-stone-400 text-[10px] uppercase tracking-wider mb-1">
                  Estimated Distance (KM)
                </label>
                <input
                  type="number"
                  min={0}
                  value={km}
                  onChange={(e) => setKm(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-charcoal-900 border border-stone-200/15 text-stone-100 focus:outline-none focus:border-champagne-400"
                />
              </div>

              <div>
                <label className="block text-stone-400 text-[10px] uppercase tracking-wider mb-1">
                  Night Halts (₹150 / halt)
                </label>
                <input
                  type="number"
                  min={0}
                  value={nightHalts}
                  onChange={(e) => setNightHalts(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-charcoal-900 border border-stone-200/15 text-stone-100 focus:outline-none focus:border-champagne-400"
                />
              </div>

              <div>
                <label className="block text-stone-400 text-[10px] uppercase tracking-wider mb-1">
                  Advance Deposit Remittance (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={advance}
                  onChange={(e) => setAdvance(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-charcoal-900 border border-stone-200/15 text-stone-100 focus:outline-none focus:border-champagne-400"
                />
              </div>
            </div>

            {/* Right Output Ledger (5 Cols) */}
            <div className="lg:col-span-5 bg-charcoal-900 p-6 border border-stone-200/15 flex flex-col justify-between text-xs font-mono">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-stone-200/10 pb-2">
                  <span className="text-stone-400">Effective Rates:</span>
                  <span className="text-stone-100 font-semibold">₹{effHr}/hr · ₹{effKm}/km</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Hourly Charge ({hours}h × ₹{effHr}):</span>
                  <span>₹{hrCost}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Kilometer Charge ({km}km × ₹{effKm}):</span>
                  <span>₹{kmCost}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-[11px] italic">
                  <span>Minimum 4-Hour Floor:</span>
                  <span>₹{min4HrCost}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200/10 pt-2 font-bold text-stone-100">
                  <span>Selected Usage Charge:</span>
                  <span className="text-champagne-400">₹{selectedUsage}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Overnight Demurrage ({nightHalts} × ₹150):</span>
                  <span>₹{nightHaltFee}</span>
                </div>
                <div className="flex justify-between font-serif text-xl text-stone-50 border-t border-stone-200/15 pt-3">
                  <span>Total Due:</span>
                  <span className="font-mono text-champagne-400 font-bold">₹{totalBill}</span>
                </div>
              </div>

              {/* Settlement Outcome */}
              <div className={`mt-6 p-3 border text-center font-mono ${
                diff > 0
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : diff < 0
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-stone-200/20 bg-stone-200/5 text-stone-200'
              }`}>
                <span className="text-[10px] uppercase tracking-wider block">
                  {diff > 0 && 'Customer Refund Upon Return'}
                  {diff < 0 && 'Additional Payment Due Upon Return'}
                  {diff === 0 && 'Exact Balance Reconciliation'}
                </span>
                <span className="font-serif text-2xl font-bold mt-0.5 block">
                  ₹{Math.abs(diff).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
