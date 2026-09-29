import React from 'react';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenOperations: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBooking,
  onOpenOperations,
  onScrollToSection
}) => {
  const scrollTo = (id: string) => {
    if (onScrollToSection) {
      onScrollToSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#090a0b] text-[#faf9f6]/70 border-t border-[#faf9f6]/10 pt-20 pb-12 font-sans selection:bg-[#c5a880]/20 selection:text-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Top Pre-Footer Call to Action */}
        <div className="pb-16 mb-16 border-b border-[#faf9f6]/10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8 space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#c5a880]">
              Elevated Mobility // Engineered Precision
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#faf9f6] tracking-tight leading-tight">
              Ready to embark on your next journey?
            </h2>
            <p className="text-sm sm:text-base text-[#faf9f6]/60 font-light max-w-xl leading-relaxed">
              Every vehicle in our 52-car fleet is mechanically certified, immaculately detailed, and backed by transparent, deterministic dual-metric pricing.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#faf9f6] text-[#090a0b] font-mono text-xs uppercase tracking-widest font-semibold hover:bg-[#c5a880] transition-colors duration-200 text-center shadow-lg"
            >
              Reserve a Vehicle
            </button>
            <button
              onClick={onOpenOperations}
              className="w-full sm:w-auto px-8 py-3.5 border border-[#faf9f6]/20 text-[#faf9f6]/80 font-mono text-xs uppercase tracking-widest hover:border-[#faf9f6]/50 hover:text-[#faf9f6] transition-colors duration-200 text-center"
            >
              Fleet Operations & Vouchers
            </button>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-[#faf9f6]/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center space-x-3">
              <span className="font-serif text-2xl tracking-tight text-[#faf9f6] font-normal">
                V E L O C E
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#c5a880] border border-[#c5a880]/30 px-1.5 py-0.5">
                EST. 1998
              </span>
            </div>
            <p className="text-xs text-[#faf9f6]/50 leading-relaxed max-w-sm font-light">
              Premier automotive rental agency and managed transport enterprise. Operating 52 certified luxury, expedition, utility, and executive vehicles with round-the-clock roadside custody.
            </p>
            <div className="font-mono text-[11px] text-[#faf9f6]/40 space-y-1">
              <div>Corporate Central Dispatch Hub</div>
              <div>Terminal Hub 01, Aerocity Corridor, New Delhi</div>
              <div className="text-[#c5a880]">dispatch@velocefleet.com // +91 (011) 4920-8000</div>
            </div>
          </div>

          {/* Column 2: Vehicle Categories */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#faf9f6] font-semibold">
              The Fleet
            </h3>
            <ul className="space-y-2.5 text-xs text-[#faf9f6]/60 font-light">
              <li>
                <button onClick={() => scrollTo('fleet')} className="hover:text-[#c5a880] transition-colors">
                  Hindustan Ambassador (AC & Non-AC)
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('fleet')} className="hover:text-[#c5a880] transition-colors">
                  Tata Sumo Multi-Utility (AC & Non-AC)
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('fleet')} className="hover:text-[#c5a880] transition-colors">
                  Maruti Esteem Luxury Sedan (AC)
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('fleet')} className="hover:text-[#c5a880] transition-colors">
                  Mahindra Armada Expedition (4x4)
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('fleet')} className="hover:text-[#c5a880] transition-colors">
                  Maruti Omni City Van (Non-AC)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Fair Tariff & Rules */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#faf9f6] font-semibold">
              Tariff Codex
            </h3>
            <ul className="space-y-2.5 text-xs text-[#faf9f6]/60 font-light">
              <li>
                <button onClick={() => scrollTo('pricing')} className="hover:text-[#c5a880] transition-colors">
                  Dual-Metric Price Guarantee
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('pricing')} className="hover:text-[#c5a880] transition-colors">
                  4-Hour Minimum Reservation Floor
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('pricing')} className="hover:text-[#c5a880] transition-colors">
                  AC Vehicle Surcharge (+50%)
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('pricing')} className="hover:text-[#c5a880] transition-colors">
                  Night Halt Flat Demurrage (₹150/night)
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('pricing')} className="hover:text-[#c5a880] transition-colors">
                  Advance Deposition & Refund Math
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Operational Services */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#faf9f6] font-semibold">
              Dispatch & Ops
            </h3>
            <ul className="space-y-2.5 text-xs text-[#faf9f6]/60 font-light">
              <li>
                <button onClick={onOpenOperations} className="hover:text-[#c5a880] transition-colors">
                  Dispatch & Return Vouchers
                </button>
              </li>
              <li>
                <button onClick={onOpenOperations} className="hover:text-[#c5a880] transition-colors">
                  Live Settlement Calculator
                </button>
              </li>
              <li>
                <button onClick={onOpenOperations} className="hover:text-[#c5a880] transition-colors">
                  Fleet Registry & Custody
                </button>
              </li>
              <li>
                <button onClick={onOpenOperations} className="hover:text-[#c5a880] transition-colors">
                  Workshop Work Orders & Service
                </button>
              </li>
              <li>
                <button onClick={onOpenOperations} className="hover:text-[#c5a880] transition-colors">
                  Fleet Business Intelligence
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Compliance & Status */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-[#faf9f6]/40">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SYSTEM ONLINE // 52 VEHICLES MONITORED // ISO 9001:2015</span>
          </div>

          <div>
            © {new Date().getFullYear()} VELOCE FLEET & TRAVEL CO. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center space-x-6">
            <span className="hover:text-[#faf9f6] transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-[#faf9f6] transition-colors cursor-pointer">
              Rental Agreement
            </span>
            <span className="hover:text-[#faf9f6] transition-colors cursor-pointer">
              Statutory Tariffs
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
