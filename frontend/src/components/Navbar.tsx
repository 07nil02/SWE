import React, { useState, useEffect } from 'react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenOperations: () => void;
  onNavigateSection: (sectionId: string) => void;
  kpis?: {
    totalVehicles: number;
    availableCount: number;
    rentedCount: number;
    repairCount: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenOperations,
  onNavigateSection,
  kpis,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-charcoal-950/95 backdrop-blur-md border-b border-stone-200/10 py-3 shadow-md'
          : 'bg-gradient-to-b from-charcoal-950/80 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex justify-between items-center">
        {/* Brand Wordmark */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-8 h-8 border border-champagne-400/80 flex items-center justify-center text-champagne-400 font-serif font-bold text-sm tracking-widest group-hover:bg-champagne-400/10 transition-colors">
            V
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl text-stone-50 font-normal tracking-wide block leading-none">
              VELOCE
            </span>
            <span className="font-mono text-[9px] tracking-editorial text-champagne-400 uppercase font-medium mt-0.5 block">
              Fleet & Travel Co.
            </span>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8 text-xs font-sans font-medium text-stone-200/80">
          <button
            onClick={() => onNavigateSection('fleet')}
            className="hover:text-champagne-400 transition-colors tracking-wide"
          >
            The Fleet
          </button>
          <button
            onClick={() => onNavigateSection('how-it-works')}
            className="hover:text-champagne-400 transition-colors tracking-wide"
          >
            Pricing & Rules
          </button>
          <button
            onClick={() => onNavigateSection('destinations')}
            className="hover:text-champagne-400 transition-colors tracking-wide"
          >
            Destinations
          </button>
          <button
            onClick={() => onNavigateSection('guarantees')}
            className="hover:text-champagne-400 transition-colors tracking-wide"
          >
            Guarantees
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-4">
          {/* Operations / Dispatcher Mode Button */}
          <button
            onClick={onOpenOperations}
            className="hidden sm:inline-flex items-center space-x-2 px-3 py-1.5 border border-stone-200/20 text-stone-300 hover:text-stone-50 hover:border-stone-200/40 text-xs font-mono tracking-wider uppercase transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Fleet Ops ({kpis?.availableCount ?? 49} Ready)</span>
          </button>

          {/* Primary Booking Trigger */}
          <button
            onClick={onOpenBooking}
            className="px-5 py-2 border border-champagne-400 bg-champagne-400/15 hover:bg-champagne-400 text-champagne-300 hover:text-charcoal-950 text-xs font-mono tracking-widest uppercase transition-all duration-200"
          >
            Reserve Vehicle
          </button>
        </div>
      </div>
    </header>
  );
};
