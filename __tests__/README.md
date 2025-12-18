# Frontend Integration Tests

## Overview

This directory contains integration tests for the Nova Corrente Dashboard frontend, focusing on API endpoint testing and external service integrations (BACEN, INMET, ANATEL).

## Running Tests

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend server:**
   ```bash
   cd ../backend
   python -m uvicorn app.main:app --reload --port 5000
   ```

### Running All Tests

```bash
npm test
```

### Running Integration Tests Only

```bash
npm run test:integration
```

### Running Tests in Watch Mode

```bash
npm run test:watch
```

### Running Tests with Coverage

```bash
npm run test:coverage
```

## Test Structure

```
__tests__/
├── integration/
│   ├── api.test.ts              # API endpoint tests
│   └── external-services.test.ts # External service integration tests
└── README.md                     # This file
```

## Test Coverage

### API Integration Tests (`api.test.ts`)

Tests for all API endpoints:

- ✅ Health endpoint
- ✅ Temporal features API
- ✅ Climate features API
- ✅ Economic features API
- ✅ 5G features API
- ✅ Lead time features API
- ✅ SLA features API
- ✅ Hierarchical features API
- ✅ Categorical features API
- ✅ Business features API
- ✅ Error handling
- ✅ Response format validation

### External Services Integration Tests (`external-services.test.ts`)

Tests for external service integrations:

- ✅ BACEN economic data integration
- ✅ INMET climate data integration
- ✅ ANATEL 5G data integration
- ✅ Error handling for external services
- ✅ Data format validation
- ✅ Rate limiting and performance

## Test Configuration

Tests are configured in `jest.config.js` and use:

- **Jest** for test runner
- **Testing Library** for React component testing
- **jest-environment-jsdom** for DOM simulation
- **Next.js Jest configuration** for Next.js-specific setup

## Writing New Tests

### Example Test

```typescript
import { describe, it, expect } from '@jest/globals';

describe('My Feature', () => {
  it('should do something', async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/features/my-feature`);
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.status).toBe('success');
  });
});
```

## Best Practices

1. **Always check if backend is running** before running integration tests
2. **Use descriptive test names** that explain what is being tested
3. **Handle errors gracefully** - tests should not fail if backend is offline
4. **Validate response formats** - ensure API responses match expected structure
5. **Test error cases** - verify proper error handling for invalid inputs
6. **Use async/await** for API calls in tests
7. **Clean up resources** in `afterAll` if needed

## Troubleshooting

### Tests Fail: "Backend server is not running"

**Solution:** Start the backend server:
```bash
cd ../backend
python -m uvicorn app.main:app --reload --port 5000
```

### Tests Fail: "Cannot find module '@jest/globals'"

**Solution:** Install Jest dependencies:
```bash
npm install --save-dev jest @types/jest jest-environment-jsdom
```

### Tests Fail: Network errors

**Solution:** 
1. Check if backend is running on `http://localhost:5000`
2. Verify CORS settings in backend
3. Check network connectivity

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run integration tests
  run: |
    npm install
    npm run test:integration
```

## Contributing

When adding new API endpoints or external service integrations:

1. Add tests in `integration/api.test.ts` or `integration/external-services.test.ts`
2. Follow existing test patterns
3. Ensure tests handle both success and error cases
4. Update this README if adding new test categories

---

**Status**: ✅ Integration Test Suite Complete
**Last Updated**: November 2025









