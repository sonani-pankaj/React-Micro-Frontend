import { useState, useEffect, useCallback } from 'react';

// Remote URLs for health check
const REMOTE_URL_BASE = {
  car: 'http://localhost:3001/remoteEntry.js',
  cruise: 'http://localhost:3002/remoteEntry.js',
  hotel: 'http://localhost:3003/remoteEntry.js',
  flight: 'http://localhost:3004/remoteEntry.js',
};

/**
 * Check if a remote service is available via fetch
 * @param {string} url - The remote entry URL to check
 * @returns {Promise<boolean>} - True if available, false otherwise
 */
const checkServiceAvailability = async (url) => {
  try {
    // Use no-cors mode - we only care if request succeeds, not the response content
    await fetch(url, { 
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store'
    });
    // In no-cors mode, response.type will be 'opaque' but request succeeded
    return true;
  } catch {
    return false;
  }
};

/**
 * Check availability of multiple services in parallel
 * @param {string[]} serviceIds - Array of service IDs to check
 * @returns {Promise<Object>} - Object mapping service IDs to availability status
 */
const checkAllServices = async (serviceIds) => {
  const results = await Promise.all(
    serviceIds.map(async (serviceId) => {
      const url = REMOTE_URL_BASE[serviceId];
      if (!url) {
        // Unknown service, consider unavailable
        return { serviceId, available: false };
      }
      const available = await checkServiceAvailability(url);
      return { serviceId, available };
    })
  );

  return results.reduce((acc, { serviceId, available }) => {
    acc[serviceId] = available;
    return acc;
  }, {});
};

/**
 * Hook to monitor availability of bundle services
 * @param {string[]} serviceIds - Array of service IDs to monitor
 * @param {number} checkInterval - Interval in ms between checks (default: 10000)
 * @returns {Object} - { availability: {serviceId: boolean}, loading: boolean, refresh: function }
 */
const useServiceAvailability = (serviceIds = ['car', 'hotel', 'cruise', 'flight'], checkInterval = 10000) => {
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);

  // Function to check all services
  const checkServices = useCallback(async () => {
    const results = await checkAllServices(serviceIds);
    setAvailability(results);
    setLoading(false);
  }, [serviceIds]);

  // Initial check and periodic refresh
  useEffect(() => {
    // Initial check
    checkServices();

    // Set up periodic checking
    const intervalId = setInterval(checkServices, checkInterval);

    return () => clearInterval(intervalId);
  }, [checkServices, checkInterval]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setLoading(true);
    await checkServices();
  }, [checkServices]);

  return {
    availability,  // { car: true, hotel: true, cruise: false, flight: true }
    loading,       // true while checking
    refresh,       // call to manually refresh
  };
};

export default useServiceAvailability;
