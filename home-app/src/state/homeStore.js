import { create } from 'zustand';

/**
 * Unified State Manager for Home App
 * Aggregates state from all remote apps
 */
export const useHomeStore = create((set, get) => ({
  // Active tab tracking
  activeTab: 'car',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Search query from SearchWidget
  currentSearch: {
    type: '',
    query: '',
  },
  setCurrentSearch: (type, query) => set({ 
    currentSearch: { type, query } 
  }),
  
  // Remote stores state (cached from remote apps)
  remoteStates: {
    car: null,
    cruise: null,
    hotel: null,
  },
  
  // Update remote state cache
  updateRemoteState: (app, state) => set((current) => ({
    remoteStates: {
      ...current.remoteStates,
      [app]: state,
    },
  })),
  
  // Global app state
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  
  // Notification/toast system
  notifications: [],
  addNotification: (message, type = 'info') => set((current) => ({
    notifications: [...current.notifications, { 
      id: Date.now(), 
      message, 
      type 
    }],
  })),
  removeNotification: (id) => set((current) => ({
    notifications: current.notifications.filter(n => n.id !== id),
  })),
  
  // User preferences
  preferences: {
    theme: 'light',
    currency: 'USD',
    language: 'en',
  },
  setPreference: (key, value) => set((current) => ({
    preferences: {
      ...current.preferences,
      [key]: value,
    },
  })),
}));
