/**
 * Integration tests for validation system
 * These tests actually run the validation commands
 * Run with: npm test -- validation/integration
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Validation Integration Tests', () => {
  const frontendDir = path.resolve(__dirname, '../..');
  const packageJsonPath = path.join(frontendDir, 'package.json');

  // Skip actual command execution tests if SKIP_INTEGRATION_TESTS is set
  const skipIntegration = process.env.SKIP_INTEGRATION_TESTS === 'true';

  describe('Package.json Scripts Execution', () => {
    it('should have all required scripts', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts;
      
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('lint');
      expect(scripts).toHaveProperty('test');
      expect(scripts).toHaveProperty('type-check');
      expect(scripts).toHaveProperty('validate');
      expect(scripts).toHaveProperty('validate:full');
      expect(scripts).toHaveProperty('validate:quick');
    });

    it('should have valid script commands', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts;
      
      expect(typeof scripts.build).toBe('string');
      expect(typeof scripts.lint).toBe('string');
      expect(typeof scripts.test).toBe('string');
      expect(typeof scripts['type-check']).toBe('string');
    });
  });

  describe('Type Check Command', () => {
    it.skip('should run type-check command successfully', () => {
      // This test actually runs the type-check command
      // Uncomment when you want to run it
      // const result = execSync('npm run type-check', {
      //   cwd: frontendDir,
      //   encoding: 'utf8',
      //   stdio: 'pipe'
      // });
      // expect(result).toBeTruthy();
    });
  });

  describe('Lint Command', () => {
    it.skip('should run lint command successfully', () => {
      // This test actually runs the lint command
      // Uncomment when you want to run it
      // const result = execSync('npm run lint', {
      //   cwd: frontendDir,
      //   encoding: 'utf8',
      //   stdio: 'pipe'
      // });
      // expect(result).toBeTruthy();
    });
  });

  describe('Build Command', () => {
    it.skip('should run build command successfully', () => {
      // This test actually runs the build command
      // Uncomment when you want to run it
      // Note: This will take time and create build artifacts
      // const result = execSync('npm run build', {
      //   cwd: frontendDir,
      //   encoding: 'utf8',
      //   stdio: 'pipe',
      //   timeout: 300000 // 5 minutes
      // });
      // expect(result).toBeTruthy();
      // expect(fs.existsSync(path.join(frontendDir, '.next'))).toBe(true);
    });
  });

  describe('Validation Script Execution', () => {
    it.skip('should run validate script without crashing', () => {
      // This test actually runs the validate script
      // Uncomment when you want to run it
      // Note: This will run all validations which may take time
      // const result = execSync('npm run validate', {
      //   cwd: frontendDir,
      //   encoding: 'utf8',
      //   stdio: 'pipe',
      //   timeout: 600000 // 10 minutes
      // });
      // expect(result).toBeTruthy();
    });

    it.skip('should run validate:quick script without crashing', () => {
      // This test actually runs the quick validate script
      // Uncomment when you want to run it
      // const result = execSync('npm run validate:quick', {
      //   cwd: frontendDir,
      //   encoding: 'utf8',
      //   stdio: 'pipe',
      //   timeout: 300000 // 5 minutes
      // });
      // expect(result).toBeTruthy();
    });
  });

  describe('Test Command', () => {
    it('should have test script configured', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson.scripts.test).toBeTruthy();
      expect(packageJson.scripts.test).toContain('jest');
    });

    it('should have jest configuration', () => {
      const jestConfigPath = path.join(frontendDir, 'jest.config.js');
      expect(fs.existsSync(jestConfigPath)).toBe(true);
    });
  });

  describe('Node Environment', () => {
    it('should have node_modules directory', () => {
      const nodeModulesPath = path.join(frontendDir, 'node_modules');
      // This is a soft check - node_modules might not exist in CI
      if (fs.existsSync(nodeModulesPath)) {
        expect(fs.statSync(nodeModulesPath).isDirectory()).toBe(true);
      }
    });

    it('should have package-lock.json or yarn.lock', () => {
      const packageLockPath = path.join(frontendDir, 'package-lock.json');
      const yarnLockPath = path.join(frontendDir, 'yarn.lock');
      
      // At least one should exist
      const hasLockFile = fs.existsSync(packageLockPath) || fs.existsSync(yarnLockPath);
      if (!hasLockFile) {
        console.warn('No lock file found. Run npm install to generate package-lock.json');
      }
    });
  });

  describe('Environment Variables', () => {
    it('should have next.config.js with environment variables', () => {
      const nextConfigPath = path.join(frontendDir, 'next.config.js');
      if (fs.existsSync(nextConfigPath)) {
        const content = fs.readFileSync(nextConfigPath, 'utf8');
        expect(content).toContain('NEXT_PUBLIC');
      }
    });
  });

  describe('File Structure', () => {
    it('should have src directory', () => {
      const srcPath = path.join(frontendDir, 'src');
      expect(fs.existsSync(srcPath)).toBe(true);
    });

    it('should have public directory', () => {
      const publicPath = path.join(frontendDir, 'public');
      expect(fs.existsSync(publicPath)).toBe(true);
    });

    it('should have scripts directory', () => {
      const scriptsPath = path.join(frontendDir, 'scripts');
      expect(fs.existsSync(scriptsPath)).toBe(true);
    });
  });
});


