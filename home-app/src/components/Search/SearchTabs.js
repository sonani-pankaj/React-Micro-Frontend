import React from 'react';
import PropTypes from 'prop-types';
import SearchTab from './SearchTab';
import { TAB_CONFIG } from './constants';

/**
 * SearchTabs Component
 * Container for all search tabs
 */
const SearchTabs = ({ activeTab, onTabChange }) => {
  const styles = {
    tabsContainer: {
      display: 'flex',
      borderBottom: '1px solid #eee',
    },
  };

  return (
    <div style={styles.tabsContainer} role="tablist">
      {TAB_CONFIG.map((tab) => (
        <SearchTab
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onClick={onTabChange}
        />
      ))}
    </div>
  );
};

SearchTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default SearchTabs;
