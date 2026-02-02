import React from 'react';
import PropTypes from 'prop-types';
import { useMultipleRemoteStores } from '../../hooks/useRemoteStore';
import { SERVICE_CONFIG } from './constants';

const RESULTS_STYLES = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '20px auto',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderBottom: '1px solid #eee',
    fontWeight: '600',
  },
  sectionBody: {
    padding: '16px',
  },
  noResults: {
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  loading: {
    color: '#3498db',
  },
  error: {
    color: '#e74c3c',
  },
  resultItem: {
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  searchQuery: {
    fontSize: '14px',
    color: '#95a5a6',
    marginBottom: '8px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#95a5a6',
  },
};

/**
 * CombinedResults Component
 * Displays search results from multiple remote stores grouped by service type
 */
const CombinedResults = ({ selectedServices, searchQuery }) => {
  const serviceIds = [...selectedServices];
  const stores = useMultipleRemoteStores(serviceIds);

  if (serviceIds.length === 0) {
    return (
      <div style={RESULTS_STYLES.container}>
        <div style={RESULTS_STYLES.emptyState}>
          <p>Select services above to see results</p>
        </div>
      </div>
    );
  }

  if (!searchQuery) {
    return (
      <div style={RESULTS_STYLES.container}>
        <div style={RESULTS_STYLES.emptyState}>
          <p>Enter a search query to find results</p>
        </div>
      </div>
    );
  }

  return (
    <div style={RESULTS_STYLES.container}>
      {serviceIds.map((serviceId) => {
        const service = SERVICE_CONFIG.find(s => s.id === serviceId);
        const storeData = stores[serviceId];

        if (!service) return null;

        return (
          <div key={serviceId} style={RESULTS_STYLES.section}>
            <div 
              style={{ 
                ...RESULTS_STYLES.sectionHeader,
                backgroundColor: `${service.color}10`,
                borderLeft: `4px solid ${service.color}`,
              }}
            >
              <span style={{ fontSize: '24px' }}>{service.icon}</span>
              <span>{service.name} Results</span>
            </div>
            <div style={RESULTS_STYLES.sectionBody}>
              {renderStoreContent(storeData, service)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const renderStoreContent = (storeData, service) => {
  if (!storeData) {
    return <p style={RESULTS_STYLES.loading}>Initializing...</p>;
  }

  if (storeData.isLoading) {
    return <p style={RESULTS_STYLES.loading}>Loading {service.name.toLowerCase()}s...</p>;
  }

  if (storeData.error) {
    return (
      <p style={RESULTS_STYLES.error}>
        {service.name} service unavailable: {storeData.error}
      </p>
    );
  }

  const state = storeData.state;
  if (!state) {
    return <p style={RESULTS_STYLES.noResults}>No data available</p>;
  }

  // Get the results array based on service type
  const resultsKey = `${service.id}s`; // cars, hotels, cruises, flights
  const results = state[resultsKey] || [];
  const currentQuery = state.searchQuery || '';

  return (
    <div>
      {currentQuery && (
        <p style={RESULTS_STYLES.searchQuery}>
          Searching for: "{currentQuery}"
        </p>
      )}
      {results.length > 0 ? (
        results.map((item, index) => (
          <div key={item.id || index} style={RESULTS_STYLES.resultItem}>
            {item.name || item.title || `${service.name} ${index + 1}`}
          </div>
        ))
      ) : (
        <p style={RESULTS_STYLES.noResults}>
          No {service.name.toLowerCase()}s found. Try a different search.
        </p>
      )}
    </div>
  );
};

CombinedResults.propTypes = {
  selectedServices: PropTypes.instanceOf(Set).isRequired,
  searchQuery: PropTypes.string,
};

CombinedResults.defaultProps = {
  searchQuery: '',
};

export default CombinedResults;
