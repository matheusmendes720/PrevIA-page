# Validation System Tests

This directory contains comprehensive tests for the frontend validation system.

## 📋 Test Files

### Core Tests

- **`validate.test.ts`** - Tests for validation script structure and configuration
- **`build.test.ts`** - Tests for build process and configuration
- **`install.test.ts`** - Tests for installation and dependencies
- **`scripts.test.ts`** - Tests for validation scripts functionality
- **`type-check.test.ts`** - Tests for TypeScript type checking
- **`integration.test.ts`** - Integration tests that actually run commands

## 🚀 Running Tests

### Run All Validation Tests

```bash
npm run test:validation
```

### Run Specific Test File

```bash
# Run build tests
npm test -- validation/build

# Run install tests
npm test -- validation/install

# Run validation script tests
npm test -- validation/validate

# Run type-check tests
npm test -- validation/type-check

# Run scripts tests
npm test -- validation/scripts

# Run integration tests
npm test -- validation/integration
```

### Run Tests in Watch Mode

```bash
npm run test:validation:watch
```

### Run Tests with Coverage

```bash
npm test -- validation --coverage
```

## 📝 Test Categories

### 1. Validation Script Tests (`validate.test.ts`)

Tests for:
- Validation script existence and structure
- Package.json scripts configuration
- Setup scripts existence
- Documentation files

### 2. Build Tests (`build.test.ts`)

Tests for:
- Build configuration
- Build script execution
- Build output structure
- TypeScript configuration
- Next.js configuration
- Build dependencies

**Note**: Some tests check for build output which requires running `npm run build` first.

### 3. Installation Tests (`install.test.ts`)

Tests for:
- Package files (package.json, package-lock.json)
- Node modules directory
- Required dependencies
- Dependency versions
- Configuration files

### 4. Scripts Tests (`scripts.test.ts`)

Tests for:
- Script files existence
- Validation script structure
- Setup scripts structure
- Script execution format
- Package.json script integration
- Git hook templates

### 5. Type Check Tests (`type-check.test.ts`)

Tests for:
- TypeScript configuration
- TypeScript source files
- Type definitions
- Package.json type-check script

### 6. Integration Tests (`integration.test.ts`)

Tests for:
- Script execution (actual command running)
- Package.json scripts
- Node environment
- Environment variables
- File structure

**Note**: Integration tests that actually run commands are marked with `.skip()` by default. Uncomment them when you want to run actual builds/commands.

## 🔧 Test Configuration

Tests are configured to:
- Use Jest as the test runner
- Run in Node.js environment (not jsdom)
- Use TypeScript for test files
- Support async operations

## ⚙️ Environment Variables

Some tests can be skipped using environment variables:

- `SKIP_BUILD_TESTS=true` - Skip build-related tests
- `SKIP_INTEGRATION_TESTS=true` - Skip integration tests that run commands

## 🐛 Troubleshooting

### Tests Fail: "Cannot find module"

**Solution**: Make sure dependencies are installed:
```bash
npm install
```

### Tests Fail: "node_modules not found"

**Solution**: Install dependencies:
```bash
npm install
```

### Integration Tests Fail

**Solution**: Integration tests that run actual commands are skipped by default. Uncomment them in the test file if you want to run them.

### Tests Fail: "TypeScript errors"

**Solution**: Fix TypeScript errors:
```bash
npm run type-check
```

## 📊 Test Coverage

Run tests with coverage to see how much of the validation system is tested:

```bash
npm test -- validation --coverage
```

## ✨ Adding New Tests

When adding new tests:

1. Create test file in `__tests__/validation/`
2. Follow existing test patterns
3. Use descriptive test names
4. Add appropriate assertions
5. Document any special requirements

## 🎯 Best Practices

1. **Test Structure**: Group related tests in describe blocks
2. **Test Names**: Use descriptive test names that explain what is being tested
3. **Assertions**: Use appropriate Jest matchers
4. **Setup/Teardown**: Use beforeAll/afterAll when needed
5. **Skip Tests**: Use `.skip()` for tests that should not run by default
6. **Async Tests**: Handle async operations properly

## 📚 Related Documentation

- [Main Validation Guide](../../PRE_PUSH_VALIDATION.md)
- [Quick Start Guide](../../QUICK_START.md)
- [Validation Script](../../scripts/validate.js)

---

**Remember**: These tests verify that the validation system itself works correctly. They don't replace running the actual validation before pushing to master!


