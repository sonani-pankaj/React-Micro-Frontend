# Adding New Apps to Module Federation

This guide explains how to create and integrate a new micro frontend application into the existing Module Federation architecture.

## 📋 Overview

The architecture consists of:

- **Host App (home-app)** - Port 3000 - Orchestrates and consumes remote apps
- **Remote Apps** - Expose components and stores for the host to consume

When adding a new app, you will:+

1. Create the new app folder structure
2. Configure webpack for Module Federation
3. Register the remote in the host app
4. Add Docker configuration
5. Update supporting files

---

## 🚀 Step-by-Step Guide: Creating `demo-app`

### Step 1: Create Folder Structure

Create the following folder structure for `demo-app` (Port 3005):

```d
demo-app/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   └── MyText.js
│   ├── state/
│   │   └── demoStore.js
│   └── index.js
├── Dockerfile
├── Dockerfile.dev
├── nginx.conf
├── package.json
├── webpack.config.js
└── README.md
```

### Step 2: Create `package.json`

```json
{
  "name": "demo-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/dom": "^10.4.1",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-scripts": "^0.0.0",
    "web-vitals": "^2.1.4",
    "zustand": "^5.0.10"
  },
  "scripts": {
    "start": "webpack serve --config webpack.config.js",
    "build": "webpack --mode production --config webpack.config.js",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@babel/core": "^7.28.6",
    "@babel/preset-env": "^7.28.6",
    "@babel/preset-react": "^7.28.5",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "babel-loader": "^10.0.0",
    "html-webpack-plugin": "^5.6.6",
    "webpack": "^5.104.1",
    "webpack-cli": "^6.0.1",
    "webpack-dev-server": "^5.2.3"
  }
}
```

### Step 3: Create `webpack.config.js`

⚠️ **Important Configuration Points:**

- `name`: Must be camelCase (e.g., `demoApp`) - this becomes `window.demoApp`
- `filename`: Always `remoteEntry.js`
- `port`: Use next available port (3005 for demo-app)

```javascript
const fs = require('fs');
const path = require('path');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Function to automatically generate the exposes
const getExposes = () => {
  const componentsDir = path.resolve(__dirname, 'src/components');  
  const exposes = {
    './store': './src/state/demoStore.js',
  };
  
  if (fs.existsSync(componentsDir)) {
    fs.readdirSync(componentsDir).forEach(file => {
      const componentsName = `./${path.basename(file, '.js')}`;
      exposes[componentsName] = `./src/components/${file}`;
    });
  }
  
  return exposes;
};

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/index.js',
  mode: isProduction ? 'production' : 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: isProduction ? '/' : 'http://localhost:3005/',
    filename: isProduction ? '[name].[contenthash].js' : '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devServer: {
    port: 3005,  // <-- UNIQUE PORT FOR THIS APP
    host: '0.0.0.0',
    allowedHosts: 'all',
    historyApiFallback: true,
    hot: false,
    liveReload: true,
    client: {
      overlay: false,
      logging: 'warn',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    watchFiles: {
      paths: ['src/**/*', 'public/**/*'],
      options: {
        usePolling: true,
        interval: 300,
      },
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'demoApp',  // <-- CAMELCASE NAME (becomes window.demoApp)
      filename: 'remoteEntry.js',
      exposes: getExposes(),
      remotes: {
        homeApp: 'homeApp@http://localhost:3000/remoteEntry.js'
      },
      shared: { 
        react: { 
          singleton: true,
          eager: true,
          requiredVersion: '^19.0.0',
        }, 
        'react-dom': { 
          singleton: true,
          eager: true,
          requiredVersion: '^19.0.0',
        } 
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
```

### Step 4: Create Zustand Store

**`src/state/demoStore.js`**

```javascript
import { create } from 'zustand';

/**
 * Shared Store for Demo App
 * This store can be consumed by home-app
 */
export const useDemoStore = create((set, get) => ({
  // Demo search state
  searchQuery: '',
  selectedDemo: null,
  demos: [],
  
  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSelectedDemo: (demo) => set({ selectedDemo: demo }),
  
  setDemos: (demos) => set({ demos }),
  
  // Clear state
  clearDemoState: () => set({ 
    searchQuery: '', 
    selectedDemo: null, 
    demos: [] 
  }),
  
  // Get current state
  getDemoState: () => ({
    searchQuery: get().searchQuery,
    selectedDemo: get().selectedDemo,
    demos: get().demos,
  }),
}));
```

### Step 5: Create Component

**`src/components/MyText.js`**

```javascript
import React from "react";

export default function MyText() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
      <h2>🎯 Demo App</h2>
      <p><b>Hello</b> From Demo App!</p>
    </div>
  );
}
```

### Step 6: Create Entry Point

**`src/index.js`**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import MyText from './components/MyText';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MyText />
  </React.StrictMode>
);
```

### Step 7: Create Public Files

**`public/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />    
    <meta name="viewport" content="width=device-width, initial-scale=1" />  
    <meta name="description" content="Demo App - Micro Frontend" />   
    <title>React Micro Frontend Demo Page</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

**`public/manifest.json`**

```json
{
  "short_name": "Demo App",
  "name": "Demo Micro Frontend App",
  "icons": [],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

### Step 8: Create Docker Files

**`Dockerfile`** (Production)

```dockerfile
# Multi-stage build for demo-app
# Stage 1: Build the application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3005
EXPOSE 3005

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**`Dockerfile.dev`** (Development with hot reload)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3005

# Start development server
CMD ["npm", "start"]
```

**`nginx.conf`**

```nginx
server {
    listen 3005;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # CORS headers for Module Federation
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML files
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

---

## 🔗 Step 9: Register in Host App (home-app)

### 9.1 Update `home-app/webpack.config.js`

Add the new remote in the `remotes` object:

```javascript
remotes: {
  // ... existing remotes ...
  'demo-app': `promise new Promise(resolve => {
    const remoteUrl = 'http://localhost:3005/remoteEntry.js';
    const script = document.createElement('script');
    script.src = remoteUrl;
    script.onload = () => {
      resolve({
        get: (request) => window.demoApp.get(request),
        init: (arg) => { try { return window.demoApp.init(arg); } catch(e) { console.log('demo-app already initialized'); } }
      });
    };
    script.onerror = () => {
      resolve({
        get: () => Promise.resolve(() => ({ default: () => null })),
        init: () => {}
      });
    };
    document.head.appendChild(script);
  })`
},
```

### 9.2 Update `home-app/src/state/stateBridge.js`

Add the store loader:

```javascript
// Add at top with other store references
let demoStoreModule = null;

// Add in the switch statement within loadRemoteStore function
case 'demo':
  if (!demoStoreModule) {
    demoStoreModule = await import('demo-app/store');
  }
  return demoStoreModule.useDemoStore;

// Add in clearRemoteStoreCaches function
demoStoreModule = null;
```

### 9.3 Update `home-app/src/index.js`

Add the remote URL and container configuration:

```javascript
// In REMOTE_URL_BASE object
const REMOTE_URL_BASE = {
  // ... existing entries ...
  demo: 'http://localhost:3005/remoteEntry.js',
};

// In REMOTE_CONTAINERS object
const REMOTE_CONTAINERS = {
  // ... existing entries ...
  demo: 'demoApp',
};

// In REMOTE_COMPONENTS object (if used)
const REMOTE_COMPONENTS = {
  // ... existing entries ...
  demo: { name: 'Demo', remoteName: 'demo-app', module: './MyText' },
};
```

### 9.4 Update `home-app/src/hooks/useServiceAvailability.js`

Add the new app URL:

```javascript
const REMOTE_URL_BASE = {
  // ... existing entries ...
  demo: 'http://localhost:3005/remoteEntry.js',
};
```

---

## 🐳 Step 10: Update Docker Compose Files

### `docker-compose.yml`

```yaml
demo-app:
  build:
    context: ./demo-app
    dockerfile: Dockerfile
  ports:
    - "3005:3005"
  environment:
    - NODE_ENV=production
  networks:
    - microfrontend-network
```

Also add `demo-app` to home-app's `depends_on` list.

### `docker-compose.dev.yml`

```yaml
demo-app:
  build:
    context: ./demo-app
    dockerfile: Dockerfile.dev
  ports:
    - "3005:3005"
  volumes:
    - ./demo-app/src:/app/src
    - ./demo-app/public:/app/public
  environment:
    - NODE_ENV=development
    - CHOKIDAR_USEPOLLING=true
    - WATCHPACK_POLLING=true
  networks:
    - microfrontend-network
```

---

## 📝 Step 11: Update Dependencies File

Add the new app to `dependencies.json` in the root:

```json
{
  "appVersions": {
    // ... existing apps ...
    "demo-app": "0.1.0"
  },
  "usageByApp": {
    // ... existing apps ...
    "demo-app": {
      "dependencies": [...],
      "devDependencies": [...]
    }
  }
}
```

---

## ✅ Verification Checklist

After creating the new app, verify:

- [ ] `npm install` succeeds in demo-app folder
- [ ] `npm start` starts dev server on port 3005
- [ ] Visit `http://localhost:3005` - shows standalone app
- [ ] Visit `http://localhost:3005/remoteEntry.js` - returns JS bundle
- [ ] Home app loads demo-app component without errors
- [ ] State bridge can access demo store
- [ ] Docker build succeeds
- [ ] Docker compose includes demo-app

---

## 🔢 Port Reference

| Application | Port | Container Name |
|-------------|------|----------------|
| home-app    | 3000 | homeApp        |
| car-app     | 3001 | carApp         |
| cruise-app  | 3002 | cruiseApp      |
| hotel-app   | 3003 | hotelApp       |
| flight-app  | 3004 | flightApp      |
| demo-app    | 3005 | demoApp        |

---

## ⚠️ Common Pitfalls

1. **Container name mismatch**: Ensure `window.demoApp` in host matches `name: 'demoApp'` in webpack config
2. **Port conflicts**: Each app must have a unique port
3. **CORS errors**: Ensure nginx.conf has CORS headers
4. **Singleton React**: Always use `singleton: true` for React/ReactDOM in shared config
5. **Store export name**: Match store hook name (`useDemoStore`) in stateBridge import

---

## 📚 Quick Command Reference

```bash
# Create new app
mkdir demo-app && cd demo-app

# Initialize and install
npm install

# Start development
npm start

# Build for production
npm run build

# Docker build
docker build -t demo-app .

# Run with Docker
docker run -p 3005:3005 demo-app

# Full stack with Docker Compose
docker-compose up --build
```
