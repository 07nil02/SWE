import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FleetSection } from './components/FleetSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { LocationsSection } from './components/LocationsSection';
import { TrustSection } from './components/TrustSection';
import { Footer } from './components/Footer';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { BookingFlowModal } from './components/BookingFlowModal';
import { OperationsWorkspace } from './components/OperationsWorkspace';
import { CustomerPortalModal } from './components/CustomerPortalModal';
import { AuthModal } from './components/AuthModal';
import { api, Vehicle, CategoryStat, RentalBooking, FleetAnalytics, UserRole, BASE_URL } from './api/client';

const AppContent: React.FC = () => {
  const { user, isAdmin, isCustomer, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rentals, setRentals] = useState<RentalBooking[]>([]);
  const [analytics, setAnalytics] = useState<FleetAnalytics | null>(null);

  // Modals & Portals
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
  const [isOperationsOpen, setIsOperationsOpen] = useState<boolean>(false);
  const [operationsTab, setOperationsTab] = useState<'manifest' | 'inventory' | 'workshop' | 'analytics'>('manifest');
  const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('login');
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>('CUSTOMER');

  // Toast Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Public data: Categories and Vehicles
      const [cats, vehs] = await Promise.all([
        api.getCategories(),
        api.getVehicles(),
      ]);
      setCategories(cats || []);
      setVehicles(vehs || []);

      // Administrative data: only accessible when authenticated as ADMIN
      if (isAdmin) {
        try {
          const [rents, stats] = await Promise.all([
            api.getRentals(),
            api.getAnalytics(),
          ]);
          setRentals(rents || []);
          setAnalytics(stats);
        } catch {
          // Non-fatal if ops endpoints are restricted
        }
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
      const isLocal = BASE_URL.includes('localhost') || BASE_URL === '/api';
      if (isLocal && window.location.hostname !== 'localhost') {
        setError(
          `Vercel Frontend is not connected to Backend API. Please set VITE_API_URL in Vercel Project Settings > Environment Variables to your Render backend URL (e.g. https://your-service.onrender.com) and Redeploy.`
        );
      } else {
        setError(
          `Cannot connect to Fleet API at ${BASE_URL}. If hosted on Render free tier, the server may take 30-50s to wake from cold sleep. Please wait and click Retry.`
        );
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenBooking = (vehicle?: Vehicle) => {
    setBookingVehicle(vehicle || null);
    setIsBookingOpen(true);
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setDetailVehicle(vehicle);
  };

  const handleHeroSearch = (criteria: any) => {
    const targetCat = criteria.acPreferred ? 'Maruti Esteem' : undefined;
    const matchedVehicle = targetCat
      ? vehicles.find((v) => v.categoryName === targetCat && v.status === 'AVAILABLE')
      : vehicles.find((v) => v.status === 'AVAILABLE');

    setBookingVehicle(matchedVehicle || null);
    setIsBookingOpen(true);
  };

  const handleOpenAuth = (tab: 'login' | 'register' = 'login', role: UserRole = 'CUSTOMER') => {
    setAuthDefaultTab(tab);
    setAuthDefaultRole(role);
    setIsAuthOpen(true);
  };

  const handleOpenCustomerPortal = () => {
    if (!isAuthenticated) {
      handleOpenAuth('login', 'CUSTOMER');
      showNotification('Please sign in or select Private Client access to view your reservations.', 'info');
    } else {
      setIsCustomerPortalOpen(true);
    }
  };

  const handleOpenOperations = (tab: 'manifest' | 'inventory' | 'workshop' | 'analytics' = 'manifest') => {
    setOperationsTab(tab);
    setIsOperationsOpen(true);
  };

  const detailCategory = detailVehicle
    ? categories.find((c) => c.name === detailVehicle.categoryName)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#090a0b] font-sans selection:bg-[#c5a880]/30 selection:text-[#090a0b]">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 shadow-2xl flex items-center space-x-3 text-xs font-mono animate-fade-in rounded-lg border ${
            notification.type === 'success'
              ? 'bg-[#0b1912] text-emerald-200 border-emerald-500/60'
              : notification.type === 'error'
              ? 'bg-[#220d0f] text-rose-200 border-rose-500/60'
              : 'bg-[#090a0b] text-[#faf9f6] border-[#c5a880]'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              notification.type === 'success'
                ? 'bg-emerald-400'
                : notification.type === 'error'
                ? 'bg-rose-400'
                : 'bg-[#c5a880]'
            } animate-ping`}
          />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Floating Network Error Notice */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full px-4">
          <div className="bg-rose-950/90 backdrop-blur-md border border-rose-500/50 text-rose-200 px-4 py-3 flex items-center justify-between text-xs font-mono shadow-xl">
            <span>{error}</span>
            <button
              onClick={loadData}
              className="ml-3 px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 uppercase tracking-widest text-[10px] text-white border border-rose-400"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Global Executive Masthead Navigation */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenOperations={() => handleOpenOperations('manifest')}
        onOpenCustomerPortal={handleOpenCustomerPortal}
        onOpenAuth={() => handleOpenAuth()}
        onNavigateSection={handleNavigateSection}
        kpis={analytics?.kpis}
      />

      {/* Cinematic Automotive Hero Section */}
      <Hero onSearch={handleHeroSearch} />

      {/* Executive Fleet Operations Control Console (Prominently rendered for Admin) */}
      {isAdmin && (
        <section className="bg-gradient-to-b from-[#11141a] to-[#0c0e12] border-y border-[#c5a880]/30 py-8 px-6 sm:px-10 text-white shadow-2xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-mono tracking-widest text-[#c5a880] uppercase font-semibold">
                    Executive Fleet Operations Console &bull; Full Admin Access Active
                  </span>
                </div>
                <h2 className="text-2xl font-serif text-white mt-1">
                  Fleet Management &amp; Dispatcher Workspace
                </h2>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  Logged in: <span className="text-white font-medium">{user?.name}</span> ({user?.email}) &bull; Role: <span className="text-[#c5a880] font-semibold">{user?.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenOperations('manifest')}
                  className="px-4 py-2.5 bg-[#c5a880] hover:bg-[#d8be99] text-black text-xs font-mono font-semibold uppercase tracking-wider rounded-sm transition shadow-md flex items-center gap-1.5"
                >
                  <span>Launch Operations Workspace ↗</span>
                </button>
              </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              <div
                onClick={() => handleOpenOperations('manifest')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c5a880]/60 transition cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#c5a880] mb-2">
                  <span className="font-semibold">01. DISPATCH &amp; SETTLE</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <div className="text-sm font-medium text-white mb-1">
                  Manifest ({rentals.length} Bookings)
                </div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  Record vehicle departure odometers, inspect returned vehicles, and calculate automatic settlements with night halt audits.
                </p>
              </div>

              <div
                onClick={() => handleOpenOperations('inventory')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c5a880]/60 transition cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#c5a880] mb-2">
                  <span className="font-semibold">02. INVENTORY &amp; SCRAP</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <div className="text-sm font-medium text-white mb-1">
                  Fleet Registry ({vehicles.length} Units)
                </div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  Acquire new vehicles into fleet, update plate registrations, mark vehicles under repair, or condemn end-of-life units.
                </p>
              </div>

              <div
                onClick={() => handleOpenOperations('workshop')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c5a880]/60 transition cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#c5a880] mb-2">
                  <span className="font-semibold">03. WORKSHOP &amp; FUEL</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <div className="text-sm font-medium text-white mb-1">Maintenance &amp; Fuel Desk</div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  Issue maintenance work orders, assign depot workshops, and log fuel dispensations with odometer correlation.
                </p>
              </div>

              <div
                onClick={() => handleOpenOperations('analytics')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c5a880]/60 transition cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#c5a880] mb-2">
                  <span className="font-semibold">04. BUSINESS INTELLIGENCE</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <div className="text-sm font-medium text-white mb-1">Profitability &amp; ROI</div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  Real-time category margins, total revenue, repair overheads, fuel expenses, and automated fleet sizing recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Customer / Client Welcome Bar */}
      {isCustomer && (
        <section className="bg-gradient-to-b from-[#0e1713] to-[#0a100d] border-y border-emerald-500/30 py-6 px-6 sm:px-10 text-white shadow-xl">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] font-mono tracking-widest text-emerald-300 uppercase font-semibold">
                  Private Client Account Active
                </span>
              </div>
              <h2 className="text-xl font-serif text-white mt-1">
                Welcome back, {user?.name}
              </h2>
              <div className="text-xs text-neutral-400 font-mono mt-0.5">
                License: <span className="text-neutral-200">{user?.drivingLicense || 'Verified on file'}</span> &bull; Reservations linked to your account
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenCustomerPortal}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-mono uppercase tracking-wider rounded-sm transition flex items-center gap-1.5"
              >
                <span>📋 My Reservations &amp; Settlement Vouchers →</span>
              </button>
              <button
                onClick={() => handleOpenBooking()}
                className="px-4 py-2 bg-[#c5a880] hover:bg-[#d8be99] text-black text-xs font-mono font-semibold uppercase tracking-wider rounded-sm transition"
              >
                Reserve Vehicle
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Vehicle Catalogue Grid */}
      <main className="flex-1 w-full">
        {loading && vehicles.length === 0 ? (
          <div className="py-24 text-center font-mono text-xs uppercase tracking-widest text-stone-500">
            Calibrating Fleet Telemetry...
          </div>
        ) : (
          <>
            <FleetSection
              vehicles={vehicles}
              categories={categories}
              onSelectVehicle={handleViewDetails}
              onQuickBook={(veh) => handleOpenBooking(veh)}
            />

            {/* How It Works & Pricing Engine Section */}
            <HowItWorksSection categories={categories} />

            {/* Curated Driving Destinations & Hubs */}
            <LocationsSection />

            {/* Core Operational Guarantees */}
            <TrustSection />
          </>
        )}
      </main>

      {/* Substantial Dark Automotive Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onOpenOperations={() => handleOpenOperations('manifest')}
        onScrollToSection={handleNavigateSection}
      />

      {/* Modal 1: Catalogue Dossier / Vehicle Details */}
      <VehicleDetailModal
        vehicle={detailVehicle}
        category={detailCategory}
        onClose={() => setDetailVehicle(null)}
        onProceedToBooking={(veh) => {
          setDetailVehicle(null);
          handleOpenBooking(veh);
        }}
      />

      {/* Modal 2: Multi-Step Reservation Flow with Certified Voucher */}
      {isBookingOpen && (
        <BookingFlowModal
          initialVehicle={bookingVehicle}
          vehicles={vehicles}
          categories={categories}
          onClose={() => {
            setIsBookingOpen(false);
            setBookingVehicle(null);
          }}
          onSuccess={() => {
            showNotification('Reservation successfully confirmed. Confirmation manifest generated.', 'success');
            loadData();
          }}
        />
      )}

      {/* Modal 3: Fleet Dispatch & Accounting Operations Workspace (Admin Access Controlled) */}
      {isOperationsOpen && (
        <OperationsWorkspace
          vehicles={vehicles}
          categories={categories}
          rentals={rentals}
          analytics={analytics}
          onRefresh={loadData}
          onClose={() => setIsOperationsOpen(false)}
          initialTab={operationsTab}
        />
      )}

      {/* Modal 4: Customer Portal - My Reservations & Settlement Ledger */}
      {isCustomerPortalOpen && (
        <CustomerPortalModal
          isOpen={isCustomerPortalOpen}
          onClose={() => setIsCustomerPortalOpen(false)}
          onBrowseFleet={() => handleNavigateSection('fleet')}
        />
      )}

      {/* Modal 5: Authentication & Access Control (Sign In, Register & 1-Click Evaluation) */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => {
            setIsAuthOpen(false);
            loadData();
          }}
          defaultTab={authDefaultTab}
          defaultRole={authDefaultRole}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
