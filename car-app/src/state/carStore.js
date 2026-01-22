import { create } from 'zustand';

/**
 * Shared Store for Car App
 * This store can be consumed by home-app
 */
export const useCarStore = create((set, get) => ({
  // Car search state
  searchQuery: '',
  selectedCar: null,
  cars: [],
  
  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSelectedCar: (car) => set({ selectedCar: car }),
  
  setCars: (cars) => set({ cars }),
  
  // Clear state
  clearCarState: () => set({ 
    searchQuery: '', 
    selectedCar: null, 
    cars: [] 
  }),
  
  // Get current state
  getCarState: () => ({
    searchQuery: get().searchQuery,
    selectedCar: get().selectedCar,
    cars: get().cars,
  }),
}));
