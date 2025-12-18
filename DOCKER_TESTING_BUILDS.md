# 🐳 Docker Testing Builds - Keep Active Testing

This guide explains how to use the Docker setup for **active testing builds** that keep containers running for continuous testing, especially for the 5G feature testing.

## 🎯 Overview

The Dockerfile now supports multiple build targets:
- **`testing`** - Active testing builds that keep containers running
- **`builder`** - Production build stage
- **`runner`** - Production runtime stage

## 🚀 Quick Start

### Option 1: Using Helper Scripts (Easiest)

```bash
# Linux/Mac - Start active testing build with watch mode (default)
./scripts/docker-testing-build.sh

# Linux/Mac - Start with 5G tests in watch mode
./scripts/docker-testing-build.sh 5g:watch

# Linux/Mac - Start with 5G tests (single run)
./scripts/docker-testing-build.sh 5g

# Windows - Start active testing build
scripts\docker-testing-build.bat

# Windows - Start with 5G tests in watch mode
scripts\docker-testing-build.bat 5g:watch
```

### Option 2: Using docker-compose (Recommended)

```bash
# Start active testing build with watch mode (default)
docker-compose -f docker-compose.testing.yml up --build

# Start with 5G tests in watch mode
TEST_MODE=5g:watch docker-compose -f docker-compose.testing.yml up --build

# Start with 5G tests (single run)
TEST_MODE=5g docker-compose -f docker-compose.testing.yml up --build

# Start with validation tests
TEST_MODE=validation docker-compose -f docker-compose.testing.yml up --build

# Start dev server
TEST_MODE=dev docker-compose -f docker-compose.testing.yml up --build
```

### Option 2: Using Docker directly

```bash
# Build testing image
docker build --target testing -t frontend-testing ./frontend

# Run with watch mode (keeps active)
docker run -it --rm \
  -p 3003:3003 \
  -v $(pwd)/frontend/src:/app/src:ro \
  -v $(pwd)/frontend/__tests__:/app/__tests__:ro \
  frontend-testing

# Run with 5G tests in watch mode
docker run -it --rm \
  -p 3003:3003 \
  -e TEST_MODE=5g:watch \
  -v $(pwd)/frontend/src:/app/src:ro \
  -v $(pwd)/frontend/__tests__:/app/__tests__:ro \
  frontend-testing

# Run with 5G tests (single run)
docker run -it --rm \
  -e TEST_MODE=5g \
  -v $(pwd)/frontend/src:/app/src:ro \
  -v $(pwd)/frontend/__tests__:/app/__tests__:ro \
  frontend-testing
```

## 📋 Test Modes

The `TEST_MODE` environment variable controls what runs in the container:

| Mode | Description | Command |
|------|-------------|---------|
| `watch` (default) | Watch all tests continuously | `npm run test:watch` |
| `5g` | Run 5G tests once | `npm run test:5g` |
| `5g:watch` | Watch 5G tests continuously | `npm run test:5g:watch` |
| `validation` | Run validation tests | `npm run test:validation` |
| `dev` | Start Next.js dev server | `npm run dev` |
| `all` | Run all tests once | `npm test` |

## 🔧 Features

### ✅ Active Testing Builds
- Containers stay running for continuous testing
- Supports watch mode for automatic test re-runs
- Health checks ensure container is responsive

### ✅ Volume Mounting
- Source code mounted for hot reload
- Test files mounted for live updates
- Configuration files mounted for changes

### ✅ Multiple Test Modes
- Flexible test execution modes
- Support for 5G feature testing
- Validation and integration tests

### ✅ Development Server
- Can run Next.js dev server in container
- Port 3003 exposed for development
- Hot module replacement supported

## 📝 Usage Examples

### Continuous 5G Testing

```bash
# Start container with 5G tests in watch mode
TEST_MODE=5g:watch docker-compose -f docker-compose.testing.yml up

# Tests will automatically re-run when files change
# Container stays active and responsive
```

### Development with Testing

```bash
# Start dev server in container
TEST_MODE=dev docker-compose -f docker-compose.testing.yml up

# Access at http://localhost:3003
# Changes trigger hot reload
```

### CI/CD Integration

```bash
# Run tests once for CI
docker build --target testing -t frontend-testing ./frontend
docker run --rm -e TEST_MODE=5g frontend-testing

# Or run all tests
docker run --rm -e TEST_MODE=all frontend-testing
```

## 🏗️ Build Targets

### Testing Target
```dockerfile
FROM base AS testing
# Keeps container active for continuous testing
# Supports multiple test modes via TEST_MODE env var
```

### Production Target
```dockerfile
FROM base AS builder
# Builds production Next.js app
# Then runs in minimal runner stage
```

## 🔍 Health Checks

The testing build includes health checks:
- Checks every 30 seconds
- Timeout of 10 seconds
- 40 second start period
- 3 retries before marking unhealthy

## 📦 Volume Mounts

For active development, these volumes are mounted:
- `./frontend/src` → `/app/src` (source code)
- `./frontend/__tests__` → `/app/__tests__` (tests)
- `./frontend/scripts` → `/app/scripts` (scripts)
- Configuration files (package.json, jest.config.js, etc.)

## 🎯 Best Practices

1. **Use watch mode for active development**
   ```bash
   TEST_MODE=5g:watch docker-compose -f docker-compose.testing.yml up
   ```

2. **Use single-run for CI/CD**
   ```bash
   TEST_MODE=5g docker-compose -f docker-compose.testing.yml up
   ```

3. **Keep volumes mounted for live updates**
   - Changes to source files trigger test re-runs
   - No need to rebuild container

4. **Use health checks to monitor status**
   ```bash
   docker ps  # Check container status
   docker inspect --format='{{.State.Health.Status}}' <container>
   ```

## 🐛 Troubleshooting

### Container exits immediately
- Check logs: `docker-compose -f docker-compose.testing.yml logs`
- Ensure TEST_MODE is set correctly
- Verify volumes are mounted properly

### Tests not running
- Check TEST_MODE environment variable
- Verify test files are in mounted volumes
- Check container logs for errors

### Port conflicts
- Change port mapping in docker-compose.testing.yml
- Ensure port 3003 is available

## 📚 Related Documentation

- [5G Testing Guide](./docs/5G_TESTING_GUIDE.md)
- [5G Quick Reference](./5G_QUICK_REFERENCE.md)
- [Testing Summary](./5G_TESTING_SUMMARY.md)

---

**Happy Testing! 🧪✨**

