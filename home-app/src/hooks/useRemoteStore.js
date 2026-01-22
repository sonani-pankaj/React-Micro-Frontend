import { useEffect, useState } from 'react';
import { getRemoteStore, subscribeToRemoteStore } from '../state/stateBridge';

/**
 * Custom hook to access remote app stores
 * Usage: const carState = useRemoteStore('car');
 */
export const useRemoteStore = (appName) => {
  const [state, setState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;
    let mounted = true;

    const loadAndSubscribe = async () => {
      try {
        setIsLoading(true);
        const storeHook = await getRemoteStore(appName);
        
        if (!mounted) return;
        
        if (!storeHook) {
          setError(`${appName} store not available`);
          setIsLoading(false);
          return;
        }

        // Get initial state
        setState(storeHook.getState());
        
        // Subscribe to changes
        unsubscribe = storeHook.subscribe((newState) => {
          if (mounted) {
            setState(newState);
          }
        });
        
        setIsLoading(false);
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    loadAndSubscribe();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [appName]);

  return { state, isLoading, error };
};

/**
 * Custom hook to sync search query with remote store
 */
export const useSyncSearchWithRemote = (appName, searchQuery) => {
  useEffect(() => {
    const syncSearch = async () => {
      try {
        const storeHook = await getRemoteStore(appName);
        if (storeHook && searchQuery) {
          const store = storeHook.getState();
          if (store.setSearchQuery) {
            store.setSearchQuery(searchQuery);
          }
        }
      } catch (error) {
        console.warn(`Failed to sync search with ${appName}:`, error);
      }
    };

    if (searchQuery) {
      syncSearch();
    }
  }, [appName, searchQuery]);
};
