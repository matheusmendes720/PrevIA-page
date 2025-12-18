# 🚀 Quick Start: Frontend Pre-Push Validation

## 📋 Before Pushing to Master

Run this command:

```bash
cd frontend
npm run validate:full
```

This will check:
- ✅ TypeScript types
- ✅ ESLint
- ✅ Tests
- ✅ Production build
- ✅ All validations

## 🔧 Setup Git Hook (One-Time)

### Windows
```bash
cd frontend
scripts\setup-hooks.bat
```

### Linux/Mac
```bash
cd frontend
chmod +x scripts/setup-hooks.sh
./scripts/setup-hooks.sh
```

After setup, the hook will automatically run before every push.

## ⚡ Quick Commands

```bash
# Full validation (everything)
npm run validate:full

# Quick validation (no build)
npm run validate:quick

# Type check only
npm run type-check

# Lint only
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test
```

## 🐛 Common Issues

### Validation Fails: TypeScript Errors
```bash
npm run type-check
# Fix the errors shown
```

### Validation Fails: ESLint Errors
```bash
npm run lint:fix  # Auto-fix
npm run lint       # See remaining
```

### Validation Fails: Tests Fail
```bash
npm test
# Fix failing tests
```

### Validation Fails: Build Fails
```bash
npm run build
# Check build errors
```

## 📚 Full Documentation

See [PRE_PUSH_VALIDATION.md](./PRE_PUSH_VALIDATION.md) for complete documentation.

