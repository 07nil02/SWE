import React, { useState, useEffect } from 'react';
import { MaintenanceLog, FuelLog, Vehicle, api } from '../api/client';
import { SectionLabel } from './SectionLabel';

interface MaintenanceTabProps {
  vehicles: Vehicle[];
  onRefresh: () => void;
}

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({ vehicles, onRefresh }) => {
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'maintenance' | 'fuel'>('maintenance');

  const [maintVehicleId, setMaintVehicleId] = useState<string>(vehicles[0]?._id || '');
  const [description, setDescription] = useState<string>('');
  const [cost, setCost] = useState<number>(2500);
  const [workshop, setWorkshop] = useState<string>('Central State Mechanical Depot');
  const [repairType, setRepairType] = useState<string>('Routine Service');
  const [setUnderRepair, setSetUnderRepair] = useState<boolean>(false);
  const [submittingMaint, setSubmittingMaint] = useState<boolean>(false);
  const [maintMessage, setMaintMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [fuelVehicleId, setFuelVehicleId] = useState<string>(vehicles[0]?._id || '');
  const [liters, setLiters] = useState<number>(40);
  const [costPerLiter, setCostPerLiter] = useState<number>(90);
  const [odometerAtFill, setOdometerAtFill] = useState<number>(20000);
  const [submittingFuel, setSubmittingFuel] = useState<boolean>(false);
  const [fuelMessage, setFuelMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [mLogs, fLogs] = await Promise.all([
        api.getMaintenanceLogs(),
        api.getFuelLogs(),
      ]);
      setMaintenanceLogs(mLogs);
      setFuelLogs(fLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setMaintMessage(null);
    if (!maintVehicleId) {
      setMaintMessage({ type: 'error', text: 'Please select a vehicle asset.' });
      return;
    }
    if (!description || description.trim().length < 3) {
      setMaintMessage({ type: 'error', text: 'Work order description must be at least 3 characters.' });
      return;
    }
    if (isNaN(cost) || cost <= 0) {
      setMaintMessage({ type: 'error', text: 'Cost must be a positive number.' });
      return;
    }

    setSubmittingMaint(true);
    try {
      await api.createMaintenanceLog({
        vehicleId: maintVehicleId,
        description: description.trim(),
        cost: Number(cost),
        workshop: workshop.trim(),
        repairType,
        setUnderRepair,
      });
      setDescription('');
      setMaintMessage({ type: 'success', text: `Workshop order of ₹${cost} successfully recorded.` });
      fetchLogs();
      onRefresh();
    } catch (err) {
      setMaintMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setSubmittingMaint(false);
    }
  };

  const handleCreateFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFuelMessage(null);
    if (!fuelVehicleId) {
      setFuelMessage({ type: 'error', text: 'Please select a vehicle asset.' });
      return;
    }
    if (isNaN(liters) || liters <= 0) {
      setFuelMessage({ type: 'error', text: 'Liters must be a positive number.' });
      return;
    }
    if (isNaN(costPerLiter) || costPerLiter <= 0) {
      setFuelMessage({ type: 'error', text: 'Cost per liter must be a positive number.' });
      return;
    }

    setSubmittingFuel(true);
    try {
      await api.createFuelLog({
        vehicleId: fuelVehicleId,
        liters: Number(liters),
        costPerLiter: Number(costPerLiter),
        odometerAtFill: !isNaN(Number(odometerAtFill)) ? Number(odometerAtFill) : undefined,
      });
      setFuelMessage({ type: 'success', text: `Fuel dispense log of ${liters}L recorded.` });
      fetchLogs();
      onRefresh();
    } catch (err) {
      setFuelMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setSubmittingFuel(false);
    }
  };

  const totalMaintenanceSpent = maintenanceLogs.reduce((acc, m) => acc + m.cost, 0);
  const totalFuelLiters = fuelLogs.reduce((acc, f) => acc + f.liters, 0);
  const totalFuelCost = fuelLogs.reduce((acc, f) => acc + f.totalCost, 0);

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="border-b border-ivory-100/10 pb-6">
        <div className="font-mono text-[11px] uppercase tracking-archival text-tan-500 mb-1">
          Section 05 • Directorate of Mechanical Operations
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-ivory-100 font-normal">
          Mechanical Work Orders, Asset Maintenance & Fuel Ledger
        </h2>
        <p className="font-sans text-xs text-ivory-300/70 font-light mt-2 max-w-2xl">
          Statutory deposition of mechanical repairs, periodic overhaul costs, workshop vendor invoices, and certified fuel dispensing volumes across all 52 fleet assets.
        </p>
      </div>

      {/* KPI Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-navy-900 border border-ivory-100/10 p-5">
          <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest">Total Repair Overhead</span>
          <div className="font-serif text-3xl text-amber-300 font-normal mt-2">₹{totalMaintenanceSpent.toLocaleString()}</div>
          <span className="font-mono text-[10px] text-ivory-300/40 mt-1 block">{maintenanceLogs.length} Work Orders Certified</span>
        </div>

        <div className="bg-navy-900 border border-ivory-100/10 p-5">
          <span className="font-mono text-[10px] text-blue-400 uppercase tracking-widest">Total Fuel Consumed</span>
          <div className="font-serif text-3xl text-blue-300 font-normal mt-2">{totalFuelLiters.toLocaleString()} Liters</div>
          <span className="font-mono text-[10px] text-ivory-300/40 mt-1 block">{fuelLogs.length} Refueling Depositions</span>
        </div>

        <div className="bg-navy-900 border border-ivory-100/10 p-5">
          <span className="font-mono text-[10px] text-tan-400 uppercase tracking-widest">Total Fuel Remittance</span>
          <div className="font-serif text-3xl text-tan-400 font-normal mt-2">₹{totalFuelCost.toLocaleString()}</div>
          <span className="font-mono text-[10px] text-ivory-300/40 mt-1 block">Direct Operational Burden</span>
        </div>
      </div>

      {/* Formal Sub-Navigation */}
      <div className="flex space-x-6 border-b border-ivory-100/10 text-xs font-mono tracking-widest uppercase">
        <button
          onClick={() => setActiveSubTab('maintenance')}
          className={`pb-3 transition-colors ${
            activeSubTab === 'maintenance'
              ? 'text-tan-400 border-b-2 border-tan-400'
              : 'text-ivory-300/50 hover:text-ivory-100'
          }`}
        >
          01. Mechanical Overhaul Orders
        </button>
        <button
          onClick={() => setActiveSubTab('fuel')}
          className={`pb-3 transition-colors ${
            activeSubTab === 'fuel'
              ? 'text-tan-400 border-b-2 border-tan-400'
              : 'text-ivory-300/50 hover:text-ivory-100'
          }`}
        >
          02. Fuel Dispensing Deposition
        </button>
      </div>

      {/* Maintenance SubTab */}
      {activeSubTab === 'maintenance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* New Work Order Form (5 Cols) */}
          <div className="lg:col-span-5 bg-navy-900 border border-ivory-100/10 p-8 space-y-4">
            <SectionLabel number="07" label="Record Mechanical Work Order" badge="Depot Registry" />

            {maintMessage && (
              <div className={`p-3 border font-mono text-xs flex items-center justify-between ${
                maintMessage.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/70 border-red-500/50 text-red-200'
              }`}>
                <span>{maintMessage.type === 'success' ? '✓' : '⚠'} {maintMessage.text}</span>
                <button type="button" onClick={() => setMaintMessage(null)} className="text-stone-400 hover:text-white ml-2">✕</button>
              </div>
            )}

            <form onSubmit={handleCreateMaintenance} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Enrolled Vehicle *
                </label>
                <select
                  value={maintVehicleId}
                  onChange={(e) => setMaintVehicleId(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-200 font-mono focus:outline-none focus:border-tan-500/60"
                >
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} — {v.categoryName} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Maintenance Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radiator flush, clutch plate synchronizer replacement"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-tan-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                    Invoice Expenditure (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                    Work Order Category
                  </label>
                  <select
                    value={repairType}
                    onChange={(e) => setRepairType(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-200 font-mono focus:outline-none focus:border-tan-500/60"
                  >
                    <option value="Routine Service">Routine Service</option>
                    <option value="Major Overhaul">Major Overhaul</option>
                    <option value="Accident Repair">Accident Repair</option>
                    <option value="Tyre Replacement">Tyre Replacement</option>
                    <option value="AC Repair">AC Repair</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Workshop Vendor / Service Depot
                </label>
                <input
                  type="text"
                  value={workshop}
                  onChange={(e) => setWorkshop(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 focus:outline-none focus:border-tan-500/60"
                />
              </div>

              <div className="flex items-center space-x-3 pt-1">
                <input
                  type="checkbox"
                  id="setUnderRepair"
                  checked={setUnderRepair}
                  onChange={(e) => setSetUnderRepair(e.target.checked)}
                  className="h-4 w-4 accent-amber-500 bg-navy-950 border-ivory-100/20"
                />
                <label htmlFor="setUnderRepair" className="font-mono text-xs text-ivory-300/80">
                  Ground Asset in Mechanical Workshop (Status: Under Repair)
                </label>
              </div>

              <button
                type="submit"
                disabled={submittingMaint}
                className="w-full mt-2 py-2.5 px-4 border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs uppercase tracking-widest"
              >
                {submittingMaint ? 'Filing Deposition...' : 'Record Work Order Deposition'}
              </button>
            </form>
          </div>

          {/* Maintenance Table (7 Cols) */}
          <div className="lg:col-span-7 border border-ivory-100/10 bg-navy-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-ivory-100/10 bg-navy-950/80 flex justify-between items-center">
              <h3 className="font-mono text-xs text-ivory-200 uppercase tracking-widest">
                Certified Maintenance History
              </h3>
              <span className="font-mono text-[10px] text-ivory-300/40">
                {loading ? 'Compiling...' : `${maintenanceLogs.length} Records Audited`}
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-navy-950 border-b border-ivory-100/10 text-[10px] font-mono text-ivory-300/60 uppercase tracking-widest sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Work Order Details</th>
                    <th className="px-4 py-3">Incurred Cost</th>
                    <th className="px-4 py-3">Workshop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-100/5 font-light">
                  {maintenanceLogs.map((m) => (
                    <tr key={m._id} className="hover:bg-navy-850/60">
                      <td className="px-4 py-3 font-mono font-medium text-ivory-100">
                        {m.vehicleReg}
                        <span className="block text-ivory-300/40 text-[10px]">{m.categoryName}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-ivory-300/50">
                        {new Date(m.repairDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-serif text-ivory-200">{m.repairType}</span>
                        <div className="text-ivory-300/60 text-[11px] font-light">{m.description}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-amber-300 font-medium">
                        ₹{m.cost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-ivory-300/50 text-[11px] font-mono">
                        {m.workshop || 'Internal Depot'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Fuel SubTab */}
      {activeSubTab === 'fuel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* New Fuel Form (5 Cols) */}
          <div className="lg:col-span-5 bg-navy-900 border border-ivory-100/10 p-8 space-y-4">
            <SectionLabel number="08" label="Record Fuel Dispense Volume" badge="Fuel Ledger" />

            {fuelMessage && (
              <div className={`p-3 border font-mono text-xs flex items-center justify-between ${
                fuelMessage.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/70 border-red-500/50 text-red-200'
              }`}>
                <span>{fuelMessage.type === 'success' ? '✓' : '⚠'} {fuelMessage.text}</span>
                <button type="button" onClick={() => setFuelMessage(null)} className="text-stone-400 hover:text-white ml-2">✕</button>
              </div>
            )}

            <form onSubmit={handleCreateFuel} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Enrolled Vehicle *
                </label>
                <select
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-200 font-mono focus:outline-none focus:border-tan-500/60"
                >
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} — {v.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                    Volume Dispensed (Liters) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={liters}
                    onChange={(e) => setLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                    Price / Liter (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={costPerLiter}
                    onChange={(e) => setCostPerLiter(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ivory-300/60 mb-1">
                  Odometer Reading at Deposition (KM)
                </label>
                <input
                  type="number"
                  min={0}
                  value={odometerAtFill}
                  onChange={(e) => setOdometerAtFill(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-navy-950 border border-ivory-100/10 text-ivory-100 font-mono focus:outline-none focus:border-tan-500/60"
                />
              </div>

              <div className="p-3 bg-navy-950 border border-ivory-100/10 font-mono text-xs flex justify-between items-center">
                <span className="text-ivory-300/60">Calculated Fiscal Remittance:</span>
                <span className="text-tan-400 font-bold text-sm">₹{(liters * costPerLiter).toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={submittingFuel}
                className="w-full mt-2 py-2.5 px-4 border border-tan-500/50 bg-tan-500/10 hover:bg-tan-500/20 text-tan-400 font-mono text-xs uppercase tracking-widest"
              >
                {submittingFuel ? 'Filing Deposition...' : 'Certify Fuel Deposition'}
              </button>
            </form>
          </div>

          {/* Fuel Table (7 Cols) */}
          <div className="lg:col-span-7 border border-ivory-100/10 bg-navy-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-ivory-100/10 bg-navy-950/80 flex justify-between items-center">
              <h3 className="font-mono text-xs text-ivory-200 uppercase tracking-widest">
                Fuel Consumption Registry
              </h3>
              <span className="font-mono text-[10px] text-ivory-300/40">
                {fuelLogs.length} Refueling Transactions
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-navy-950 border-b border-ivory-100/10 text-[10px] font-mono text-ivory-300/60 uppercase tracking-widest sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Volume</th>
                    <th className="px-4 py-3">Rate (₹/L)</th>
                    <th className="px-4 py-3">Total Remittance</th>
                    <th className="px-4 py-3">Odometer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-100/5 font-light">
                  {fuelLogs.map((f) => (
                    <tr key={f._id} className="hover:bg-navy-850/60">
                      <td className="px-4 py-3 font-mono font-medium text-ivory-100">
                        {f.vehicleReg}
                        <span className="block text-ivory-300/40 text-[10px]">{f.categoryName}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-ivory-300/50">
                        {new Date(f.fuelDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-ivory-200">{f.liters} L</td>
                      <td className="px-4 py-3 font-mono text-ivory-300/50">₹{f.costPerLiter}</td>
                      <td className="px-4 py-3 font-mono text-tan-400 font-medium">₹{f.totalCost.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-ivory-300/50">{f.odometerAtFill ? `${f.odometerAtFill} KM` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
