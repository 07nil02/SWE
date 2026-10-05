import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenOperations: () => void;
  onOpenCustomerPortal: () => void;
  onOpenAuth: () => void;
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
  onOpenCustomerPortal,
  onOpenAuth,
  onNavigateSection,
  kpis,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin, isCustomer, isAuthenticated, logout } = useAuth();

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
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Role-Based Launcher */}
          {isAdmin ? (
            /* Admin only: Fleet Ops */
            <button
              onClick={onOpenOperations}
              className="inline-flex items-center space-x-2 px-3 py-1.5 border border-[#c5a880]/40 bg-[#c5a880]/10 text-[#f5e6d3] hover:border-[#c5a880] text-xs font-mono tracking-wider uppercase transition-colors rounded-sm"
              title="Open Executive Fleet Operations Workspace"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Fleet Ops ({kpis?.availableCount ?? 49} Ready)</span>
            </button>
          ) : isCustomer ? (
            /* Customer only: My Reservations */
            <button
              onClick={onOpenCustomerPortal}
              className="inline-flex items-center space-x-2 px-3 py-1.5 border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:border-emerald-400 text-xs font-mono tracking-wider uppercase transition-colors rounded-sm"
              title="View your reservations and settlement receipts"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>My Reservations</span>
            </button>
          ) : (
            /* Guest / Unauthenticated: Show sign in / quick evaluation */
            <button
              onClick={onOpenAuth}
              className="hidden sm:inline-flex items-center space-x-2 px-3 py-1.5 border border-stone-200/20 text-stone-300 hover:text-stone-50 hover:border-stone-200/40 text-xs font-mono tracking-wider uppercase transition-colors"
            >
              <span>🔑 Sign In / Demo</span>
            </button>
          )}

          {/* User profile / Auth badge */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded px-2.5 py-1">
              <div className="text-left">
                <div className="text-[11px] font-sans font-medium text-white truncate max-w-[100px] sm:max-w-[130px]">
                  {user?.name}
                </div>
                <div className="text-[9px] font-mono tracking-wider text-[#c5a880] uppercase">
                  {user?.role}
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out of account"
                className="text-[11px] font-mono text-neutral-400 hover:text-red-400 px-1.5 py-0.5 ml-1 border-l border-white/10 transition-colors"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="sm:hidden px-2.5 py-1.5 border border-stone-200/20 text-stone-300 text-xs font-mono uppercase"
            >
              Sign In
            </button>
          )}

          {/* Primary Booking Trigger (Customer / Public action) */}
          <button
            onClick={onOpenBooking}
            className="px-4 sm:px-5 py-2 border border-champagne-400 bg-champagne-400/15 hover:bg-champagne-400 text-champagne-300 hover:text-charcoal-950 text-xs font-mono tracking-widest uppercase transition-all duration-200"
          >
            Reserve Vehicle
          </button>
        </div>
      </div>
    </header>
  );
};

