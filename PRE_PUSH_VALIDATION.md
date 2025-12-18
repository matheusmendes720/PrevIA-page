# Frontend Pre-Push Validation Guide

This guide explains how to use the pre-push validation system to ensure your frontend code is bulletproof before pushing to the master branch.

## 📋 Overview

The validation system performs comprehensive checks on your code before allowing pushes to master:

1. ✅ Environment variables validation
2. ✅ Git status check
3. ✅ Dependencies validation
4. ✅ TypeScript type checking
5. ✅ ESLint code quality checks
6. ✅ Test suite execution
7. ✅ Production build verification
8. ✅ Build output validation
9. ✅ Code quality checks (console errors, TODOs)

## 🚀 Quick Start

### Manual Validation

Before pushing to master, run:

```bash
cd frontend
npm run validate:full
```

This will run all validation checks and report any issues.

### Quick Validation

For a faster check (without full build):

```bash
cd frontend
npm run validate:quick
```

This runs:
- TypeScript type checking
- ESLint
- Tests (with passWithNoTests flag)

## 🔧 Setup Git Hooks

### Automatic Setup (Recommended)

1. Install husky (if not already installed):
```bash
cd frontend
npm install --save-dev husky
```

2. Initialize husky:
```bash
npx husky install
```

3. Add the pre-push hook:
```bash
npx husky add .husky/pre-push "cd frontend && npm run validate:full"
```

### Manual Setup

1. Copy the pre-push hook:
```bash
cp frontend/.githooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

2. The hook will automatically run before every push.

### Skip Validation (Not Recommended)

If you absolutely need to skip validation (emergency fixes only):

```bash
git push --no-verify
```

⚠️ **Warning**: Only use `--no-verify` in emergency situations. Always validate your code before pushing to master.

## 📝 Available Scripts

### Validation Scripts

- `npm run validate` - Run full validation script
- `npm run validate:full` - Run comprehensive validation (same as validate)
- `npm run validate:quick` - Run quick validation (no build)

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality Scripts

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint and auto-fix issues
- `npm run type-check` - Run TypeScript type checking

### Testing Scripts

- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ci` - Run tests in CI mode

## 🔍 What Gets Checked

### 1. Environment Variables

Checks for:
- Required environment variables in `next.config.js`
- Presence of `.env.local` file (warning if missing)
- Configuration for `NEXT_PUBLIC_API_URL`

### 2. Git Status

Checks:
- Current branch (warns if pushing to master/main)
- Uncommitted changes (warns if present)

### 3. Dependencies

Validates:
- `node_modules` directory exists
- `package-lock.json` is present

### 4. TypeScript

Runs:
- Full type checking with `tsc --noEmit`
- Validates all TypeScript files

### 5. ESLint

Runs:
- Next.js ESLint configuration
- Reports all linting errors and warnings

### 6. Tests

Runs:
- All Jest tests
- Passes with no tests if test files are missing (acceptable for new features)

### 7. Production Build

Runs:
- Full Next.js production build
- Validates build completes without errors

### 8. Build Output

Checks:
- `.next` directory exists
- `BUILD_ID` file is present
- Build output is valid

### 9. Code Quality

Scans for:
- `console.error()` calls (should use proper error handling)
- `TODO`/`FIXME` comments (warnings)
- Code quality issues

## 🐛 Troubleshooting

### Validation Fails: TypeScript Errors

**Solution**: Fix TypeScript errors:
```bash
npm run type-check
```

### Validation Fails: ESLint Errors

**Solution**: Fix linting errors:
```bash
npm run lint:fix  # Auto-fix if possible
npm run lint      # See remaining issues
```

### Validation Fails: Tests Fail

**Solution**: Fix failing tests:
```bash
npm test
```

### Validation Fails: Build Fails

**Solution**: Check build errors:
```bash
npm run build
```

### Validation Fails: Missing Dependencies

**Solution**: Install dependencies:
```bash
npm install
```

### Hook Not Running

**Solution**: 
1. Check if hook is executable:
```bash
chmod +x .git/hooks/pre-push
```

2. Verify hook is in correct location:
```bash
ls -la .git/hooks/pre-push
```

## 📊 Validation Report

After running validation, you'll see a detailed report:

```
============================================================
VALIDATION REPORT
============================================================
✓ Environment Variables: PASSED
✓ Git Status: PASSED
✓ Dependencies: PASSED
✓ TypeScript: PASSED
✓ ESLint: PASSED
✓ Tests: PASSED
✓ Build: PASSED
✓ Build Output: PASSED
✓ Code Quality: PASSED

------------------------------------------------------------
Total: 9/9 checks passed
------------------------------------------------------------
```

## 🎯 Best Practices

1. **Run validation frequently**: Run `npm run validate:quick` before committing
2. **Fix issues immediately**: Don't accumulate technical debt
3. **Use lint:fix**: Auto-fix linting issues when possible
4. **Keep tests updated**: Add tests for new features
5. **Review TODOs**: Address or remove TODO comments before pushing
6. **Clean builds**: Always ensure production builds succeed

## 🚨 Before Pushing to Master

Always run these checks:

1. ✅ `npm run validate:full` - Full validation
2. ✅ Review all warnings and errors
3. ✅ Fix all critical issues
4. ✅ Ensure tests pass
5. ✅ Verify production build succeeds
6. ✅ Check environment variables are configured

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [ESLint Documentation](https://eslint.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## 🔄 CI/CD Integration

These validation checks can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Validate Frontend
  run: |
    cd frontend
    npm install
    npm run validate:full
```

## 📝 Notes

- The validation script is located at `frontend/scripts/validate.js`
- The pre-push hook is located at `frontend/.githooks/pre-push`
- All validation checks must pass before pushing to master
- Warnings don't block pushes, but errors do

---

**Remember**: Always validate your code before pushing to master. It's better to catch issues early than to fix them in production!

