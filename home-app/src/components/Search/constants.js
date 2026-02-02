// Search Widget Constants

// Tab configuration for the main search tabs (Car, Cruise, Hotel, Bundle)
export const TAB_CONFIG = [
  {
    id: 'car',
    name: 'Car',
    icon: '🚗',
    placeholder: 'Search for cars...',
    color: '#3498db',
  },
  {
    id: 'cruise',
    name: 'Cruise',
    icon: '🚢',
    placeholder: 'Search for cruises...',
    color: '#9b59b6',
  },
  {
    id: 'hotel',
    name: 'Hotel',
    icon: '🏨',
    placeholder: 'Search for hotels...',
    color: '#e74c3c',
  },
  {
    id: 'bundle',
    name: 'Bundle',
    icon: '📦',
    placeholder: 'Search across selected services...',
    color: '#f39c12',
    isBundle: true, // Special tab that shows checkboxes
  },
];

// Service configuration for bundle checkbox selection (inside Bundle tab)
export const BUNDLE_SERVICES = [
  {
    id: 'car',
    name: 'Car',
    icon: '🚗',
    placeholder: 'Search for cars...',
    color: '#3498db',
    isAddon: false,
  },
  {
    id: 'hotel',
    name: 'Hotel',
    icon: '🏨',
    placeholder: 'Search for hotels...',
    color: '#e74c3c',
    isAddon: false,
  },
  {
    id: 'cruise',
    name: 'Cruise',
    icon: '🚢',
    placeholder: 'Search for cruises...',
    color: '#9b59b6',
    isAddon: false,
  },
  {
    id: 'flight',
    name: 'Flight',
    icon: '✈️',
    placeholder: 'Search for flights...',
    color: '#27ae60',
    isAddon: true, // Requires at least one non-addon service to be selected
  },
];

// Legacy alias for backward compatibility
export const SERVICE_CONFIG = BUNDLE_SERVICES;

export const SEARCH_WIDGET_STYLES = {
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  widget: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
};

// Checkbox styles for service selection
export const CHECKBOX_STYLES = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#fafafa',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: '#fff',
    userSelect: 'none',
  },
  checkboxLabelChecked: {
    borderColor: '#3498db',
    backgroundColor: '#ebf5fb',
  },
  checkboxLabelDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: '#f5f5f5',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  icon: {
    fontSize: '20px',
  },
  serviceName: {
    fontWeight: '500',
    fontSize: '14px',
  },
  addonBadge: {
    fontSize: '10px',
    backgroundColor: '#f39c12',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '4px',
  },
  tooltip: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '8px',
    fontStyle: 'italic',
  },
};
