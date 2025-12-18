#!/usr/bin/env node

/**
 * Test script to verify all performance optimizations are working
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Performance Optimizations...\n');

const tests = [];
let passed = 0;
let failed = 0;

// Test 1: Check Next.js config
function testNextConfig() {
  const configPath = path.join(__dirname, '..', 'next.config.js');
  const config = fs.readFileSync(configPath, 'utf8');
  
  const checks = {
    'optimizePackageImports': config.includes('optimizePackageImports'),
    'optimizeCss': config.includes('optimizeCss'),
    'webpack splitChunks': config.includes('splitChunks'),
    'charts chunk': config.includes('charts'),
    'No serverComponentsExternalPackages conflict': !config.includes('serverComponentsExternalPackages'),
  };
  
  Object.entries(checks).forEach(([name, result]) => {
    tests.push({ name: `Next.js Config: ${name}`, passed: result });
    if (result) passed++; else failed++;
  });
}

// Test 2: Check Sidebar optimizations
function testSidebarOptimizations() {
  const sidebarPath = path.join(__dirname, '..', 'src', 'components', 'Sidebar.tsx');
  const sidebar = fs.readFileSync(sidebarPath, 'utf8');
  
  const checks = {
    'React.memo on Sidebar': sidebar.includes('memo(Sidebar') || sidebar.includes('const Sidebar: React.FC<SidebarProps> = memo'),
    'React.memo on NavItem': sidebar.includes('const NavItem: React.FC<NavItemProps> = memo'),
    'useMemo for navItems': sidebar.includes('const navItems = useMemo'),
    'useMemo for featureLinks': sidebar.includes('const featureLinks = useMemo'),
    'useCallback for handlers': sidebar.includes('useCallback'),
    'Prefetch on mount': sidebar.includes('router.prefetch'),
    'Prefetch on hover': sidebar.includes('handleLinkHover'),
    'Link prefetch prop': sidebar.includes('prefetch={true}'),
  };
  
  Object.entries(checks).forEach(([name, result]) => {
    tests.push({ name: `Sidebar: ${name}`, passed: result });
    if (result) passed++; else failed++;
  });
}

// Test 3: Check dynamic imports
function testDynamicImports() {
  const mainPagePath = path.join(__dirname, '..', 'src', 'app', 'main', 'page.tsx');
  const featuresLayoutPath = path.join(__dirname, '..', 'src', 'app', 'features', 'layout.tsx');
  
  const mainPage = fs.readFileSync(mainPagePath, 'utf8');
  const featuresLayout = fs.readFileSync(featuresLayoutPath, 'utf8');
  
  const checks = {
    'Dynamic Dashboard import': mainPage.includes('dynamic(() => import'),
    'Dynamic BackendStatus': featuresLayout.includes('dynamic(() => import'),
    'Suspense boundaries': mainPage.includes('Suspense') || featuresLayout.includes('Suspense'),
    'Loading states': mainPage.includes('loading:') || featuresLayout.includes('loading:'),
  };
  
  Object.entries(checks).forEach(([name, result]) => {
    tests.push({ name: `Code Splitting: ${name}`, passed: result });
    if (result) passed++; else failed++;
  });
}

// Test 4: Check features layout
function testFeaturesLayout() {
  const layoutPath = path.join(__dirname, '..', 'src', 'app', 'features', 'layout.tsx');
  const layout = fs.readFileSync(layoutPath, 'utf8');
  
  const checks = {
    'useCallback for handlers': layout.includes('useCallback'),
    'Suspense wrapper': layout.includes('Suspense'),
    'Loading skeleton': layout.includes('PageLoadingSkeleton'),
    'Collapsible sidebar support': layout.includes('isSidebarCollapsed'),
  };
  
  Object.entries(checks).forEach(([name, result]) => {
    tests.push({ name: `Features Layout: ${name}`, passed: result });
    if (result) passed++; else failed++;
  });
}

// Run all tests
testNextConfig();
testSidebarOptimizations();
testDynamicImports();
testFeaturesLayout();

// Print results
console.log('📊 Test Results:\n');
tests.forEach(test => {
  const icon = test.passed ? '✅' : '❌';
  console.log(`${icon} ${test.name}`);
});

console.log(`\n📈 Summary: ${passed} passed, ${failed} failed out of ${tests.length} tests\n`);

if (failed === 0) {
  console.log('🎉 All optimizations are properly configured!');
  process.exit(0);
} else {
  console.log('⚠️  Some optimizations need attention.');
  process.exit(1);
}
