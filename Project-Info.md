# Micro Frontend Travel Planner - Developer Guide

A Module Federation based microfrontend architecture with React, featuring four independent applications that share state and components.

## 🏗️ Architecture Overview

This project consists of 4 microfrontend applications:

- **home-app** (Port 3000) - Host application with search widget and state management
- **car-app** (Port 3001) - Car rental module exposing components and Zustand store
- **cruise-app** (Port 3002) - Cruise booking module exposing components and Zustand store
- **hotel-app** (Port 3003) - Hotel booking module exposing components and Zustand store

### Technology Stack

- **React 19.2.3** - UI framework
- **Webpack 5 Module Federation** - Microfrontend architecture
- **Zustand 5.x** - State management
- **Webpack Dev Server** - Development server
- **Nginx** - Production serving
- **Docker** - Containerization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   cd c:\Pan-temp\MicroFrontEnd
   ```

2. **Install dependencies for all apps**
   ```bash
   # Home App
   cd home-app
   npm install

   # Car App
   cd ../car-app
   npm install

   # Cruise App
   cd ../cruise-app
   npm install

   # Hotel App
   cd ../hotel-app
   npm install
   ```

### Development Mode

Start all applications in separate terminals:

```bash
# Terminal 1 - Home App (Host)
cd home-app
npm start
# Running on http://localhost:3000

# Terminal 2 - Car App (Remote)
cd car-app
npm start
# Running on http://localhost:3001

# Terminal 3 - Cruise App (Remote)
cd cruise-app
npm start
# Running on http://localhost:3002

# Terminal 4 - Hotel App (Remote)
cd hotel-app
npm start
# Running on http://localhost:3003
```

**Access the application:**
- Open http://localhost:3000 in your browser
- The home app will dynamically load remote components from the other apps
- If a remote app is offline, the UI gracefully shows an offline message with retry option

## 📦 Dependencies

### Core Dependencies (All Apps)
```bash
npm install react@^19.2.3 react-dom@^19.2.3 zustand@^5.0.10 prop-types@^15.8.1
```

### Dev Dependencies (All Apps)
```bash
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader html-webpack-plugin webpack webpack-cli webpack-dev-server @testing-library/jest-dom @testing-library/react @testing-library/user-event
```

### Additional for CSS Support (cruise-app, hotel-app)
```bash
npm install --save-dev style-loader css-loader
```

## 🔧 Configuration

### Module Federation Setup

Each app uses Webpack Module Federation:

**Remote Apps (car, cruise, hotel):**
- Expose components via `./MyText` and other components
- Expose Zustand stores via `./store`
- Share React and ReactDOM as singletons

**Host App (home):**
- Consumes remotes with dynamic promise-based loading
- Implements graceful degradation when remotes are offline
- Uses retry mechanism for failed remote loads

### Webpack Configuration

Each app has a `webpack.config.js` with:
- Development mode: Hot reload with dev server
- Production mode: Optimized builds with content hashing
- Environment-based publicPath configuration
- CORS headers for Module Federation

### Port Configuration

| Application | Port | URL |
|------------|------|-----|
| home-app   | 3000 | http://localhost:3000 |
| car-app    | 3001 | http://localhost:3001 |
| cruise-app | 3002 | http://localhost:3002 |
| hotel-app  | 3003 | http://localhost:3003 |

## 🎯 Features

### State Management with Zustand

All apps have isolated Zustand stores that are exposed via Module Federation:

**car-app/src/state/carStore.js:**
- `searchQuery`, `selectedCar`, `cars[]`
- Actions: `setSearchQuery`, `setSelectedCar`, `setCars`

**cruise-app/src/state/cruiseStore.js:**
- `searchQuery`, `selectedCruise`, `cruises[]`, `dateRange`
- Actions: `setSearchQuery`, `setSelectedCruise`, `setCruises`

**hotel-app/src/state/zustandStore.js:**
- `searchQuery`, `selectedHotel`, `hotels[]`, `checkIn`, `checkOut`, `guests`
- Actions: `setSearchQuery`, `setSelectedHotel`, `setHotels`

### Cross-App State Access

The home-app can access remote stores using:

```javascript
import { useRemoteStore } from './hooks/useRemoteStore';

function MyComponent() {
  const { state, isLoading, error } = useRemoteStore('car');
  // state contains the car-app's Zustand store state
}
```

### Search Widget

The home-app features a tabbed search interface:
- 3 tabs: Car, Cruise, Hotel
- Each tab has custom styling and icons
- Search queries sync with remote app stores
- Real-time state visualization via StateDebugger

## 🐳 Docker Deployment

### Build Individual App

```bash
cd home-app
docker build -t home-app .
docker run -p 3000:3000 home-app
```

### Build All Apps with Docker Compose

```bash
# From root directory
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop all containers
docker-compose down
```

### Docker Configuration

Each app has:
- **Dockerfile** - Multi-stage build (Node.js build → Nginx serve)
- **nginx.conf** - Nginx configuration with CORS headers
- **.dockerignore** - Excludes unnecessary files from build

## 🧪 Testing

Run tests for any app:

```bash
cd <app-name>
npm test
```

## 🛠️ Development Guidelines

### Adding New Components

1. Create component in `src/components/`
2. Component will be auto-exposed via Module Federation (getExposes function)
3. Access from home-app using dynamic imports

### Adding New State

1. Add state to the app's Zustand store
2. Store is already exposed via `./store` in webpack config
3. Access from home-app using `useRemoteStore` hook

### Troubleshooting

**Remote app showing offline:**
- Ensure the remote app is running on the correct port
- Check browser console for CORS errors
- Verify webpack dev server started successfully

**Module Federation errors:**
- Clear browser cache and restart dev servers
- Check that shared dependencies (React, ReactDOM) versions match
- Verify publicPath is correctly set in webpack.config.js

**State not syncing:**
- Check that the store is properly exposed in webpack config
- Verify the store path matches in both expose and import
- Check browser console for dynamic import errors

## 📝 Project Structure

```
MicroFrontEnd/
├── home-app/              # Host application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Search/    # Search widget with tabs
│   │   │   └── StateDebugger.js
│   │   ├── state/         # Zustand store & state bridge
│   │   ├── hooks/         # Custom hooks (useRemoteStore)
│   │   └── index.js       # Entry point with error boundaries
│   ├── webpack.config.js  # Module Federation host config
│   ├── Dockerfile         # Docker configuration
│   └── nginx.conf         # Nginx configuration
│
├── car-app/               # Car rental remote
│   ├── src/
│   │   ├── components/    # Exposed components
│   │   ├── state/         # carStore.js
│   │   └── index.js
│   └── webpack.config.js  # Module Federation remote config
│
├── cruise-app/            # Cruise booking remote
│   ├── src/
│   │   ├── components/    # Exposed components
│   │   ├── state/         # cruiseStore.js
│   │   └── index.js
│   └── webpack.config.js  # Module Federation remote config
│
├── hotel-app/             # Hotel booking remote
│   ├── src/
│   │   ├── components/    # Exposed components
│   │   ├── state/         # zustandStore.js
│   │   └── index.js
│   └── webpack.config.js  # Module Federation remote config
│
└── docker-compose.yml     # Orchestrate all apps
```

## 🚦 Build Commands

### Development
```bash
npm start              # Start dev server with hot reload
```

### Production
```bash
npm run build          # Build production bundle
```

### Testing
```bash
npm test               # Run test suite
```

## 📚 Additional Resources

- [Module Federation Documentation](https://webpack.js.org/concepts/module-federation/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React 19 Documentation](https://react.dev/)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test across all apps
4. Submit pull request

## 📄 License

Private project - All rights reserved

