import { useState, useCallback } from 'react';

/**
 * Custom hook for search functionality
 * Provides search state management and handlers
 */
const useSearch = (initialTab = 'car') => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSearchQuery('');
  }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleSubmit = useCallback(async (query, onSearch) => {
    if (!query.trim()) return;

    setIsLoading(true);
    
    const searchEntry = {
      type: activeTab,
      query: query.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add to history
    setSearchHistory((prev) => [searchEntry, ...prev.slice(0, 9)]);

    if (onSearch) {
      await onSearch(searchEntry);
    }

    setIsLoading(false);
  }, [activeTab]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return {
    activeTab,
    searchQuery,
    searchHistory,
    isLoading,
    handleTabChange,
    handleSearchChange,
    handleSubmit,
    clearHistory,
  };
};

export default useSearch;
