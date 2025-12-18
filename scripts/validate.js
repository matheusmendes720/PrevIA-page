#!/usr/bin/env node

/**
 * Pre-Push Validation Script
 * Comprehensive validation for frontend before pushing to master
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function runCommand(command, description) {
  try {
    log(`  Running: ${command}`, 'blue');
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
    logSuccess(description);
    return true;
  } catch (error) {
    logError(`${description} failed`);
    return false;
  }
}

function checkEnvironmentVariables() {
  logStep('1', 'Checking environment variables...');
  
  const envFile = path.resolve(__dirname, '..', '.env.local');
  const envExample = path.resolve(__dirname, '..', '.env.example');
  
  // Check if .env.local exists
  if (!fs.existsSync(envFile)) {
    logWarning('.env.local not found. Make sure environment variables are set.');
  }
  
  // Check for required environment variables in next.config.js
  const nextConfig = fs.readFileSync(
    path.resolve(__dirname, '..', 'next.config.js'),
    'utf8'
  );
  
  const requiredVars = ['NEXT_PUBLIC_API_URL'];
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!nextConfig.includes(varName)) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    logWarning(`Potential missing environment variables: ${missingVars.join(', ')}`);
    logWarning('These should be set in production environment.');
  } else {
    logSuccess('Environment variables configured');
  }
  
  return true;
}

function checkGitStatus() {
  logStep('2', 'Checking Git status...');
  
  try {
    // Check if we're on master/main branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '..'),
    }).trim();
    
    if (branch === 'master' || branch === 'main') {
      logWarning(`You are on ${branch} branch. Make sure you want to push here.`);
    }
    
    // Check for uncommitted changes
    const status = execSync('git status --porcelain', { 
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '..'),
    });
    
    if (status.trim()) {
      logWarning('You have uncommitted changes. Consider committing or stashing them.');
    } else {
      logSuccess('Git working directory is clean');
    }
    
    return true;
  } catch (error) {
    logError('Git status check failed');
    return false;
  }
}

function validateDependencies() {
  logStep('3', 'Validating dependencies...');
  
  try {
    // Check if node_modules exists
    const nodeModules = path.resolve(__dirname, '..', 'node_modules');
    if (!fs.existsSync(nodeModules)) {
      logError('node_modules not found. Run npm install first.');
      return false;
    }
    
    // Check package-lock.json
    const packageLock = path.resolve(__dirname, '..', 'package-lock.json');
    if (!fs.existsSync(packageLock)) {
      logWarning('package-lock.json not found. Run npm install to generate it.');
    }
    
    logSuccess('Dependencies validated');
    return true;
  } catch (error) {
    logError('Dependency validation failed');
    return false;
  }
}

function runTypeScriptCheck() {
  logStep('4', 'Running TypeScript type check...');
  return runCommand(
    'npx tsc --noEmit --pretty',
    'TypeScript type check'
  );
}

function runESLint() {
  logStep('5', 'Running ESLint...');
  return runCommand(
    'npm run lint',
    'ESLint check'
  );
}

function runTests() {
  logStep('6', 'Running tests...');
  return runCommand(
    'npm test -- --passWithNoTests',
    'Test suite'
  );
}

function runBuild() {
  logStep('7', 'Running production build...');
  return runCommand(
    'npm run build',
    'Production build'
  );
}

function checkBuildOutput() {
  logStep('8', 'Checking build output...');
  
  const buildDir = path.resolve(__dirname, '..', '.next');
  if (!fs.existsSync(buildDir)) {
    logError('Build output not found. Build may have failed silently.');
    return false;
  }
  
  // Check for critical build files
  const requiredFiles = [
    path.join(buildDir, 'BUILD_ID'),
  ];
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      logError(`Build file missing: ${file}`);
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    logSuccess('Build output validated');
  }
  
  return allFilesExist;
}

function checkForConsoleErrors() {
  logStep('9', 'Checking for console errors in code...');
  
  const srcDir = path.resolve(__dirname, '..', 'src');
  const files = getAllFiles(srcDir, ['.ts', '.tsx']);
  let foundErrors = false;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for console.error (these should be handled properly)
    if (content.includes('console.error(') && !content.includes('// eslint-disable')) {
      logWarning(`Found console.error in ${path.relative(process.cwd(), file)}`);
      logWarning('Consider using proper error handling instead.');
    }
    
    // Check for TODO/FIXME comments
    if (content.match(/TODO|FIXME|XXX/i) && !content.includes('// eslint-disable')) {
      logWarning(`Found TODO/FIXME in ${path.relative(process.cwd(), file)}`);
    }
  }
  
  logSuccess('Code quality check completed');
  return true;
}

function getAllFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and .next
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(getAllFiles(file, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(file);
      }
    }
  });
  
  return results;
}

function generateReport(results) {
  log('\n' + '='.repeat(60), 'cyan');
  log('VALIDATION REPORT', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach((result) => {
    if (result.passed) {
      logSuccess(`${result.name}: PASSED`);
    } else {
      logError(`${result.name}: FAILED`);
    }
  });
  
  log('\n' + '-'.repeat(60), 'cyan');
  log(`Total: ${passed}/${total} checks passed`, passed === total ? 'green' : 'yellow');
  log('-'.repeat(60) + '\n', 'cyan');
  
  return passed === total;
}

// Main execution
async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('FRONTEND PRE-PUSH VALIDATION', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const results = [];
  
  // Run all validations
  results.push({ name: 'Environment Variables', passed: checkEnvironmentVariables() });
  results.push({ name: 'Git Status', passed: checkGitStatus() });
  results.push({ name: 'Dependencies', passed: validateDependencies() });
  results.push({ name: 'TypeScript', passed: runTypeScriptCheck() });
  results.push({ name: 'ESLint', passed: runESLint() });
  results.push({ name: 'Tests', passed: runTests() });
  results.push({ name: 'Build', passed: runBuild() });
  results.push({ name: 'Build Output', passed: checkBuildOutput() });
  results.push({ name: 'Code Quality', passed: checkForConsoleErrors() });
  
  // Generate report
  const allPassed = generateReport(results);
  
  if (!allPassed) {
    logError('Validation failed! Please fix the issues above before pushing.');
    process.exit(1);
  } else {
    logSuccess('All validations passed! Ready to push to master.');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };

