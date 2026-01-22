import React from 'react';
import PropTypes from 'prop-types';

/**
 * SearchTab Component
 * Individual tab button for the search widget
 */
const SearchTab = ({ tab, isActive, onClick }) => {
  const styles = {
    tab: {
      flex: 1,
      padding: '16px 24px',
      border: 'none',
      backgroundColor: isActive ? '#fff' : '#f5f5f5',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '16px',
      fontWeight: isActive ? '600' : '400',
      color: isActive ? tab.color : '#666',
    },
    icon: {
      fontSize: '20px',
    },
  };

  return (
    <button
      style={styles.tab}
      onClick={() => onClick(tab.id)}
      aria-selected={isActive}
      role="tab"
    >
      <span style={styles.icon}>{tab.icon}</span>
      <span>{tab.name}</span>
    </button>
  );
};

SearchTab.propTypes = {
  tab: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default SearchTab;
