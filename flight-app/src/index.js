import React from 'react';
import { createRoot } from 'react-dom/client';
import { useFlightStore } from './state/flightStore';
import MyText from './components/MyText';

const App = () => {
  const { searchQuery, flights, passengers, tripType, cabinClass } = useFlightStore();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>✈️ Flight App</h1>
      <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
        Note: Flights are available as bundles with Car, Hotel, or Cruise bookings
      </p>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '16px', 
        borderRadius: '8px',
        marginTop: '16px' 
      }}>
        <h3>Current State:</h3>
        <ul>
          <li><strong>Search Query:</strong> {searchQuery || '(none)'}</li>
          <li><strong>Flights Found:</strong> {flights.length}</li>
          <li><strong>Passengers:</strong> {passengers}</li>
          <li><strong>Trip Type:</strong> {tripType}</li>
          <li><strong>Cabin Class:</strong> {cabinClass}</li>
        </ul>
      </div>

      <MyText text="Flight module loaded successfully!" />
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
