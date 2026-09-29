import React, { useState } from 'react';
import { Vehicle, CategoryStat, api } from '../api/client';
import { SectionLabel } from './SectionLabel';

interface FleetTabProps {
  vehicles: Vehicle[];
  categories: CategoryStat[];
  onRefresh: () => void;
  onSelectForBooking: (vehicleId: string) => void;
}

export const FleetTab: React.FC<FleetTabProps> = ({
  vehicles,
  categories,
  onRefresh,
  onSelectForBooking,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [acFilter, setAcFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [condemnVehicleId, setCondemnVehicleId] = useState<string | null>(null);
  const [salvageValue, setSalvageValue] = useState<number>(50000);
  const [condemnNotes, setCondemnNotes] = useState<string>('');

  // Form State
  const [newReg, setNewReg] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>(categories[0]?._id || '');
  const [newIsAC, setNewIsAC] = useState<boolean>(false);
  const [newPrice, setNewPrice] = useState<number>(500000);
  const [newOdo, setNewOdo] = useState<number>(1000);
  const [newNotes, setNewNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState<boolean>(false);

  const filtered = vehicles.filter((v) => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && v.categoryName !== categoryFilter) return false;
    if (acFilter === 'AC' && !v.isAC) return false;
    if (acFilter === 'NON_AC' && v.isAC) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.registrationNumber.toLowerCase().includes(q) ||
        v.categoryName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: 'AVAILABLE' | 'UNDER_REPAIR') => {
    setLoadingAction(true);
    try {
      await api.updateVehicleStatus(id, newStatus);
      onRefresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCondemn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condemnVehicleId) return;
    setLoadingAction(true);
    try {
      await api.condemnVehicle(condemnVehicleId, salvageValue, condemnNotes);
      setCondemnVehicleId(null);
      setCondemnNotes('');
      onRefresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newReg || !newCategory || !newPrice) {
      setFormError('All mandatory fields must be specified.');
      return;
    }
    setLoadingAction(true);
    try {
      const res = await api.addVehicle({
        registrationNumber: newReg,
        categoryId: newCategory,
        isAC: newIsAC,
        purchasePrice: Number(newPrice),
        currentOdometer: Number(newOdo),
        notes: newNotes,
      });
      if (res.success) {
        setShowAddModal(false);
        setNewReg('');
        setNewNotes('');
        onRefresh();
      } else {
        setFormError(res.message);
      }
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="border-b border-ivory-100/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-archival text-tan-500 mb-1">
            Section 02 • Directorate of Physical Assets
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-ivory-100 font-normal">
            Enrolled Fleet Custody & Asset Master Ledger
          </h2>
          <p className="font-sans text-xs text-ivory-300/70 font-light mt-2 max-w-2xl">
            Authoritative registry of all 52 baseline transit assets across Ambassador, Tata Sumo, Maruti Omni, Maruti Esteem, and Mahindra Armada series.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 border border-tan-500/50 bg-tan-500/10 hover:bg-tan-500/20 text-tan-400 hover:text-ivory-100 text-xs font-mono tracking-widest uppercase transition-colors"
        >
          + Enrol New Vehicle Asset
        </button>
      </div>

      {/* Control & Query Bar */}
      <div className="bg-navy-900 border border-ivory-100/10 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="Search registration or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-navy-950 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-tan-500/60 w-full sm:w-60"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-navy-950 border border-ivory-100/10 text-ivory-200 focus:outline-none focus:border-tan-500/60"
          >
            <option value="ALL">All Custody States ({vehicles.length})</option>
            <option value="AVAILABLE">Available Readiness</option>
            <option value="RENTED_OUT">On Active Dispatch</option>
            <option value="UNDER_REPAIR">Mechanical Workshop</option>
            <option value="CONDEMNED_SOLD">Decommissioned / Condemned</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-navy-950 border border-ivory-100/10 text-ivory-200 focus:outline-none focus:border-tan-500/60"
          >
            <option value="ALL">All Classifications</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* AC Filter */}
          <select
            value={acFilter}
            onChange={(e) => setAcFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-navy-950 border border-ivory-100/10 text-ivory-200 focus:outline-none focus:border-tan-500/60"
          >
            <option value="ALL">All Apparatus (AC & Non-AC)</option>
            <option value="AC">Climate Controlled (AC +50%)</option>
            <option value="NON_AC">Standard (Non-AC)</option>
          </select>
        </div>

        <div className="text-[11px] font-mono text-ivory-300/40">
          Showing {filtered.length} of {vehicles.length} Enrolled Assets
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div>
        <SectionLabel number="03" label="Physical Asset Inventory" badge={`${filtered.length} Displayed`} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((v) => {
            let statusBadge = 'border-ivory-100/20 text-ivory-300 bg-ivory-100/5';
            let statusLabel: string = v.status;
            if (v.status === 'AVAILABLE') {
              statusBadge = 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5';
              statusLabel = 'Available';
            } else if (v.status === 'RENTED_OUT') {
              statusBadge = 'border-blue-500/40 text-blue-300 bg-blue-500/5';
              statusLabel = 'On Dispatch';
            } else if (v.status === 'UNDER_REPAIR') {
              statusBadge = 'border-amber-500/40 text-amber-300 bg-amber-500/5';
              statusLabel = 'In Workshop';
            } else if (v.status === 'CONDEMNED_SOLD') {
              statusBadge = 'border-rose-500/40 text-rose-400 bg-rose-500/5';
              statusLabel = 'Condemned / Sold';
            }

            return (
              <div
                key={v._id}
                className="bg-navy-900 border border-ivory-100/10 hover:border-ivory-100/25 p-6 flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  <div className="flex justify-between items-baseline border-b border-ivory-100/5 pb-3">
                    <span className="font-mono text-[10px] text-tan-500/80 uppercase tracking-widest">
                      {v.categoryName}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${statusBadge}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <h3 className="font-mono text-xl text-ivory-100 font-semibold tracking-wider mt-3">
                    {v.registrationNumber}
                  </h3>

                  <div className="mt-3 flex items-center space-x-2 text-xs">
                    <span className={`font-mono text-[10px] px-2 py-0.5 uppercase border ${
                      v.isAC ? 'border-tan-500/30 text-tan-400 bg-tan-500/10' : 'border-ivory-100/10 text-ivory-300/60'
                    }`}>
                      {v.isAC ? 'AC (+50% Tariff)' : 'Non-AC Standard'}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-ivory-100/5 grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-ivory-300/40 uppercase block">Odometer</span>
                      <span className="text-ivory-200">{v.currentOdometer.toLocaleString()} KM</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ivory-300/40 uppercase block">Book Value</span>
                      <span className="text-ivory-200">₹{v.purchasePrice.toLocaleString()}</span>
                    </div>
                    {v.salvageValue != null && (
                      <div className="col-span-2 text-rose-400 text-[11px]">
                        Decommission Salvage: ₹{v.salvageValue.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Formal Action Strip */}
                <div className="mt-6 pt-4 border-t border-ivory-100/5 flex items-center justify-between gap-2">
                  {v.status === 'AVAILABLE' && (
                    <>
                      <button
                        onClick={() => onSelectForBooking(v._id)}
                        className="px-3 py-1.5 border border-tan-500/40 bg-tan-500/10 hover:bg-tan-500/20 text-tan-400 text-[11px] font-mono uppercase tracking-wider transition-colors"
                      >
                        Issue Booking →
                      </button>
                      <button
                        onClick={() => handleStatusChange(v._id, 'UNDER_REPAIR')}
                        disabled={loadingAction}
                        className="px-2.5 py-1.5 text-[11px] font-mono text-ivory-300/60 hover:text-amber-300 transition-colors"
                      >
                        Ground for Repair
                      </button>
                    </>
                  )}

                  {v.status === 'UNDER_REPAIR' && (
                    <button
                      onClick={() => handleStatusChange(v._id, 'AVAILABLE')}
                      disabled={loadingAction}
                      className="w-full px-3 py-1.5 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-[11px] font-mono uppercase tracking-wider transition-colors"
                    >
                      Certify Roadworthy (Mark Available)
                    </button>
                  )}

                  {v.status !== 'CONDEMNED_SOLD' && v.status !== 'RENTED_OUT' && (
                    <button
                      onClick={() => {
                        setCondemnVehicleId(v._id);
                        setSalvageValue(Math.round(v.purchasePrice * 0.15));
                      }}
                      className="text-[10px] font-mono text-ivory-300/30 hover:text-rose-400 uppercase tracking-widest transition-colors ml-auto"
                    >
                      Condemn
                    </button>
                  )}

                  {v.status === 'RENTED_OUT' && (
                    <span className="text-[11px] font-mono text-blue-300/70 italic">
                      [Active Dispatch Mission]
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formal Asset Enrollment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-ivory-100/20 max-w-md w-full p-8 shadow-2xl">
            <div className="border-b border-ivory-100/10 pb-4 mb-6">
              <div className="font-mono text-[10px] uppercase tracking-archival text-tan-500">
                Official Docket Entry • Form TR-01
              </div>
              <h3 className="font-serif text-2xl text-ivory-100 font-normal mt-1">
                Statutory Vehicle Enrolment
              </h3>
            </div>

            {formError && (
              <div className="mb-4 p-3 border border-rose-500/30 bg-rose-500/10 text-rose-300 font-mono text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddVehicle} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-01-AB-9999"
                  value={newReg}
                  onChange={(e) => setNewReg(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Authorized Vehicle Classification *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-200 font-mono focus:outline-none focus:border-tan-500/60"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} (Base Tariff: ₹{c.baseHourlyRate}/hr, ₹{c.baseKmRate}/km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-1">
                <input
                  type="checkbox"
                  id="newIsAC"
                  checked={newIsAC}
                  onChange={(e) => setNewIsAC(e.target.checked)}
                  className="h-4 w-4 accent-tan-500 bg-navy-950 border-ivory-100/20"
                />
                <label htmlFor="newIsAC" className="font-mono text-xs text-ivory-200">
                  Climate Apparatus: Air-Conditioned (+50% Tariff)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                    Acquisition Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={10000}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                    Initial Odometer (KM)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newOdo}
                    onChange={(e) => setNewOdo(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Regulatory Notes / Acquisition Reference
                </label>
                <input
                  type="text"
                  placeholder="Government procurement order reference"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-tan-500/60"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-ivory-100/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-mono text-xs text-ivory-300/60 hover:text-ivory-100 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 border border-tan-500/60 bg-tan-500/10 hover:bg-tan-500/20 text-tan-400 font-mono text-xs uppercase tracking-widest"
                >
                  {loadingAction ? 'Executing...' : 'Certify Enrolment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decommission & Condemn Modal */}
      {condemnVehicleId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-rose-500/30 max-w-md w-full p-8 shadow-2xl">
            <div className="border-b border-ivory-100/10 pb-4 mb-6">
              <div className="font-mono text-[10px] uppercase tracking-archival text-rose-400">
                Statutory Condemnation Deposition
              </div>
              <h3 className="font-serif text-2xl text-ivory-100 font-normal mt-1">
                Decommission Asset from Fleet
              </h3>
            </div>

            <form onSubmit={handleCondemn} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Salvage Disposal Consideration (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={salvageValue}
                  onChange={(e) => setSalvageValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-rose-500/60"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Official Condemnation Ground / Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engine block fatigue, repair expenditure exceeds salvage threshold"
                  value={condemnNotes}
                  onChange={(e) => setCondemnNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-rose-500/60"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-ivory-100/10">
                <button
                  type="button"
                  onClick={() => setCondemnVehicleId(null)}
                  className="px-4 py-2 font-mono text-xs text-ivory-300/60 hover:text-ivory-100 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 border border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-mono text-xs uppercase tracking-widest"
                >
                  {loadingAction ? 'Executing...' : 'Confirm Condemnation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
