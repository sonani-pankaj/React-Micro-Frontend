import React, { useState, useCallback, useMemo, useEffect } from 'react';
import SearchTabs from './SearchTabs';
import SearchForm from './SearchForm';
import ServiceCheckboxes from './ServiceCheckboxes';
import useServiceAvailability from '../../hooks/useServiceAvailability';
import { TAB_CONFIG, BUNDLE_SERVICES, SEARCH_WIDGET_STYLES } from './constants';

/**
 * SearchWidget Component
 * Main search widget with tabs for Car, Cruise, Hotel, and Bundle
 * Bundle tab shows checkboxes for multi-service selection including Flight
 * Services that are unavailable are grayed out
 */
const SearchWidget = ({ onSearch, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(TAB_CONFIG[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  // For Bundle tab: track selected services
  const [bundleServices, setBundleServices] = useState(new Set(['car', 'hotel']));
  
  // Monitor service availability for bundle tab
  const { availability, loading: availabilityLoading } = useServiceAvailability(
    ['car', 'hotel', 'cruise', 'flight'],
    10000 // Check every 10 seconds
  );

  // Convert availability object to a Set of unavailable services
  const unavailableServices = useMemo(() => {
    const unavailable = new Set();
    Object.entries(availability).forEach(([serviceId, isAvailable]) => {
      if (!isAvailable) {
        unavailable.add(serviceId);
      }
    });
    return unavailable;
  }, [availability]);

  // Remove unavailable services from selection when they go offline
  useEffect(() => {
    if (unavailableServices.size > 0) {
      const newSelection = new Set(bundleServices);
      let changed = false;
      unavailableServices.forEach(serviceId => {
        if (newSelection.has(serviceId)) {
          newSelection.delete(serviceId);
          changed = true;
        }
      });
      if (changed) {
        setBundleServices(newSelection);
      }
    }
  }, [unavailableServices, bundleServices]);

  const activeTabConfig = TAB_CONFIG.find((tab) => tab.id === activeTab);
  const isBundleTab = activeTabConfig?.isBundle;

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSearchQuery(''); // Reset search when switching tabs
    if (onTabChange) {
      onTabChange(tabId);
    }
  }, [onTabChange]);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleBundleSelectionChange = useCallback((newSelection) => {
    setBundleServices(newSelection);
  }, []);

  // Get placeholder for Bundle tab based on selected services
  const getBundlePlaceholder = () => {
    if (bundleServices.size === 0) {
      return 'Select services above to search...';
    }
    if (bundleServices.size === 1) {
      const serviceId = [...bundleServices][0];
      const service = BUNDLE_SERVICES.find(s => s.id === serviceId);
      return service?.placeholder || 'Search...';
    }
    return `Search across ${bundleServices.size} services...`;
  };

  const handleSubmit = useCallback((query) => {
    if (isBundleTab) {
      // Bundle tab: search across multiple services
      if (bundleServices.size === 0) {
        console.warn('No services selected');
        return;
      }
      const searchPayload = {
        type: 'bundle',
        types: [...bundleServices],
        query: query.trim(),
      };
      if (onSearch) {
        onSearch(searchPayload);
      }
      console.log(`Searching bundle [${[...bundleServices].join(', ')}]: ${query}`);
    } else {
      // Regular tab: single service search
      if (onSearch) {
        onSearch({
          type: activeTab,
          query: query.trim(),
        });
      }
      console.log(`Searching ${activeTab}: ${query}`);
    }
  }, [activeTab, isBundleTab, bundleServices, onSearch]);

  return (
    <div style={SEARCH_WIDGET_STYLES.container}>
      <div style={SEARCH_WIDGET_STYLES.widget}>
        <SearchTabs 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
        {isBundleTab && (
          <ServiceCheckboxes
            selectedServices={bundleServices}
            onSelectionChange={handleBundleSelectionChange}
            unavailableServices={unavailableServices}
          />
        )}
        <SearchForm
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSubmit={handleSubmit}
          placeholder={isBundleTab ? getBundlePlaceholder() : activeTabConfig.placeholder}
          activeColor={activeTabConfig.color}
          disabled={isBundleTab && bundleServices.size === 0}
        />
      </div>
    </div>
  );
};

export default SearchWidget;
