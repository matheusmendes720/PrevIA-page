#!/bin/bash
# Quick frontend test script
# Checks if frontend builds and has no critical errors

echo "🧪 Testing Frontend Build..."
echo ""

cd frontend || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Running npm install..."
    npm install
fi

# Type check
echo "📝 Running TypeScript type check..."
npm run type-check
TYPE_CHECK_RESULT=$?

# Lint check
echo ""
echo "🔍 Running ESLint..."
npm run lint
LINT_RESULT=$?

# Summary
echo ""
echo "=" | tr -d '\n'
for i in {1..60}; do echo -n "="; done
echo ""
echo "📊 TEST SUMMARY"
echo "=" | tr -d '\n'
for i in {1..60}; do echo -n "="; done
echo ""

if [ $TYPE_CHECK_RESULT -eq 0 ]; then
    echo "✅ TypeScript: PASS"
else
    echo "❌ TypeScript: FAIL"
fi

if [ $LINT_RESULT -eq 0 ]; then
    echo "✅ ESLint: PASS"
else
    echo "❌ ESLint: FAIL"
fi

if [ $TYPE_CHECK_RESULT -eq 0 ] && [ $LINT_RESULT -eq 0 ]; then
    echo ""
    echo "🎉 All frontend checks passed!"
    exit 0
else
    echo ""
    echo "⚠️  Some checks failed. Review errors above."
    exit 1
fi



