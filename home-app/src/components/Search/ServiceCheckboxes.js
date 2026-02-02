import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { BUNDLE_SERVICES, CHECKBOX_STYLES } from './constants';

/**
 * ServiceCheckboxes Component
 * Allows multi-select of services with Flight bundle validation
 * Flight is only selectable when at least one other service is selected
 * Services that are unavailable (offline) are grayed out and disabled
 */
const ServiceCheckboxes = ({ selectedServices, onSelectionChange, unavailableServices = new Set() }) => {
  // Check if Flight can be selected (requires at least one non-addon service)
  const canSelectFlight = useCallback(() => {
    const nonAddonServices = BUNDLE_SERVICES.filter(s => !s.isAddon).map(s => s.id);
    return nonAddonServices.some(serviceId => selectedServices.has(serviceId));
  }, [selectedServices]);

  const handleToggle = useCallback((serviceId) => {
    const service = BUNDLE_SERVICES.find(s => s.id === serviceId);
    const newSelected = new Set(selectedServices);

    // Don't allow toggling unavailable services
    if (unavailableServices.has(serviceId)) {
      return;
    }

    if (newSelected.has(serviceId)) {
      // Deselecting a service
      newSelected.delete(serviceId);

      // If this was a non-addon service, check if Flight needs to be removed
      if (!service.isAddon) {
        const remainingNonAddon = BUNDLE_SERVICES
          .filter(s => !s.isAddon)
          .some(s => newSelected.has(s.id));
        
        if (!remainingNonAddon && newSelected.has('flight')) {
          newSelected.delete('flight');
        }
      }
    } else {
      // Selecting a service
      // Block flight selection if no other service is selected
      if (service.isAddon && !canSelectFlight()) {
        return;
      }
      newSelected.add(serviceId);
    }

    onSelectionChange(newSelected);
  }, [selectedServices, onSelectionChange, canSelectFlight, unavailableServices]);

  const getCheckboxStyle = (service) => {
    const isSelected = selectedServices.has(service.id);
    const isFlightDisabled = service.isAddon && !canSelectFlight();
    const isUnavailable = unavailableServices.has(service.id);
    const isDisabled = isFlightDisabled || isUnavailable;

    return {
      ...CHECKBOX_STYLES.checkboxLabel,
      ...(isSelected ? { 
        ...CHECKBOX_STYLES.checkboxLabelChecked,
        borderColor: service.color,
        backgroundColor: `${service.color}15`,
      } : {}),
      ...(isDisabled ? CHECKBOX_STYLES.checkboxLabelDisabled : {}),
      ...(isUnavailable ? {
        textDecoration: 'line-through',
        opacity: 0.4,
      } : {}),
    };
  };

  const flightDisabled = !canSelectFlight();

  // Get title/tooltip for a service
  const getServiceTitle = (service, isDisabled, isUnavailable) => {
    if (isUnavailable) {
      return `${service.name} service is currently unavailable`;
    }
    if (isDisabled) {
      return 'Select Car, Hotel, or Cruise to add Flight';
    }
    return `Select ${service.name}`;
  };

  return (
    <div>
      <div style={CHECKBOX_STYLES.container}>
        {BUNDLE_SERVICES.map((service) => {
          const isSelected = selectedServices.has(service.id);
          const isFlightDisabled = service.isAddon && flightDisabled;
          const isUnavailable = unavailableServices.has(service.id);
          const isDisabled = isFlightDisabled || isUnavailable;

          return (
            <label
              key={service.id}
              style={getCheckboxStyle(service)}
              title={getServiceTitle(service, isFlightDisabled, isUnavailable)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(service.id)}
                disabled={isDisabled}
                style={CHECKBOX_STYLES.checkbox}
              />
              <span style={CHECKBOX_STYLES.icon}>{service.icon}</span>
              <span style={CHECKBOX_STYLES.serviceName}>
                {service.name}
                {isUnavailable && ' (Offline)'}
              </span>
              {service.isAddon && (
                <span style={CHECKBOX_STYLES.addonBadge}>+ Flight</span>
              )}
            </label>
          );
        })}
      </div>
      {flightDisabled && !unavailableServices.has('flight') && (
        <div style={CHECKBOX_STYLES.tooltip}>
          ✈️ Flight is available as a bundle — select Car, Hotel, or Cruise first
        </div>
      )}
      {unavailableServices.size > 0 && (
        <div style={{ ...CHECKBOX_STYLES.tooltip, color: '#e74c3c' }}>
          ⚠️ Some services are currently offline
        </div>
      )}
    </div>
  );
};

ServiceCheckboxes.propTypes = {
  selectedServices: PropTypes.instanceOf(Set).isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  unavailableServices: PropTypes.instanceOf(Set),
};

export default ServiceCheckboxes;
