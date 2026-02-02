import { create } from 'zustand';

/**
 * Shared Store for Flight App
 * This store can be consumed by home-app
 * Note: Flights are only available as bundles with Car, Hotel, or Cruise
 */
export const useFlightStore = create((set, get) => ({
  // Flight search state
  searchQuery: '',
  selectedFlight: null,
  flights: [],
  
  // Booking details
  departureDate: null,
  returnDate: null,
  passengers: 1,
  tripType: 'roundtrip', // 'roundtrip' | 'oneway'
  cabinClass: 'economy', // 'economy' | 'business' | 'first'
  
  // Bundle tracking - flight must be bundled with another service
  bundledWith: null, // 'car' | 'hotel' | 'cruise' | null
  
  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  
  setFlights: (flights) => set({ flights }),
  
  setDepartureDate: (date) => set({ departureDate: date }),
  
  setReturnDate: (date) => set({ returnDate: date }),
  
  setPassengers: (count) => set({ passengers: Math.max(1, count) }),
  
  setTripType: (type) => set({ tripType: type }),
  
  setCabinClass: (cabinClass) => set({ cabinClass }),
  
  setBundledWith: (service) => set({ bundledWith: service }),
  
  // Clear state
  clearFlightState: () => set({ 
    searchQuery: '', 
    selectedFlight: null, 
    flights: [],
    departureDate: null,
    returnDate: null,
    passengers: 1,
    tripType: 'roundtrip',
    cabinClass: 'economy',
    bundledWith: null,
  }),
  
  // Get current state
  getFlightState: () => ({
    searchQuery: get().searchQuery,
    selectedFlight: get().selectedFlight,
    flights: get().flights,
    departureDate: get().departureDate,
    returnDate: get().returnDate,
    passengers: get().passengers,
    tripType: get().tripType,
    cabinClass: get().cabinClass,
    bundledWith: get().bundledWith,
  }),
}));
