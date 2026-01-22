# Build and Run Instructions

## Development Mode

### Start all apps locally
```bash
# Terminal 1 - Home App
cd home-app
npm install
npm start

# Terminal 2 - Car App
cd car-app
npm install
npm start

# Terminal 3 - Cruise App
cd cruise-app
npm install
npm start

# Terminal 4 - Hotel App
cd hotel-app
npm install
npm start
```

Access the applications:
- Home App: http://localhost:3000
- Car App: http://localhost:3001
- Cruise App: http://localhost:3002
- Hotel App: http://localhost:3003

## Docker Mode

### Build and run home-app only
```bash
cd home-app
docker build -t home-app .
docker run -p 3000:3000 home-app
```

### Build and run all apps with Docker Compose
```bash
# From the root MicroFrontEnd directory
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# Stop all containers
docker-compose down
```

### Docker Commands

```bash
# View running containers
docker ps

# View logs for a specific service
docker-compose logs -f home-app

# Rebuild a specific service
docker-compose up -d --build home-app

# Remove all containers and images
docker-compose down --rmi all
```

## Production Build

### Build home-app for production
```bash
cd home-app
npm run build
```

The build artifacts will be in the `dist` folder.

## Environment Variables

For production, you may need to configure remote URLs:
- Update the remote URLs in `webpack.config.js` to point to production URLs
- Or use environment variables to configure them dynamically

## Notes

- The Dockerfile uses multi-stage build to optimize the final image size
- Nginx is used to serve the static files in production
- CORS headers are configured in nginx.conf for Module Federation
- The .dockerignore file excludes unnecessary files from the Docker image
