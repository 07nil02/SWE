import React from 'react';
import { FleetAnalytics } from '../api/client';
import { SectionLabel } from './SectionLabel';

interface AnalyticsTabProps {
  analytics: FleetAnalytics | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ analytics, loading, onRefresh }) => {
  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center p-24 text-ivory-300/50 font-mono text-xs tracking-widest uppercase">
        <span className="inline-block w-2 h-2 rounded-full bg-tan-500 mr-3 animate-ping"></span>
        Compiling Institutional Intelligence & Fiscal Ledger...
      </div>
    );
  }

  const { kpis, categoryStatistics } = analytics;

  return (
    <div className="space-y-12">
      {/* Editorial Header */}
      <div className="border-b border-ivory-100/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-archival text-tan-500 mb-1">
            Gazette Schedule IV • Directorate of Fiscal Audit
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-ivory-100 font-normal">
            Comparative Fleet Revenue, Maintenance & Profitability Ledger
          </h2>
          <p className="font-sans text-xs text-ivory-300/70 font-light mt-2 max-w-2xl">
            Sovereign asset depreciation, demand volume, repair overheads, and net contribution across all five authorized vehicle classifications.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 border border-tan-500/40 bg-navy-900 hover:bg-tan-500/10 text-tan-400 hover:text-ivory-100 text-xs font-mono tracking-widest uppercase transition-colors"
        >
          ↻ Re-Audit Ledger
        </button>
      </div>

      {/* KPI Tiles Strip */}
      <div>
        <SectionLabel number="01" label="Consolidated Fiscal Telemetry" badge="Statutory Summary" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-navy-900 p-5 border border-ivory-100/10">
            <span className="font-mono text-[10px] text-ivory-300/50 uppercase tracking-widest">Enrolled Assets</span>
            <div className="font-serif text-3xl text-ivory-100 font-normal mt-2">{kpis.totalVehicles}</div>
            <span className="font-mono text-[10px] text-tan-500/80 mt-1 block">5 Sovereign Classes</span>
          </div>

          <div className="bg-navy-900 p-5 border border-ivory-100/10">
            <span className="font-mono text-[10px] text-emerald-400/70 uppercase tracking-widest">Available Readiness</span>
            <div className="font-serif text-3xl text-emerald-400 font-normal mt-2">{kpis.availableCount}</div>
            <span className="font-mono text-[10px] text-ivory-300/40 mt-1 block">Ready for Dispatch</span>
          </div>

          <div className="bg-navy-900 p-5 border border-ivory-100/10">
            <span className="font-mono text-[10px] text-blue-400/70 uppercase tracking-widest">On Deployment</span>
            <div className="font-serif text-3xl text-blue-300 font-normal mt-2">{kpis.rentedCount}</div>
            <span className="font-mono text-[10px] text-ivory-300/40 mt-1 block">{kpis.fleetUtilizationRate}% Utilization</span>
          </div>

          <div className="bg-navy-900 p-5 border border-ivory-100/10">
            <span className="font-mono text-[10px] text-amber-400/70 uppercase tracking-widest">In Workshop</span>
            <div className="font-serif text-3xl text-amber-300 font-normal mt-2">{kpis.repairCount}</div>
            <span className="font-mono text-[10px] text-ivory-300/40 mt-1 block">Mechanical Grounding</span>
          </div>

          <div className="bg-navy-900 p-5 border border-ivory-100/10">
            <span className="font-mono text-[10px] text-tan-400 uppercase tracking-widest">Gross Revenue</span>
            <div className="font-serif text-2xl text-tan-400 font-normal mt-2">₹{kpis.totalFleetRevenue.toLocaleString()}</div>
            <span className="font-mono text-[10px] text-ivory-300/40 mt-1 block">{kpis.totalDemandBookings} Completed Filings</span>
          </div>

          <div className="bg-navy-900 p-5 border border-ivory-100/10">
            <span className="font-mono text-[10px] text-ivory-300/50 uppercase tracking-widest">Net Fiscal Yield</span>
            <div className={`font-serif text-2xl font-normal mt-2 ${kpis.totalFleetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{kpis.totalFleetProfit.toLocaleString()}
            </div>
            <span className="font-mono text-[10px] text-ivory-300/40 mt-1 block">After Repairs & Fuel</span>
          </div>
        </div>
      </div>

      {/* Institutional Commission Finding Notice */}
      <div className="bg-navy-900 border-l-2 border-tan-500 p-6 border border-ivory-100/10">
        <div className="font-mono text-[10px] uppercase tracking-archival text-tan-500 mb-2">
          Statutory Finding & Executive Directive
        </div>
        <h4 className="font-serif text-xl text-ivory-100 font-normal mb-2">
          Asset Profitability Appraisal & Regulated Rate Realignment
        </h4>
        <p className="font-sans text-xs text-ivory-300/80 leading-relaxed font-light">
          Under statutory fleet review, models incurring elevated mechanical repair burdens or low market request volume require rate schedule revision or asset condemnation. High-margin vehicle categories warrant capital allocation for fleet acquisition, while loss-making units must undergo workshop inspection to mitigate operational leakage.
        </p>
      </div>

      {/* Category Comparative Statistics Table */}
      <div>
        <SectionLabel number="02" label="Category-by-Category Comprehensive Audit" badge="Archival Ledger" />
        <div className="border border-ivory-100/10 overflow-hidden bg-navy-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-ivory-100/10 bg-navy-950/80 text-[10px] font-mono text-ivory-300/60 uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-3.5">Vehicle Classification</th>
                  <th className="px-5 py-3.5">Enrolled Units</th>
                  <th className="px-5 py-3.5">Avg Acquisition Price</th>
                  <th className="px-5 py-3.5">Demand (Filings / Hrs)</th>
                  <th className="px-5 py-3.5">Repair Burden (Total / Avg)</th>
                  <th className="px-5 py-3.5">Fuel Consumed</th>
                  <th className="px-5 py-3.5">Gross Revenue</th>
                  <th className="px-5 py-3.5">Net Contribution</th>
                  <th className="px-5 py-3.5">Margin</th>
                  <th className="px-5 py-3.5">Regulatory Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-100/5 font-light">
                {categoryStatistics.map((stat) => (
                  <tr key={stat.categoryId} className="hover:bg-navy-850/60 transition-colors">
                    <td className="px-5 py-4 font-serif text-sm text-ivory-100 font-medium">
                      <div>{stat.categoryName}</div>
                      <span className="font-mono text-[10px] text-ivory-300/40 uppercase">
                        {stat.seatingCapacity} Seater • {stat.fuelType}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <span className="text-ivory-200">{stat.totalVehicles} units</span>
                      <div className="text-[10px] text-ivory-300/40">
                        {stat.acVehicles} AC, {stat.nonAcVehicles} Non-AC
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-ivory-200">
                      ₹{stat.avgPurchasePrice.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <span className="text-tan-400 font-semibold">{stat.demandBookingsCount} trips</span>
                      <div className="text-[10px] text-ivory-300/40">{stat.totalHoursRented} hrs billed</div>
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <span className="text-amber-300/90">₹{stat.totalRepairExpense.toLocaleString()}</span>
                      <div className="text-[10px] text-ivory-300/40">₹{stat.avgRepairExpense.toLocaleString()} / car</div>
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <span className="text-ivory-200">{stat.totalFuelLiters} L</span>
                      <div className="text-[10px] text-ivory-300/40">₹{stat.totalFuelExpense.toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-medium text-ivory-100">
                      ₹{stat.totalRevenue.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold">
                      <span className={stat.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        ₹{stat.netProfit.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <span className={`px-2 py-0.5 text-[10px] border ${
                        stat.profitMargin >= 30
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                          : stat.profitMargin >= 0
                          ? 'border-tan-500/30 text-tan-400 bg-tan-500/10'
                          : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                      }`}>
                        {stat.profitMargin}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-sans text-ivory-300/70 max-w-xs">
                      {stat.recommendation}
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
