/**
 * State Bridge for Remote Apps
 * Loads and provides access to remote app stores
 */

// Store references
let carStoreModule = null;
let cruiseStoreModule = null;
let hotelStoreModule = null;

// Load remote store dynamically
const loadRemoteStore = async (appName) => {
  try {
    switch (appName) {
      case 'car':
        if (!carStoreModule) {
          carStoreModule = await import('car-app/store');
        }
        return carStoreModule.useCarStore;
      
      case 'cruise':
        if (!cruiseStoreModule) {
          cruiseStoreModule = await import('cruise-app/store');
        }
        return cruiseStoreModule.useCruiseStore;
      
      case 'hotel':
        if (!hotelStoreModule) {
          hotelStoreModule = await import('hotel-app/store');
        }
        return hotelStoreModule.useHotelStore;
      
      default:
        return null;
    }
  } catch (error) {
    console.warn(`Failed to load ${appName} store:`, error.message);
    return null;
  }
};

// Get remote store hook
export const getRemoteStore = async (appName) => {
  return await loadRemoteStore(appName);
};

// Subscribe to remote store changes
export const subscribeToRemoteStore = async (appName, callback) => {
  const storeHook = await loadRemoteStore(appName);
  if (!storeHook) return null;
  
  // Subscribe to store changes
  return storeHook.subscribe((state) => {
    callback(state);
  });
};

// Get current state from remote store
export const getRemoteStoreState = async (appName) => {
  const storeHook = await loadRemoteStore(appName);
  if (!storeHook) return null;
  
  return storeHook.getState();
};

// Clear all remote store caches (useful for cleanup)
export const clearRemoteStoreCaches = () => {
  carStoreModule = null;
  cruiseStoreModule = null;
  hotelStoreModule = null;
};
