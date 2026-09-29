import React from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  kpis?: {
    totalVehicles: number;
    availableCount: number;
    rentedCount: number;
    repairCount: number;
  };
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, kpis }) => {
  return (
    <header className="w-full bg-navy-950 border-b border-ivory-100/10 sticky top-0 z-40 backdrop-blur-md bg-navy-950/95">
      {/* Top Document Classification Bar */}
      <div className="border-b border-ivory-100/5 px-6 sm:px-12 py-1.5 flex justify-between items-center text-[11px] font-mono text-ivory-300/60 uppercase tracking-widest">
        <div className="flex items-center space-x-3">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse"></span>
          <span>Official Operational Registry // Ref: TR-REG-2026/09</span>
        </div>
        <div className="hidden sm:flex items-center space-x-6 text-ivory-300/50">
          <span>Sovereign Fleet Docket</span>
          <span>Gazette Vol. XLVIII</span>
          {kpis && (
            <span className="text-tan-400 font-semibold">
              Enrolled Assets: {kpis.totalVehicles} ({kpis.availableCount} Ready)
            </span>
          )}
        </div>
      </div>

      {/* Main Masthead Bar */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex justify-between items-center">
        {/* Left: Institutional Wordmark */}
        <div 
          onClick={() => setActiveTab('portals')}
          className="flex items-center space-x-4 cursor-pointer group"
        >
          <div className="w-10 h-10 border border-tan-500/40 bg-navy-900 flex items-center justify-center text-tan-400 group-hover:border-tan-400 transition-colors">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zm-8 7.5v6.5l8 4 8-4V9.5l-8 4-8-4z"/>
            </svg>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-archival text-tan-500 uppercase font-medium">
              Directorate of Public Transit
            </div>
            <h1 className="font-serif text-xl sm:text-2xl tracking-wide text-ivory-100 font-medium leading-none mt-0.5">
              National Fleet Administration
            </h1>
          </div>
        </div>

        {/* Right: Sparse Navigation & Action */}
        <div className="flex items-center space-x-8">
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-mono tracking-widest text-ivory-300/70">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`hover:text-ivory-100 transition-colors pb-1 ${
                activeTab === 'analytics' ? 'text-tan-400 border-b border-tan-400' : ''
              }`}
            >
              01. LEDGER
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`hover:text-ivory-100 transition-colors pb-1 ${
                activeTab === 'fleet' ? 'text-tan-400 border-b border-tan-400' : ''
              }`}
            >
              02. REGISTRY
            </button>
            <button
              onClick={() => setActiveTab('rentals')}
              className={`hover:text-ivory-100 transition-colors pb-1 ${
                activeTab === 'rentals' ? 'text-tan-400 border-b border-tan-400' : ''
              }`}
            >
              03. DISPATCH
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`hover:text-ivory-100 transition-colors pb-1 ${
                activeTab === 'rates' ? 'text-tan-400 border-b border-tan-400' : ''
              }`}
            >
              04. TARIFFS
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`hover:text-ivory-100 transition-colors pb-1 ${
                activeTab === 'maintenance' ? 'text-tan-400 border-b border-tan-400' : ''
              }`}
            >
              05. WORKSHOP
            </button>
          </nav>

          <button
            onClick={() => setActiveTab('rentals')}
            className="px-4 py-2 border border-tan-500/40 hover:border-tan-400 bg-tan-500/10 hover:bg-tan-500/20 text-tan-400 hover:text-ivory-100 text-xs font-mono tracking-widest uppercase transition-all duration-200"
          >
            Issue Booking →
          </button>
        </div>
      </div>
    </header>
  );
};
