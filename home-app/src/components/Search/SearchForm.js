import React from 'react';
import PropTypes from 'prop-types';

/**
 * SearchForm Component
 * Search input form with submit button
 */
const SearchForm = ({ 
  searchQuery, 
  onSearchChange, 
  onSubmit, 
  placeholder, 
  activeColor 
}) => {
  const styles = {
    form: {
      padding: '24px',
    },
    inputGroup: {
      display: 'flex',
      gap: '12px',
    },
    input: {
      flex: 1,
      padding: '14px 18px',
      fontSize: '16px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.3s ease',
    },
    button: {
      padding: '14px 32px',
      backgroundColor: activeColor,
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(searchQuery);
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.inputGroup}>
        <input
          type="text"
          style={styles.input}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search input"
        />
        <button 
          type="submit" 
          style={styles.button}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Search
        </button>
      </div>
    </form>
  );
};

SearchForm.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  activeColor: PropTypes.string.isRequired,
};

export default SearchForm;
