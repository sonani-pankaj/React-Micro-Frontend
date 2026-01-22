import { create } from 'zustand';

/**
 * Shared Store for Hotel App
 * This store can be consumed by home-app
 */
export const useHotelStore = create((set, get) => ({
  // Hotel search state
  searchQuery: '',
  selectedHotel: null,
  hotels: [],
  checkIn: null,
  checkOut: null,
  guests: 1,
  
  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSelectedHotel: (hotel) => set({ selectedHotel: hotel }),
  
  setHotels: (hotels) => set({ hotels }),
  
  setCheckIn: (date) => set({ checkIn: date }),
  
  setCheckOut: (date) => set({ checkOut: date }),
  
  setGuests: (count) => set({ guests: count }),
  
  // Clear state
  clearHotelState: () => set({ 
    searchQuery: '', 
    selectedHotel: null, 
    hotels: [],
    checkIn: null,
    checkOut: null,
    guests: 1,
  }),
  
  // Get current state
  getHotelState: () => ({
    searchQuery: get().searchQuery,
    selectedHotel: get().selectedHotel,
    hotels: get().hotels,
    checkIn: get().checkIn,
    checkOut: get().checkOut,
    guests: get().guests,
  }),
}));

// Legacy export for backward compatibility
export const useStore = useHotelStore;