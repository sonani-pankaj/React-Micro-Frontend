# Flight App - Micro Frontend Module

## Overview

Flight booking micro frontend that integrates with the home-app via Module Federation.

**Port:** 3004

**Note:** Flights are only available as bundles with Car, Hotel, or Cruise bookings. This is a business rule enforced in the home-app's ServiceCheckboxes component.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Access at: <http://localhost:3004>

## Exposed Modules

- `./store` - Zustand store with flight state
- `./MyText` - Sample component

## State (flightStore.js)

```d
| Property | Type | Description |
|----------|------|-------------|
| searchQuery | string | Current search query |
| selectedFlight | object | Selected flight details |
| flights | array | Search results |
| departureDate | Date | Departure date |
| returnDate | Date | Return date |
| passengers | number | Number of passengers |
| tripType | string | 'roundtrip' or 'oneway' |
| cabinClass | string | 'economy', 'business', or 'first' |
| bundledWith | string | Service this flight is bundled with |
```

## Docker

```bash
# Build image
docker build -t flight-app .

# Run container
docker run -p 3004:3004 flight-app
```
