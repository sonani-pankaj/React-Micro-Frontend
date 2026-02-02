import React, {Suspense, useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import SearchWidget from './components/Search';
import StateDebugger from './components/StateDebugger';
import { useHomeStore } from './state/homeStore';
import { useRemoteStore, useSyncSearchWithRemote } from './hooks/useRemoteStore';

// Initialize webpack share scopes for dynamic federation
if (!window.__webpack_share_scopes__) {
  window.__webpack_share_scopes__ = { default: {} };
}
__webpack_init_sharing__('default');

// Error boundary component for handling failed remote loads
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    // Reset error state when switching to a different app
    if (prevProps.appKey !== this.props.appKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: '#721c24', margin: '0 0 8px 0' }}>{this.props.name} is Not Available</h3>
          <p style={{ color: '#721c24', margin: 0 }}>
            Unable to load this service. Please check if the app is running.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Offline component to show when remote app is unavailable
const OfflineMessage = ({ name, onRetry }) => (
  <div style={{
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    margin: '20px 0'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔌</div>
    <h3 style={{ color: '#856404', margin: '0 0 8px 0' }}>{name} is Offline</h3>
    <p style={{ color: '#856404', margin: '0 0 16px 0' }}>
      This service is currently unavailable.
    </p>
    {onRetry && (
      <button 
        onClick={onRetry}
        style={{
          padding: '10px 24px',
          backgroundColor: '#ffc107',
          color: '#856404',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '14px'
        }}
      >
        🔄 Retry
      </button>
    )}
  </div>
);

// Remote URLs for health check (base URLs without cache-busting)
const REMOTE_URL_BASE = {
  car: 'http://localhost:3001/remoteEntry.js',
  cruise: 'http://localhost:3002/remoteEntry.js',
  hotel: 'http://localhost:3003/remoteEntry.js',
};

// Get URL with cache-busting timestamp
const getRemoteUrl = (appName) => {
  const baseUrl = REMOTE_URL_BASE[appName];
  return `${baseUrl}?t=${Date.now()}`;
};

// Remote container names (as defined in each app's webpack config)
const REMOTE_CONTAINERS = {
  car: 'carApp',
  cruise: 'cruiseApp',
  hotel: 'hotelApp',
};

// Track loaded containers to avoid re-initialization issues
const loadedContainers = new Set();

// Check if remote is available via fetch (with CORS handling)
const checkRemoteAvailability = async (url) => {
  try {
    // Use no-cors mode - we only care if request succeeds, not the response content
    const response = await fetch(url, { 
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

// Load remote container dynamically
const loadRemoteContainer = async (appName, forceRefresh = false) => {
  const containerName = REMOTE_CONTAINERS[appName];
  const baseUrl = REMOTE_URL_BASE[appName];
  // Add cache-busting timestamp to prevent browser caching
  const remoteUrl = `${baseUrl}?t=${Date.now()}`;
  
  // First check if remote is available
  const isAvailable = await checkRemoteAvailability(baseUrl);
  if (!isAvailable) {
    throw new Error('Remote not available');
  }
  
  // If container already exists and is initialized, reuse it (unless force refresh)
  if (!forceRefresh && window[containerName] && loadedContainers.has(appName)) {
    return window[containerName];
  }
  
  // Clear old container reference for fresh load
  if (forceRefresh && window[containerName]) {
    delete window[containerName];
    loadedContainers.delete(appName);
  }
  
  return new Promise((resolve, reject) => {
    // Remove old script if exists
    const oldScripts = document.querySelectorAll(`script[data-remote="${appName}"]`);
    oldScripts.forEach(s => s.remove());
    
    const script = document.createElement('script');
    script.src = remoteUrl;
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-remote', appName);
    
    script.onload = async () => {
      const container = window[containerName];
      if (container) {
        try {
          if (!loadedContainers.has(appName)) {
            await __webpack_init_sharing__('default');
            await container.init(__webpack_share_scopes__.default);
            loadedContainers.add(appName);
          }
          resolve(container);
        } catch (e) {
          // Already initialized is ok
          if (e.message && e.message.includes('already')) {
            loadedContainers.add(appName);
            resolve(container);
          } else {
            reject(e);
          }
        }
      } else {
        reject(new Error('Container not found'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load remote'));
    };
    
    document.head.appendChild(script);
  });
};

// Dynamic Remote Component - loads fresh each time and supports retry
const RemoteComponent = ({ appName, displayName }) => {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    setComponent(null);
    
    const loadRemote = async () => {
      try {
        // Load the remote container fresh
        const container = await loadRemoteContainer(appName);
        
        if (!mounted) return;
        
        // Get the module from container
        const factory = await container.get('./MyText');
        const module = factory();
        
        if (mounted && module && typeof module.default === 'function') {
          setComponent(() => module.default);
          setLoading(false);
        } else {
          throw new Error('Invalid module');
        }
      } catch (err) {
        console.log(`Failed to load ${displayName}:`, err.message);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadRemote();

    return () => { mounted = false; };
  }, [appName, displayName, retryCount]);

  const handleRetry = () => {
    // Remove from loaded set to force re-check availability
    loadedContainers.delete(appName);
    setRetryCount(c => c + 1);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading {displayName}...</div>;
  }

  if (error || !Component) {
    return <OfflineMessage name={displayName} onRetry={handleRetry} />;
  }

  return <Component />;
};

// Map tab IDs to their config
const REMOTE_COMPONENTS = {
  car: { name: 'Car App', color: '#3498db' },
  cruise: { name: 'Cruise App', color: '#9b59b6' },
  hotel: { name: 'Hotel App', color: '#e74c3c' },
  bundle: { name: 'Bundle Builder', color: '#f39c12', isBundle: true },
};

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use home store for state management
  const activeTab = useHomeStore((state) => state.activeTab);
  const setActiveTab = useHomeStore((state) => state.setActiveTab);
  const setCurrentSearch = useHomeStore((state) => state.setCurrentSearch);
  
  // Track tab change to force re-check of remote availability
  const [tabChangeCount, setTabChangeCount] = useState({});
  
  // Get current tab config
  const { name, color, isBundle } = REMOTE_COMPONENTS[activeTab];
  
  // Access remote store state for current active tab (skip for bundle)
  const { state: remoteState, isLoading: storeLoading, error: storeError } = useRemoteStore(isBundle ? null : activeTab);
  
  // Sync search query with remote store (skip for bundle)
  useSyncSearchWithRemote(isBundle ? null : activeTab, searchQuery);

  // Handle search callback
  const handleSearch = ({ type, query, types }) => {
    console.log(`Searching in ${type}: ${query}`, types ? `(services: ${types.join(', ')})` : '');
    setSearchQuery(query);
    setCurrentSearch(type, query);
  };

  // Handle tab change from SearchWidget
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery(''); // Clear search when switching tabs
    // Increment count for this tab to force re-check
    setTabChangeCount(prev => ({
      ...prev,
      [tabId]: (prev[tabId] || 0) + 1
    }));
  };
  
  // Show remote store state in console for debugging
  useEffect(() => {
    if (remoteState) {
      console.log(`${activeTab} store state:`, remoteState);
    }
  }, [remoteState, activeTab]);

  const tabKey = `${activeTab}-${tabChangeCount[activeTab] || 0}`;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        🏠 My Travel Planner Ver-2.1
      </h1>
      
      {/* Search Widget with Tabs */}
      <SearchWidget onSearch={handleSearch} onTabChange={handleTabChange} />
      
      {/* Remote Store State Display - hide for bundle tab */}
      {!isBundle && (
        <StateDebugger 
          remoteState={remoteState}
          appName={name}
          isLoading={storeLoading}
          error={storeError}
        />
      )}
      
      {/* Active Remote App Content */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '30px auto',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '16px 24px', 
          backgroundColor: color,
          color: '#fff',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          {name} {isBundle ? '' : 'Content'}
        </div>
        <div style={{ padding: '24px' }}>
          {searchQuery && (
            <div style={{ 
              marginBottom: '20px', 
              padding: '12px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              color: '#666'
            }}>
              🔍 Searching for: <strong>{searchQuery}</strong>
            </div>
          )}
          {isBundle ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Build Your Own Itinerary</h3>
              <p style={{ margin: 0 }}>
                Select services above (Car, Hotel, Cruise) and add Flight to create your custom travel bundle.
              </p>
              <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#888' }}>
                ✈️ Flight is available only when bundled with another service.
              </p>
            </div>
          ) : (
            <ErrorBoundary name={name} appKey={tabKey} key={tabKey}>
              <RemoteComponent 
                key={tabKey}
                appName={activeTab}
                displayName={name}
              />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);