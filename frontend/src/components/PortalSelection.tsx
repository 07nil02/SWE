import React from 'react';
import { PortalCard } from './PortalCard';

interface PortalSelectionProps {
  onSelectTab: (tab: string) => void;
  kpis?: {
    totalVehicles: number;
    availableCount: number;
    rentedCount: number;
    repairCount: number;
    totalFleetRevenue: number;
    totalFleetProfit: number;
  };
}

export const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelectTab, kpis }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-ivory-100/10 pb-6 mb-10">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-archival text-tan-500 mb-1">
            Section II • Operational Portals
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-ivory-100 font-normal">
            Statutory Administration Divisions
          </h2>
        </div>
        <p className="font-sans text-xs text-ivory-300/60 max-w-md mt-3 md:mt-0 font-light">
          Select an administrative entry point to review sovereign asset ledgers, execute dispatch depositions, or audit model profitability.
        </p>
      </div>

      {/* Grid of 3 Main Cards (with 2 complementary cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PortalCard
          index="01 — FISCAL"
          category="Directorate of Audit & Profitability"
          title="Statistical Ledger & Intelligence"
          description="Examine macroscopic revenue yields, lifecycle repair overheads, fuel expenditure metrics, and model-specific profitability evaluations."
          actionText="Inspect Ledger"
          stats={kpis ? `Revenue: ₹${kpis.totalFleetRevenue.toLocaleString()}` : '5 Primary Models'}
          onClick={() => onSelectTab('analytics')}
        />

        <PortalCard
          index="02 — CUSTODY"
          category="Sovereign Asset Registry"
          title="Fleet Custody & Registration"
          description="Access the comprehensive 52-vehicle inventory. Oversee physical custody protocols across Available readiness, Workshop repair, and Condemnation."
          actionText="View Registry"
          stats={kpis ? `${kpis.availableCount} Assets Ready for Duty` : '52 Enrolled Units'}
          onClick={() => onSelectTab('fleet')}
        />

        <PortalCard
          index="03 — DISPATCH"
          category="Operations & Judicial Settlement"
          title="Dispatch Manifest & Settlements"
          description="Issue new reservation filings, record odometer departure depositions, process vehicle re-entry, and generate official gazette billing vouchers."
          actionText="Access Manifest"
          stats={kpis ? `${kpis.rentedCount} Vehicles on Deployment` : 'Active Trips'}
          onClick={() => onSelectTab('rentals')}
        />
      </div>

      {/* Secondary Row of 2 Supporting Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <PortalCard
          index="04 — TARIFF"
          category="Statutory Rate Codex"
          title="Tariff Schedule & Fare Estimator"
          description="Simulate regulated passenger tariffs based on dual-maximizer rules: higher of elapsed duration or odometer distance, subject to mandatory 4-hour floor."
          actionText="Calculate Fare"
          stats="Statutory 4-Hr Floor • +50% AC"
          onClick={() => onSelectTab('rates')}
        />

        <PortalCard
          index="05 — WORKSHOP"
          category="Maintenance & Fuel Accounting"
          title="Work Orders & Fuel Deposition"
          description="Log workshop mechanical work orders, spare-parts replacement expenditures, vehicle grounding protocols, and fuel dispensing volume histories."
          actionText="Audit Workshop"
          stats="Maintenance & Fuel Ledger"
          onClick={() => onSelectTab('maintenance')}
        />
      </div>
    </section>
  );
};
