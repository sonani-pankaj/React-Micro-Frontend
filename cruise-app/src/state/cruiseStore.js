import { create } from 'zustand';

/**
 * Shared Store for Cruise App
 * This store can be consumed by home-app
 */
export const useCruiseStore = create((set, get) => ({
  // Cruise search state
  searchQuery: '',
  selectedCruise: null,
  cruises: [],
  dateRange: null,
  
  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSelectedCruise: (cruise) => set({ selectedCruise: cruise }),
  
  setCruises: (cruises) => set({ cruises }),
  
  setDateRange: (dateRange) => set({ dateRange }),
  
  // Clear state
  clearCruiseState: () => set({ 
    searchQuery: '', 
    selectedCruise: null, 
    cruises: [],
    dateRange: null,
  }),
  
  // Get current state
  getCruiseState: () => ({
    searchQuery: get().searchQuery,
    selectedCruise: get().selectedCruise,
    cruises: get().cruises,
    dateRange: get().dateRange,
  }),
}));
