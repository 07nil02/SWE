const API_BASE = (import.meta as any).env?.VITE_API_URL ? `${(import.meta as any).env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';
const BASE_URL = API_BASE;

export interface CategoryStat {
  _id: string;
  name: string;
  baseHourlyRate: number;
  baseKmRate: number;
  seatingCapacity: number;
  fuelType: 'Petrol' | 'Diesel';
  description?: string;
  totalVehicles: number;
  availableNonAc: number;
  availableAc: number;
  rented: number;
  inRepair: number;
  condemned: number;
  acHourlyRate: number;
  acKmRate: number;
  minNonAcCharge: number;
  minAcCharge: number;
}

export interface Vehicle {
  _id: string;
  registrationNumber: string;
  category: string;
  categoryName: string;
  isAC: boolean;
  status: 'AVAILABLE' | 'RENTED_OUT' | 'UNDER_REPAIR' | 'CONDEMNED_SOLD';
  purchasePrice: number;
  purchaseDate: string;
  currentOdometer: number;
  lastServiceDate?: string;
  salvageValue?: number;
  condemnedDate?: string;
  notes?: string;
}

export interface RentalBooking {
  _id: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  customerLicense?: string;
  vehicle: string | Vehicle;
  vehicleReg: string;
  categoryName: string;
  isAC: boolean;
  hourlyRate: number;
  kmRate: number;
  advanceAmount: number;
  bookingDate: string;
  expectedReturnDate: string;
  dispatchedAt?: string;
  startOdometer?: number;
  actualReturnDate?: string;
  endOdometer?: number;
  distanceKm?: number;
  durationHours?: number;
  nightHalts: number;
  hourlyChargeAmount?: number;
  kmChargeAmount?: number;
  minChargeAmount?: number;
  nightHaltCharge?: number;
  totalAmount?: number;
  settlementType?: 'REFUND' | 'ADDITIONAL_PAYMENT' | 'EXACT';
  settlementAmount?: number;
  status: 'BOOKED' | 'DISPATCHED' | 'RETURNED_SETTLED' | 'CANCELLED';
  notes?: string;
}

export interface MaintenanceLog {
  _id: string;
  vehicle: string;
  vehicleReg: string;
  categoryName: string;
  repairDate: string;
  description: string;
  cost: number;
  workshop?: string;
  repairType: string;
}

export interface FuelLog {
  _id: string;
  vehicle: string;
  vehicleReg: string;
  categoryName: string;
  fuelDate: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometerAtFill?: number;
}

export interface FleetAnalytics {
  kpis: {
    totalVehicles: number;
    availableCount: number;
    rentedCount: number;
    repairCount: number;
    condemnedCount: number;
    fleetUtilizationRate: number;
    totalFleetRevenue: number;
    totalFleetRepairs: number;
    totalFleetFuel: number;
    totalFleetProfit: number;
    totalDemandBookings: number;
  };
  categoryStatistics: Array<{
    categoryId: string;
    categoryName: string;
    baseHourlyRate: number;
    baseKmRate: number;
    seatingCapacity: number;
    fuelType: string;
    totalVehicles: number;
    acVehicles: number;
    nonAcVehicles: number;
    avgPurchasePrice: number;
    totalRepairExpense: number;
    avgRepairExpense: number;
    totalFuelLiters: number;
    totalFuelExpense: number;
    demandBookingsCount: number;
    totalHoursRented: number;
    totalKmRun: number;
    totalRevenue: number;
    avgRevenuePerBooking: number;
    operationalExpenses: number;
    netProfit: number;
    profitMargin: number;
    recommendation: string;
  }>;
}

export const api = {
  // Categories & Rates
  async getCategories(): Promise<CategoryStat[]> {
    const res = await fetch(`${BASE_URL}/categories`);
    const json = await res.json();
    return json.data;
  },

  async updateCategoryRates(id: string, baseHourlyRate: number, baseKmRate: number) {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseHourlyRate, baseKmRate }),
    });
    return res.json();
  },

  // Vehicles
  async getVehicles(params?: { status?: string; category?: string; isAC?: string; search?: string }): Promise<Vehicle[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.isAC) query.append('isAC', params.isAC);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${BASE_URL}/vehicles?${query.toString()}`);
    const json = await res.json();
    return json.data;
  },

  async addVehicle(data: {
    registrationNumber: string;
    categoryId: string;
    isAC: boolean;
    purchasePrice: number;
    currentOdometer: number;
    notes?: string;
  }) {
    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateVehicleStatus(id: string, status: 'AVAILABLE' | 'UNDER_REPAIR', notes?: string) {
    const res = await fetch(`${BASE_URL}/vehicles/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    return res.json();
  },

  async condemnVehicle(id: string, salvageValue: number, notes?: string) {
    const res = await fetch(`${BASE_URL}/vehicles/${id}/condemn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salvageValue, notes }),
    });
    return res.json();
  },

  // Rentals
  async getRentals(status?: string): Promise<RentalBooking[]> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${BASE_URL}/rentals${query}`);
    const json = await res.json();
    return json.data;
  },

  async calculateQuote(payload: {
    categoryId: string;
    isAC: boolean;
    hoursUsed: number;
    distanceKm: number;
    nightHalts: number;
    advanceAmount: number;
  }) {
    const res = await fetch(`${BASE_URL}/rentals/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async createBooking(payload: {
    customerName: string;
    customerPhone: string;
    customerLicense?: string;
    vehicleId: string;
    expectedReturnDate: string;
    advanceAmount: number;
    notes?: string;
  }) {
    const res = await fetch(`${BASE_URL}/rentals/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async dispatchVehicle(id: string, payload: { dispatchedAt?: string; startOdometer?: number }) {
    const res = await fetch(`${BASE_URL}/rentals/${id}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async returnVehicle(id: string, payload: {
    actualReturnDate?: string;
    endOdometer: number;
    nightHalts: number;
    notes?: string;
  }) {
    const res = await fetch(`${BASE_URL}/rentals/${id}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Maintenance & Fuel
  async getMaintenanceLogs(vehicleId?: string): Promise<MaintenanceLog[]> {
    const query = vehicleId ? `?vehicleId=${vehicleId}` : '';
    const res = await fetch(`${BASE_URL}/maintenance${query}`);
    const json = await res.json();
    return json.data;
  },

  async createMaintenanceLog(payload: {
    vehicleId: string;
    description: string;
    cost: number;
    workshop?: string;
    repairType?: string;
    setUnderRepair?: boolean;
  }) {
    const res = await fetch(`${BASE_URL}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getFuelLogs(vehicleId?: string): Promise<FuelLog[]> {
    const query = vehicleId ? `?vehicleId=${vehicleId}` : '';
    const res = await fetch(`${BASE_URL}/fuel${query}`);
    const json = await res.json();
    return json.data;
  },

  async createFuelLog(payload: {
    vehicleId: string;
    liters: number;
    costPerLiter: number;
    odometerAtFill?: number;
  }) {
    const res = await fetch(`${BASE_URL}/fuel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<FleetAnalytics> {
    const res = await fetch(`${BASE_URL}/analytics/fleet-stats`);
    const json = await res.json();
    return json.data;
  },
};
