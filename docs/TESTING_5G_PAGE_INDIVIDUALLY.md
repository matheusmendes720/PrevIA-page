# Testing the 5G Page Individually

Complete guide on how to test the 5G Features page (`src/app/features/5g/page.tsx`) in isolation.

## 🚀 Quick Start

### Method 1: Using NPM Script (Recommended)

```bash
# Run all tests for the 5G page
npm run test:5g:page

# Run with coverage
npm run test:5g:page -- --coverage

# Run in watch mode (auto-reruns on file changes)
npm run test:5g:watch
```

### Method 2: Using Jest Directly

```bash
# Run the specific test file
npx jest __tests__/components/5g-page.test.tsx

# Run with pattern matching
npx jest --testPathPattern=5g-page

# Run in watch mode
npx jest __tests__/components/5g-page.test.tsx --watch

# Run with verbose output
npx jest __tests__/components/5g-page.test.tsx --verbose

# Run with coverage
npx jest __tests__/components/5g-page.test.tsx --coverage
```

### Method 3: Run Specific Test Cases

```bash
# Run tests matching a specific name pattern
npx jest --testNamePattern="Component Rendering"

# Run a specific test by name
npx jest --testNamePattern="should render the component without crashing"

# Run tests in a specific describe block
npx jest --testNamePattern="Tab Navigation"
```

### Method 4: Using Watch Scripts

```bash
# Linux/Mac
./scripts/watch-5g-tests.sh

# Windows
scripts\watch-5g-tests.bat
```

## 📋 Available Test Commands

From `package.json`:

| Command | Description |
|---------|-------------|
| `npm run test:5g:page` | Run only 5G page tests |
| `npm run test:5g:watch` | Watch mode for all 5G tests |
| `npm run test:5g` | Run all 5G-related tests with coverage |
| `npm run test:5g:chart` | Run only chart component tests |
| `npm run test:5g:integration` | Run integration tests |

## 🧪 Test File Location

The test file for the 5G page is located at:
```
frontend/__tests__/components/5g-page.test.tsx
```

## 📝 Test Structure

The test suite includes:

1. **Component Rendering Tests**
   - Basic rendering
   - Loading states
   - Tab rendering

2. **Tab Navigation Tests**
   - Main tab switching
   - Sub-tab navigation
   - Tab content display

3. **KPI Cards Tests**
   - KPI display
   - Value rendering

4. **Scenario Selection Tests**
   - Scenario switching
   - Scenario state management

5. **Data Structure Tests**
   - Milestone events
   - Regional data
   - Map rendering

6. **Chart Integration Tests**
   - Chart.js initialization
   - Chart instance creation

7. **Interactive Elements Tests**
   - Checklist toggles
   - Sales opportunities
   - User interactions

8. **Error Handling Tests**
   - Chart.js loading failures
   - Graceful degradation

## 🔧 Debugging Tests

### Run with Debug Output

```bash
# Show console.log output
npx jest __tests__/components/5g-page.test.tsx --verbose --no-coverage

# Run a single test with debugging
npx jest __tests__/components/5g-page.test.tsx -t "should render the component without crashing" --verbose
```

### Use VS Code Debugger

1. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest: Current File",
      "program": "${workspaceFolder}/frontend/node_modules/.bin/jest",
      "args": ["${relativeFile}", "--no-coverage"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "cwd": "${workspaceFolder}/frontend"
    }
  ]
}
```

2. Set breakpoints in your test file
3. Press F5 to start debugging

### Inspect Test Output

```bash
# Show detailed test output
npx jest __tests__/components/5g-page.test.tsx --verbose --no-coverage --silent=false

# Show only failed tests
npx jest __tests__/components/5g-page.test.tsx --verbose --onlyFailures
```

## 📊 Coverage Reports

### Generate Coverage Report

```bash
# Generate coverage report
npm run test:5g:page -- --coverage

# Coverage will be generated in:
# frontend/coverage/lcov-report/index.html
```

### View Coverage

```bash
# Open coverage report in browser (after generating)
# Windows
start coverage/lcov-report/index.html

# Linux/Mac
open coverage/lcov-report/index.html
```

## 🎯 Running Specific Test Suites

### By Describe Block

```bash
# Run only "Component Rendering" tests
npx jest --testNamePattern="Component Rendering"

# Run only "Tab Navigation" tests
npx jest --testNamePattern="Tab Navigation"

# Run only "Chart Integration" tests
npx jest --testNamePattern="Chart Integration"
```

### By Individual Test

```bash
# Run a specific test
npx jest --testNamePattern="should render the component without crashing"

# Run tests matching a pattern
npx jest --testNamePattern="should.*render"
```

## 🔄 Watch Mode Options

### Basic Watch Mode

```bash
npm run test:5g:watch
```

### Interactive Watch Mode

```bash
npx jest __tests__/components/5g-page.test.tsx --watch
```

In interactive mode, you can:
- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `p` to filter by filename pattern
- Press `t` to filter by test name pattern
- Press `q` to quit watch mode

## 🛠️ Common Issues & Solutions

### Issue: Tests fail with "Chart.js not defined"

**Solution**: The test utilities mock Chart.js. Make sure `mockChartJS()` is called in `beforeAll()`.

### Issue: Tests timeout

**Solution**: Increase timeout in test:
```typescript
it('should render', async () => {
  // ... test code
}, 10000); // 10 second timeout
```

### Issue: "Cannot find module" errors

**Solution**: Make sure you're running from the `frontend` directory:
```bash
cd frontend
npm run test:5g:page
```

### Issue: Syntax errors in page.tsx

**Solution**: Fix syntax errors first. Check for:
- Missing closing tags
- Unclosed JSX expressions
- Missing imports

## 📚 Test Utilities

The test uses utilities from:
```
frontend/__tests__/utils/5g-test-utils.ts
```

Available utilities:
- `mockChartJS()` - Mock Chart.js globally
- `unmockChartJS()` - Remove Chart.js mocks
- `waitForChartLoad()` - Wait for Chart.js to load
- `generateMock5GFeatures()` - Generate mock 5G features data
- `generateMock5GExpansion()` - Generate mock expansion data

## 🎨 Best Practices

1. **Run tests before committing**
   ```bash
   npm run test:5g:page
   ```

2. **Use watch mode during development**
   ```bash
   npm run test:5g:watch
   ```

3. **Check coverage regularly**
   ```bash
   npm run test:5g:page -- --coverage
   ```

4. **Run specific tests when debugging**
   ```bash
   npx jest --testNamePattern="specific test name"
   ```

5. **Keep tests isolated** - Each test should be independent

## 📖 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [5G Testing Guide](./5G_TESTING_GUIDE.md)
- [Test Utilities](../__tests__/utils/5g-test-utils.ts)

## 🚨 Important Notes

1. **Always run tests from the `frontend` directory**
2. **Ensure dependencies are installed**: `npm install`
3. **Fix syntax errors before running tests**
4. **Chart.js is mocked in tests** - don't expect real Chart.js behavior
5. **Tests use `@testing-library/react`** for rendering and queries

## ✅ Quick Checklist

Before running tests:
- [ ] Navigate to `frontend` directory
- [ ] Ensure `node_modules` is installed
- [ ] Check for syntax errors in `page.tsx`
- [ ] Verify test file exists: `__tests__/components/5g-page.test.tsx`

Running tests:
- [ ] Use `npm run test:5g:page` for quick test
- [ ] Use `npm run test:5g:watch` for development
- [ ] Use `--coverage` flag to check coverage
- [ ] Use `--verbose` for detailed output






















