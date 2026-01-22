import React, { useState, useCallback, useEffect } from 'react';
import SearchTabs from './SearchTabs';
import SearchForm from './SearchForm';
import { TAB_CONFIG, SEARCH_WIDGET_STYLES } from './constants';

/**
 * SearchWidget Component
 * Main search widget with tabs for Car, Cruise, and Hotel
 */
const SearchWidget = ({ onSearch, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(TAB_CONFIG[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const activeTabConfig = TAB_CONFIG.find((tab) => tab.id === activeTab);

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

  const handleSubmit = useCallback((query) => {
    if (onSearch) {
      onSearch({
        type: activeTab,
        query: query.trim(),
      });
    }
    console.log(`Searching ${activeTab}: ${query}`);
  }, [activeTab, onSearch]);

  return (
    <div style={SEARCH_WIDGET_STYLES.container}>
      <div style={SEARCH_WIDGET_STYLES.widget}>
        <SearchTabs 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
        <SearchForm
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSubmit={handleSubmit}
          placeholder={activeTabConfig.placeholder}
          activeColor={activeTabConfig.color}
        />
      </div>
    </div>
  );
};

export default SearchWidget;
