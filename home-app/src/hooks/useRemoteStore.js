import { useEffect, useState } from 'react';
import { getRemoteStore, subscribeToRemoteStore } from '../state/stateBridge';

/**
 * Custom hook to access remote app stores
 * Usage: const carState = useRemoteStore('car');
 * Pass null to skip loading (e.g., for bundle tab)
 */
export const useRemoteStore = (appName) => {
  const [state, setState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip if no appName provided (e.g., bundle tab)
    if (!appName) {
      setState(null);
      setIsLoading(false);
      setError(null);
      return;
    }

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
 * Custom hook to access multiple remote stores
 * Usage: const results = useMultipleRemoteStores(['car', 'hotel']);
 * Returns: { car: { state, isLoading, error }, hotel: { state, isLoading, error } }
 */
export const useMultipleRemoteStores = (appNames) => {
  const [stores, setStores] = useState({});

  useEffect(() => {
    const unsubscribes = {};
    let mounted = true;

    const loadAll = async () => {
      for (const appName of appNames) {
        try {
          setStores(prev => ({
            ...prev,
            [appName]: { state: null, isLoading: true, error: null }
          }));

          const storeHook = await getRemoteStore(appName);
          
          if (!mounted) return;

          if (!storeHook) {
            setStores(prev => ({
              ...prev,
              [appName]: { state: null, isLoading: false, error: `${appName} store not available` }
            }));
            continue;
          }

          // Get initial state
          setStores(prev => ({
            ...prev,
            [appName]: { state: storeHook.getState(), isLoading: false, error: null }
          }));

          // Subscribe to changes
          unsubscribes[appName] = storeHook.subscribe((newState) => {
            if (mounted) {
              setStores(prev => ({
                ...prev,
                [appName]: { ...prev[appName], state: newState }
              }));
            }
          });
        } catch (err) {
          if (mounted) {
            setStores(prev => ({
              ...prev,
              [appName]: { state: null, isLoading: false, error: err.message }
            }));
          }
        }
      }
    };

    if (appNames.length > 0) {
      loadAll();
    }

    return () => {
      mounted = false;
      Object.values(unsubscribes).forEach(unsub => {
        if (unsub) unsub();
      });
    };
  }, [JSON.stringify(appNames)]); // eslint-disable-line react-hooks/exhaustive-deps

  return stores;
};

/**
 * Custom hook to sync search query with remote store
 * Pass null appName to skip syncing (e.g., for bundle tab)
 */
export const useSyncSearchWithRemote = (appName, searchQuery) => {
  useEffect(() => {
    // Skip if no appName provided
    if (!appName) return;

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

/**
 * Custom hook to sync search query with multiple remote stores
 * Usage: useSyncSearchWithMultipleRemotes(['car', 'hotel'], 'Miami');
 */
export const useSyncSearchWithMultipleRemotes = (appNames, searchQuery) => {
  useEffect(() => {
    const syncAll = async () => {
      const syncPromises = appNames.map(async (appName) => {
        try {
          const storeHook = await getRemoteStore(appName);
          if (storeHook) {
            const store = storeHook.getState();
            if (store.setSearchQuery) {
              store.setSearchQuery(searchQuery);
            }
          }
        } catch (error) {
          console.warn(`Failed to sync search with ${appName}:`, error);
        }
      });

      await Promise.all(syncPromises);
    };

    if (searchQuery && appNames.length > 0) {
      syncAll();
    }
  }, [JSON.stringify(appNames), searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps
};
