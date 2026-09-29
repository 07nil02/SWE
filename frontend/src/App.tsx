import React, { useState, useEffect, useCallback } from 'react';
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
import { api, Vehicle, CategoryStat, RentalBooking, FleetAnalytics, BASE_URL } from './api/client';

export const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rentals, setRentals] = useState<RentalBooking[]>([]);
  const [analytics, setAnalytics] = useState<FleetAnalytics | null>(null);

  // Modals & Drawers
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
  const [isOperationsOpen, setIsOperationsOpen] = useState<boolean>(false);

  // Toast Notification
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [cats, vehs, rents, stats] = await Promise.all([
        api.getCategories(),
        api.getVehicles(),
        api.getRentals(),
        api.getAnalytics(),
      ]);
      setCategories(cats);
      setVehicles(vehs);
      setRentals(rents);
      setAnalytics(stats);
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
  }, []);

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
    // Scroll down to fleet section or open booking flow directly
    const targetCat = criteria.acPreferred ? 'Maruti Esteem' : undefined;
    const matchedVehicle = targetCat
      ? vehicles.find((v) => v.categoryName === targetCat && v.status === 'AVAILABLE')
      : vehicles.find((v) => v.status === 'AVAILABLE');

    setBookingVehicle(matchedVehicle || null);
    setIsBookingOpen(true);
  };

  const detailCategory = detailVehicle
    ? categories.find((c) => c.name === detailVehicle.categoryName)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#090a0b] font-sans selection:bg-[#c5a880]/30 selection:text-[#090a0b]">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#090a0b] text-[#faf9f6] border border-[#c5a880] px-5 py-3.5 shadow-2xl flex items-center space-x-3 text-xs font-mono animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#c5a880] animate-ping" />
          <span>{notification}</span>
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
        onOpenOperations={() => setIsOperationsOpen(true)}
        onNavigateSection={handleNavigateSection}
        kpis={analytics?.kpis}
      />

      {/* Cinematic Automotive Hero Section */}
      <Hero
        onSearch={handleHeroSearch}
      />

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
        onOpenOperations={() => setIsOperationsOpen(true)}
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
            showNotification('Reservation successfully confirmed. Confirmation manifest generated.');
            loadData();
          }}
        />
      )}

      {/* Drawer / Full Modal 3: Fleet Dispatch & Accounting Operations Workspace */}
      {isOperationsOpen && (
        <OperationsWorkspace
          vehicles={vehicles}
          categories={categories}
          rentals={rentals}
          analytics={analytics}
          onRefresh={loadData}
          onClose={() => setIsOperationsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
