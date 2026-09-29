import React, { useState } from 'react';
import { Vehicle, CategoryStat, RentalBooking, FleetAnalytics, api } from '../api/client';

interface OperationsWorkspaceProps {
  vehicles: Vehicle[];
  categories: CategoryStat[];
  rentals: RentalBooking[];
  analytics: FleetAnalytics | null;
  onRefresh: () => void;
  onClose: () => void;
}

export const OperationsWorkspace: React.FC<OperationsWorkspaceProps> = ({
  vehicles,
  categories,
  rentals,
  analytics,
  onRefresh,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'manifest' | 'inventory' | 'workshop' | 'analytics'>('manifest');

  // Manifest Action Modals
  const [dispatchRental, setDispatchRental] = useState<RentalBooking | null>(null);
  const [dispatchOdo, setDispatchOdo] = useState<number>(0);
  const [dispatchTime, setDispatchTime] = useState<string>(new Date().toISOString().slice(0, 16));

  const [returnRental, setReturnRental] = useState<RentalBooking | null>(null);
  const [returnOdo, setReturnOdo] = useState<number>(0);
  const [returnTime, setReturnTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [nightHalts, setNightHalts] = useState<number>(0);
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [settlementReceipt, setSettlementReceipt] = useState<any | null>(null);

  // Inventory Action Modals
  const [showAddVehicle, setShowAddVehicle] = useState<boolean>(false);
  const [newReg, setNewReg] = useState<string>('');
  const [newCatId, setNewCatId] = useState<string>(categories[0]?._id || '');
  const [newIsAC, setNewIsAC] = useState<boolean>(false);
  const [newPrice, setNewPrice] = useState<number>(550000);
  const [newOdo, setNewOdo] = useState<number>(1000);
  const [condemnVehicleId, setCondemnVehicleId] = useState<string | null>(null);
  const [salvageVal, setSalvageVal] = useState<number>(50000);

  // Workshop Form
  const [maintVehicleId, setMaintVehicleId] = useState<string>(vehicles[0]?._id || '');
  const [maintDesc, setMaintDesc] = useState<string>('');
  const [maintCost, setMaintCost] = useState<number>(3000);
  const [workshopName, setWorkshopName] = useState<string>('Central Depot Workshop');
  const [maintType, setMaintType] = useState<string>('Routine Service');
  const [groundInWorkshop, setGroundInWorkshop] = useState<boolean>(false);

  // Fuel Form
  const [fuelVehicleId, setFuelVehicleId] = useState<string>(vehicles[0]?._id || '');
  const [fuelLiters, setFuelLiters] = useState<number>(45);
  const [fuelCostPerL, setFuelCostPerL] = useState<number>(92);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Handle Dispatch
  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchRental) return;
    setActionLoading(true);
    try {
      await api.dispatchVehicle(dispatchRental._id, {
        dispatchedAt: dispatchTime ? new Date(dispatchTime).toISOString() : undefined,
        startOdometer: Number(dispatchOdo),
      });
      setDispatchRental(null);
      onRefresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Return
  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnRental) return;
    setActionError('');
    if (returnOdo < (returnRental.startOdometer || 0)) {
      setActionError(`Return odometer (${returnOdo}) cannot be lower than departure reading (${returnRental.startOdometer})`);
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.returnVehicle(returnRental._id, {
        actualReturnDate: returnTime ? new Date(returnTime).toISOString() : undefined,
        endOdometer: Number(returnOdo),
        nightHalts: Number(nightHalts),
        notes: returnNotes,
      });
      if (res.success) {
        setSettlementReceipt(res.data.calculationDetails);
        setReturnRental(null);
        onRefresh();
      } else {
        setActionError(res.message);
      }
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Add Vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.addVehicle({
        registrationNumber: newReg,
        categoryId: newCatId,
        isAC: newIsAC,
        purchasePrice: Number(newPrice),
        currentOdometer: Number(newOdo),
      });
      setShowAddVehicle(false);
      setNewReg('');
      onRefresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Condemn
  const handleCondemn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condemnVehicleId) return;
    setActionLoading(true);
    try {
      await api.condemnVehicle(condemnVehicleId, salvageVal);
      setCondemnVehicleId(null);
      onRefresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Maintenance
  const handleLogMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.createMaintenanceLog({
        vehicleId: maintVehicleId,
        description: maintDesc,
        cost: Number(maintCost),
        workshop: workshopName,
        repairType: maintType,
        setUnderRepair: groundInWorkshop,
      });
      setMaintDesc('');
      alert('Workshop work order registered.');
      onRefresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Fuel
  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.createFuelLog({
        vehicleId: fuelVehicleId,
        liters: Number(fuelLiters),
        costPerLiter: Number(fuelCostPerL),
      });
      alert('Fuel dispense log recorded.');
      onRefresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-charcoal-950 text-stone-100 max-w-6xl w-full border border-stone-200/15 shadow-2xl my-6 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-6 border-b border-stone-200/10 flex flex-wrap justify-between items-center gap-4 bg-charcoal-900">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-luxury text-champagne-400 block mb-1">
              OPERATIONAL DESK & AUDIT LEDGER
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-stone-50 font-normal">
              Fleet Management & Settlement Desk
            </h2>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={onRefresh}
              className="text-xs font-mono text-stone-400 hover:text-stone-100 uppercase tracking-wider"
            >
              ↻ Sync Data
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-stone-200/20 hover:border-stone-200/40 text-stone-300 font-mono text-xs uppercase tracking-wider"
            >
              Return to Customer View ✕
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-1 border-b border-stone-200/10 px-6 bg-charcoal-900/60 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('manifest')}
            className={`py-3 px-4 uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'manifest'
                ? 'border-champagne-400 text-champagne-400 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            01. Dispatch & Settlement ({rentals.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-4 uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'inventory'
                ? 'border-champagne-400 text-champagne-400 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            02. Fleet Inventory ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('workshop')}
            className={`py-3 px-4 uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'workshop'
                ? 'border-champagne-400 text-champagne-400 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            03. Workshop & Fuel Logging
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-4 uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-champagne-400 text-champagne-400 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            04. Profitability & Analytics
          </button>
        </div>

        {/* Workspace Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {/* TAB 1: Dispatch & Settlement Manifest */}
          {activeTab === 'manifest' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs font-mono text-stone-400 border-b border-stone-200/10 pb-3">
                <span>Trip Manifest Records</span>
                <span>Enforcing Max(Hours, KM) with statutory 4-hour floor</span>
              </div>

              <div className="overflow-x-auto border border-stone-200/10 bg-charcoal-900/60">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-charcoal-950 border-b border-stone-200/10 font-mono text-[10px] text-stone-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Docket #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Asset</th>
                      <th className="p-3">Advance</th>
                      <th className="p-3">Deployment Data</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/5 font-light">
                    {rentals.map((r) => (
                      <tr key={r._id} className="hover:bg-charcoal-850">
                        <td className="p-3 font-mono font-medium text-stone-200">{r.bookingNumber}</td>
                        <td className="p-3">
                          <div className="font-medium text-stone-100">{r.customerName}</div>
                          <div className="font-mono text-[10px] text-stone-400">{r.customerPhone}</div>
                        </td>
                        <td className="p-3 font-mono">
                          <div className="text-stone-200">{r.vehicleReg}</div>
                          <div className="text-[10px] text-stone-400">{r.categoryName} {r.isAC ? '· AC' : '· Non-AC'}</div>
                        </td>
                        <td className="p-3 font-mono text-champagne-400 font-semibold">₹{r.advanceAmount}</td>
                        <td className="p-3 font-mono text-[11px] text-stone-300">
                          {r.status === 'BOOKED' && <span>Exp: {new Date(r.expectedReturnDate).toLocaleDateString()}</span>}
                          {r.status === 'DISPATCHED' && <span>Start Odo: {r.startOdometer} km</span>}
                          {r.status === 'RETURNED_SETTLED' && (
                            <div>
                              <span>{r.distanceKm} km ({r.durationHours}h)</span>
                              <div className="text-[10px] text-emerald-400">Total: ₹{r.totalAmount} ({r.settlementType})</div>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[10px] font-mono uppercase border ${
                            r.status === 'BOOKED' ? 'border-amber-400/40 text-amber-300' :
                            r.status === 'DISPATCHED' ? 'border-blue-400/40 text-blue-300' :
                            'border-emerald-400/40 text-emerald-400'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {r.status === 'BOOKED' && (
                            <button
                              onClick={() => {
                                setDispatchRental(r);
                                const veh = vehicles.find((v) => v.registrationNumber === r.vehicleReg);
                                setDispatchOdo(veh?.currentOdometer || 0);
                              }}
                              className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-[10px] uppercase tracking-wider"
                            >
                              Dispatch Car
                            </button>
                          )}
                          {r.status === 'DISPATCHED' && (
                            <button
                              onClick={() => {
                                setReturnRental(r);
                                setReturnOdo((r.startOdometer || 0) + 50);
                              }}
                              className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-[10px] uppercase tracking-wider"
                            >
                              Return & Settle
                            </button>
                          )}
                          {r.status === 'RETURNED_SETTLED' && (
                            <span className="font-mono text-[10px] text-stone-500">Settled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Fleet Inventory */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-stone-200/10 pb-3">
                <span className="font-mono text-xs text-stone-400">52 Enrolled Assets in Sovereign Inventory</span>
                <button
                  onClick={() => setShowAddVehicle(true)}
                  className="px-4 py-1.5 border border-champagne-400 bg-champagne-400/10 text-champagne-400 text-xs font-mono uppercase tracking-wider"
                >
                  + Enrol New Vehicle
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((v) => (
                  <div key={v._id} className="p-4 bg-charcoal-900 border border-stone-200/10 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-stone-100">{v.registrationNumber}</div>
                        <div className="text-[11px] text-stone-400">{v.categoryName} · {v.isAC ? 'AC (+50%)' : 'Non-AC'}</div>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] uppercase border ${
                        v.status === 'AVAILABLE' ? 'border-emerald-500/40 text-emerald-400' :
                        v.status === 'RENTED_OUT' ? 'border-blue-500/40 text-blue-300' :
                        v.status === 'UNDER_REPAIR' ? 'border-amber-500/40 text-amber-300' :
                        'border-rose-500/40 text-rose-400'
                      }`}>
                        {v.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-400 border-y border-stone-200/10 py-2">
                      <div>Odo: <span className="text-stone-200">{v.currentOdometer} km</span></div>
                      <div>Price: <span className="text-stone-200">₹{v.purchasePrice}</span></div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      {v.status === 'AVAILABLE' && (
                        <button
                          onClick={async () => {
                            await api.updateVehicleStatus(v._id, 'UNDER_REPAIR');
                            onRefresh();
                          }}
                          className="text-[10px] text-amber-400 hover:underline"
                        >
                          Send to Repair
                        </button>
                      )}
                      {v.status === 'UNDER_REPAIR' && (
                        <button
                          onClick={async () => {
                            await api.updateVehicleStatus(v._id, 'AVAILABLE');
                            onRefresh();
                          }}
                          className="text-[10px] text-emerald-400 hover:underline"
                        >
                          Mark Available
                        </button>
                      )}
                      {v.status !== 'CONDEMNED_SOLD' && v.status !== 'RENTED_OUT' && (
                        <button
                          onClick={() => {
                            setCondemnVehicleId(v._id);
                            setSalvageVal(Math.round(v.purchasePrice * 0.15));
                          }}
                          className="text-[10px] text-rose-400 hover:underline ml-auto"
                        >
                          Condemn / Sell
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Workshop Maintenance & Fuel */}
          {activeTab === 'workshop' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
              {/* Log Maintenance */}
              <div className="p-6 bg-charcoal-900 border border-stone-200/10 space-y-4">
                <h3 className="font-serif text-xl text-stone-100 font-normal">Log Workshop Work Order</h3>
                <form onSubmit={handleLogMaintenance} className="space-y-3">
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">Select Vehicle</label>
                    <select
                      value={maintVehicleId}
                      onChange={(e) => setMaintVehicleId(e.target.value)}
                      className="w-full p-2 bg-charcoal-950 border border-stone-200/15 text-stone-200"
                    >
                      {vehicles.map((v) => (
                        <option key={v._id} value={v._id}>{v.registrationNumber} — {v.categoryName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Brake pad renewal, suspension tuning"
                      value={maintDesc}
                      onChange={(e) => setMaintDesc(e.target.value)}
                      className="w-full p-2 bg-charcoal-950 border border-stone-200/15 text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">Workshop Facility</label>
                    <input
                      type="text"
                      value={workshopName}
                      onChange={(e) => setWorkshopName(e.target.value)}
                      className="w-full p-2 bg-charcoal-950 border border-stone-200/15 text-stone-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-400 text-[10px] uppercase mb-1">Cost (₹)</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={maintCost}
                        onChange={(e) => setMaintCost(Number(e.target.value))}
                        className="w-full p-2 bg-charcoal-950 border border-stone-200/15 text-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 text-[10px] uppercase mb-1">Category</label>
                      <select
                        value={maintType}
                        onChange={(e) => setMaintType(e.target.value)}
                        className="w-full p-2 bg-charcoal-950 border border-stone-200/15 text-stone-200"
                      >
                        <option value="Routine Service">Routine Service</option>
                        <option value="Major Overhaul">Major Overhaul</option>
                        <option value="Tyre Replacement">Tyre Replacement</option>
                        <option value="AC Repair">AC Repair</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center space-x-2 text-[11px] text-stone-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={groundInWorkshop}
                      onChange={(e) => setGroundInWorkshop(e.target.checked)}
                      className="accent-champagne-400"
                    />
                    <span>Ground Vehicle in Workshop (Status: Under Repair)</span>
                  </label>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2 border border-champagne-400 text-champagne-300 hover:bg-champagne-400/10 uppercase tracking-wider"
                  >
                    Save Work Order
                  </button>
                </form>
              </div>

              {/* Log Fuel */}
              <div className="p-6 bg-charcoal-900 border border-stone-200/10 space-y-4">
                <h3 className="font-serif text-xl text-stone-100 font-normal">Log Fuel Dispensation</h3>
                <form onSubmit={handleLogFuel} className="space-y-3">
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">Select Vehicle</label>
                    <select
                      value={fuelVehicleId}
                      onChange={(e) => setFuelVehicleId(e.target.value)}
                      className="w-full p-2 bg-charcoal-950 border border-stone-200/15 text-stone-200"
                    >
                      {vehicles.map((v) => (
                        <option key={v._id} value={v._id}>{v.registrationNumber} — {v.categoryName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-400 text-[10px] uppercase mb-1">Liters</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={fuelLiters}
                        onChange={(e) => setFuelLiters(Number(e.target.value))}
                        className="w-full p-2 bg-charcoal-950 border border-stone-200/15 text-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 text-[10px] uppercase mb-1">Price / Liter (₹)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={fuelCostPerL}
                        onChange={(e) => setFuelCostPerL(Number(e.target.value))}
                        className="w-full p-2 bg-charcoal-950 border border-stone-200/15 text-stone-200"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-charcoal-950 border border-stone-200/10 text-stone-300 flex justify-between">
                    <span>Total Cost:</span>
                    <span className="text-champagne-400 font-bold">₹{fuelLiters * fuelCostPerL}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2 border border-stone-200/30 text-stone-200 hover:bg-stone-200/10 uppercase tracking-wider"
                  >
                    Record Fuel Log
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: Profitability & Analytics */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6 font-mono text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-charcoal-900 border border-stone-200/10">
                  <span className="text-[10px] text-stone-400 uppercase">Fleet Size</span>
                  <div className="font-serif text-2xl text-stone-100 mt-1">{analytics.kpis.totalVehicles}</div>
                </div>
                <div className="p-4 bg-charcoal-900 border border-stone-200/10">
                  <span className="text-[10px] text-stone-400 uppercase">Gross Revenue</span>
                  <div className="font-serif text-2xl text-champagne-400 mt-1">₹{analytics.kpis.totalFleetRevenue.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-charcoal-900 border border-stone-200/10">
                  <span className="text-[10px] text-stone-400 uppercase">Total Repairs</span>
                  <div className="font-serif text-2xl text-amber-300 mt-1">₹{analytics.kpis.totalFleetRepairs.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-charcoal-900 border border-stone-200/10">
                  <span className="text-[10px] text-stone-400 uppercase">Net Profit</span>
                  <div className={`font-serif text-2xl mt-1 ${analytics.kpis.totalFleetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₹{analytics.kpis.totalFleetProfit.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="border border-stone-200/10 bg-charcoal-900/60 overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-charcoal-950 border-b border-stone-200/10 font-mono text-[10px] text-stone-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Model</th>
                      <th className="p-3">Units (AC/Non-AC)</th>
                      <th className="p-3">Avg Purchase Price</th>
                      <th className="p-3">Demand Trips</th>
                      <th className="p-3">Total Repairs</th>
                      <th className="p-3">Fuel Consumed</th>
                      <th className="p-3">Total Revenue</th>
                      <th className="p-3">Net Contribution</th>
                      <th className="p-3">Margin</th>
                      <th className="p-3">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/5 font-light">
                    {analytics.categoryStatistics.map((stat) => (
                      <tr key={stat.categoryId} className="hover:bg-charcoal-850">
                        <td className="p-3 font-serif text-sm text-stone-100">{stat.categoryName}</td>
                        <td className="p-3 font-mono">{stat.totalVehicles} ({stat.acVehicles} AC)</td>
                        <td className="p-3 font-mono">₹{stat.avgPurchasePrice.toLocaleString()}</td>
                        <td className="p-3 font-mono">{stat.demandBookingsCount} trips ({stat.totalHoursRented}h)</td>
                        <td className="p-3 font-mono text-amber-300">₹{stat.totalRepairExpense.toLocaleString()}</td>
                        <td className="p-3 font-mono">{stat.totalFuelLiters} L</td>
                        <td className="p-3 font-mono font-bold text-stone-100">₹{stat.totalRevenue.toLocaleString()}</td>
                        <td className={`p-3 font-mono font-bold ${stat.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ₹{stat.netProfit.toLocaleString()}
                        </td>
                        <td className="p-3 font-mono">{stat.profitMargin}%</td>
                        <td className="p-3 text-[11px] text-stone-300 max-w-xs">{stat.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Dispatch Action Modal */}
        {dispatchRental && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-charcoal-900 border border-amber-500/40 max-w-md w-full p-6 text-xs font-mono space-y-4">
              <h3 className="font-serif text-xl text-stone-100 font-normal">Authorize Vehicle Departure</h3>
              <p className="text-stone-400">Booking: {dispatchRental.bookingNumber} ({dispatchRental.customerName})</p>
              <form onSubmit={handleConfirmDispatch} className="space-y-3">
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">Starting Odometer (KM)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={dispatchOdo}
                    onChange={(e) => setDispatchOdo(Number(e.target.value))}
                    className="w-full p-2 bg-charcoal-950 border border-stone-200/20 text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">Departure Timestamp</label>
                  <input
                    type="datetime-local"
                    required
                    value={dispatchTime}
                    onChange={(e) => setDispatchTime(e.target.value)}
                    className="w-full p-2 bg-charcoal-950 border border-stone-200/20 text-stone-100"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setDispatchRental(null)} className="px-3 py-1.5 text-stone-400">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="px-4 py-1.5 bg-amber-500/20 border border-amber-400 text-amber-300 uppercase">
                    Confirm Dispatch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Return Action Modal */}
        {returnRental && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-charcoal-900 border border-emerald-500/40 max-w-md w-full p-6 text-xs font-mono space-y-4">
              <h3 className="font-serif text-xl text-stone-100 font-normal">Vehicle Return & Settlement</h3>
              <p className="text-stone-400">Booking: {returnRental.bookingNumber} · Advance: ₹{returnRental.advanceAmount}</p>
              {actionError && <div className="p-2 bg-rose-900/50 border border-rose-500 text-rose-300">{actionError}</div>}
              <form onSubmit={handleConfirmReturn} className="space-y-3">
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">End Odometer (KM)</label>
                  <input
                    type="number"
                    required
                    min={returnRental.startOdometer || 0}
                    value={returnOdo}
                    onChange={(e) => setReturnOdo(Number(e.target.value))}
                    className="w-full p-2 bg-charcoal-950 border border-stone-200/20 text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">Actual Return Timestamp</label>
                  <input
                    type="datetime-local"
                    required
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full p-2 bg-charcoal-950 border border-stone-200/20 text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">Night Halts (@ ₹150)</label>
                  <input
                    type="number"
                    min={0}
                    value={nightHalts}
                    onChange={(e) => setNightHalts(Number(e.target.value))}
                    className="w-full p-2 bg-charcoal-950 border border-stone-200/20 text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">Return Notes / Inspection Condition</label>
                  <input
                    type="text"
                    placeholder="Vehicle returned clean, full tank..."
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    className="w-full p-2 bg-charcoal-950 border border-stone-200/20 text-stone-100"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setReturnRental(null)} className="px-3 py-1.5 text-stone-400">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 uppercase">
                    Compute Bill & Settle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Settlement Receipt Voucher */}
        {settlementReceipt && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <div className="bg-charcoal-900 border border-champagne-400 max-w-md w-full p-6 text-xs font-mono space-y-4">
              <div className="border-b border-stone-200/20 pb-3 text-center">
                <span className="text-[10px] text-champagne-400 uppercase tracking-widest block">Official Bill Statement</span>
                <h3 className="font-serif text-2xl text-stone-50 font-normal">Settlement Receipt</h3>
              </div>
              <div className="space-y-2 text-stone-300">
                <div className="flex justify-between"><span>Duration Billed:</span><span>{settlementReceipt.hoursUsed} hrs</span></div>
                <div className="flex justify-between"><span>Distance Driven:</span><span>{settlementReceipt.distanceKm} km</span></div>
                <div className="flex justify-between"><span>Hourly Calculation:</span><span>₹{settlementReceipt.hourlyCharge}</span></div>
                <div className="flex justify-between"><span>Kilometer Calculation:</span><span>₹{settlementReceipt.kmCharge}</span></div>
                <div className="flex justify-between text-stone-500"><span>4-Hour Minimum Floor:</span><span>₹{settlementReceipt.min4HourCharge}</span></div>
                <div className="flex justify-between border-t border-stone-200/10 pt-1 font-bold text-stone-100">
                  <span>Usage Total:</span><span>₹{settlementReceipt.usageCharge}</span>
                </div>
                <div className="flex justify-between"><span>Night Halts ({settlementReceipt.nightHalts} × ₹150):</span><span>₹{settlementReceipt.nightHaltCharge}</span></div>
                <div className="flex justify-between font-serif text-lg text-stone-50 border-t border-stone-200/20 pt-2">
                  <span>Gross Total Bill:</span><span className="text-champagne-400">₹{settlementReceipt.totalAmount}</span>
                </div>
                <div className="flex justify-between text-stone-400"><span>Advance Deposited:</span><span>- ₹{settlementReceipt.advanceAmount}</span></div>
              </div>

              <div className={`p-3 border text-center ${
                settlementReceipt.settlementType === 'REFUND' ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300' :
                settlementReceipt.settlementType === 'ADDITIONAL_PAYMENT' ? 'border-amber-400 bg-amber-500/10 text-amber-300' :
                'border-stone-400 text-stone-200'
              }`}>
                <span className="text-[10px] uppercase tracking-wider block">
                  {settlementReceipt.settlementType === 'REFUND' && 'Refund Remittance to Customer'}
                  {settlementReceipt.settlementType === 'ADDITIONAL_PAYMENT' && 'Additional Payment Due from Customer'}
                  {settlementReceipt.settlementType === 'EXACT' && 'Exact Match'}
                </span>
                <span className="font-serif text-2xl font-bold mt-1 block">
                  ₹{settlementReceipt.settlementAmount?.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSettlementReceipt(null)}
                  className="px-4 py-2 bg-stone-100 text-charcoal-950 font-mono text-xs uppercase tracking-wider"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Vehicle Modal */}
        {showAddVehicle && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-charcoal-900 border border-stone-200/20 max-w-md w-full p-6 text-xs font-mono space-y-4">
              <h3 className="font-serif text-xl text-stone-100 font-normal">Acquire New Vehicle Asset</h3>
              <form onSubmit={handleAddVehicle} className="space-y-3">
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">Registration #</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-01-XX-1122"
                    value={newReg}
                    onChange={(e) => setNewReg(e.target.value.toUpperCase())}
                    className="w-full p-2 bg-charcoal-950 border border-stone-200/20 text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">Category</label>
                  <select
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    className="w-full p-2 bg-charcoal-950 border border-stone-200/20 text-stone-100"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center space-x-2 pt-1 text-stone-300">
                  <input
                    type="checkbox"
                    checked={newIsAC}
                    onChange={(e) => setNewIsAC(e.target.checked)}
                    className="accent-champagne-400"
                  />
                  <span>Equipped with Air Conditioning (AC +50%)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">Purchase Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={10000}
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full p-2 bg-charcoal-950 border border-stone-200/20 text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[10px] uppercase mb-1">Start Odometer (KM)</label>
                    <input
                      type="number"
                      min={0}
                      value={newOdo}
                      onChange={(e) => setNewOdo(Number(e.target.value))}
                      className="w-full p-2 bg-charcoal-950 border border-stone-200/20 text-stone-100"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-3">
                  <button type="button" onClick={() => setShowAddVehicle(false)} className="px-3 py-1.5 text-stone-400">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="px-4 py-1.5 border border-champagne-400 text-champagne-300 uppercase">
                    Enrol Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Condemn Vehicle Modal */}
        {condemnVehicleId && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-charcoal-900 border border-rose-500/40 max-w-md w-full p-6 text-xs font-mono space-y-4">
              <h3 className="font-serif text-xl text-rose-300 font-normal">Condemn & Decommission Asset</h3>
              <form onSubmit={handleCondemn} className="space-y-3">
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase mb-1">Salvage Value (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={salvageVal}
                    onChange={(e) => setSalvageVal(Number(e.target.value))}
                    className="w-full p-2 bg-charcoal-950 border border-stone-200/20 text-stone-100"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-3">
                  <button type="button" onClick={() => setCondemnVehicleId(null)} className="px-3 py-1.5 text-stone-400">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="px-4 py-1.5 border border-rose-400 text-rose-300 uppercase">
                    Confirm Decommission
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
