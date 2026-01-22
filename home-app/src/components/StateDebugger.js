import React from 'react';

/**
 * StateDebugger Component
 * Shows the current state from remote stores
 */
const StateDebugger = ({ remoteState, appName, isLoading, error }) => {
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.icon}>🔄</span>
          Loading {appName} state...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{...styles.container, ...styles.error}}>
        <div style={styles.header}>
          <span style={styles.icon}>⚠️</span>
          {appName} Store Error
        </div>
        <div style={styles.content}>{error}</div>
      </div>
    );
  }

  if (!remoteState) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>📊</span>
        {appName} Store State
      </div>
      <div style={styles.content}>
        <div style={styles.row}>
          <span style={styles.label}>Search Query:</span>
          <span style={styles.value}>{remoteState.searchQuery || 'None'}</span>
        </div>
        {remoteState.selectedCar && (
          <div style={styles.row}>
            <span style={styles.label}>Selected Car:</span>
            <span style={styles.value}>{JSON.stringify(remoteState.selectedCar)}</span>
          </div>
        )}
        {remoteState.selectedCruise && (
          <div style={styles.row}>
            <span style={styles.label}>Selected Cruise:</span>
            <span style={styles.value}>{JSON.stringify(remoteState.selectedCruise)}</span>
          </div>
        )}
        {remoteState.selectedHotel && (
          <div style={styles.row}>
            <span style={styles.label}>Selected Hotel:</span>
            <span style={styles.value}>{JSON.stringify(remoteState.selectedHotel)}</span>
          </div>
        )}
        {remoteState.guests !== undefined && (
          <div style={styles.row}>
            <span style={styles.label}>Guests:</span>
            <span style={styles.value}>{remoteState.guests}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '10px auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  header: {
    padding: '12px 16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  icon: {
    fontSize: '18px',
  },
  content: {
    padding: '16px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  label: {
    fontWeight: '600',
    color: '#666',
  },
  value: {
    color: '#333',
    fontFamily: 'monospace',
  },
  error: {
    backgroundColor: '#ffebee',
    borderLeft: '4px solid #f44336',
  },
};

export default StateDebugger;
