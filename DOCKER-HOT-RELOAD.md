# Docker Hot Reload Guide

## Development with Hot Reload

For development with live code updates (hot reload), use the development Docker Compose configuration.

### Start Development Environment

```bash
# From the root MicroFrontEnd directory
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d --build
```

### How Hot Reload Works

The development setup uses:

1. **Volume Mounts** - Your local source code is mounted into the containers
   - `./home-app/src` → `/app/src` in container
   - `./home-app/public` → `/app/public` in container
   - Changes to local files are immediately reflected in the container

2. **Webpack Dev Server** - Runs inside the container with file watching
   - Uses polling for file changes (required for Docker on Windows/Mac)
   - Live reload enabled
   - Hot Module Replacement available

3. **Host Binding** - Dev server listens on `0.0.0.0` to accept external connections

### Making Code Changes

When you edit files locally:

1. **Edit any file** in `src/` or `public/` directories
   ```
   # Example: Edit home-app/src/components/Search/SearchWidget.js
   ```

2. **Webpack detects the change** automatically via polling

3. **Browser reloads** automatically with new changes

### View Logs

```bash
# View logs for all services
docker-compose -f docker-compose.dev.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs -f home-app
docker-compose -f docker-compose.dev.yml logs -f car-app
```

### Stop Development Environment

```bash
# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v
```

### Rebuild After Dependency Changes

If you add/remove npm packages, rebuild the containers:

```bash
# Rebuild specific service
docker-compose -f docker-compose.dev.yml up -d --build home-app

# Rebuild all services
docker-compose -f docker-compose.dev.yml up -d --build
```

### Access Applications

- Home App: http://localhost:3000
- Car App: http://localhost:3001
- Cruise App: http://localhost:3002
- Hotel App: http://localhost:3003

## Production Build (No Hot Reload)

For production deployments without hot reload:

```bash
# Use the production docker-compose
docker-compose up --build

# This uses Dockerfile (not Dockerfile.dev)
# Builds static files and serves with Nginx
```

## File Structure

```
MicroFrontEnd/
├── docker-compose.yml       # Production (Nginx)
├── docker-compose.dev.yml   # Development (Hot Reload)
├── home-app/
│   ├── Dockerfile           # Production build
│   ├── Dockerfile.dev       # Development with hot reload
│   └── src/                 # Auto-reloads on changes
├── car-app/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── src/
├── cruise-app/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── src/
└── hotel-app/
    ├── Dockerfile
    ├── Dockerfile.dev
    └── src/
```

## Troubleshooting Hot Reload

**Changes not reflecting:**
1. Check if webpack is detecting changes in logs
2. Ensure volume mounts are correct
3. Try hard refresh in browser (Ctrl+Shift+R)

**File watching not working:**
- The config uses `usePolling: true` for Docker compatibility
- This works on Windows, Mac, and Linux

**Port conflicts:**
- Ensure ports 3000-3003 are not in use locally
- Stop local dev servers before starting Docker

**Performance on Windows/Mac:**
- File watching with polling can be slower
- Consider running locally without Docker for faster development

## Best Practices

1. **Use Dev Mode for Development**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Use Prod Mode for Testing**
   ```bash
   docker-compose up --build
   ```

3. **Edit Code Locally** - Changes sync automatically via volumes

4. **Rebuild After Package Changes** - Only needed when modifying package.json

5. **Monitor Logs** - Keep logs visible to see compilation status
