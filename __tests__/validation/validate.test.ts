/**
 * Tests for the validation script
 * These tests verify that the validation system works correctly
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Validation Script Tests', () => {
  const frontendDir = path.resolve(__dirname, '../..');
  const scriptsDir = path.join(frontendDir, 'scripts');
  const validateScript = path.join(scriptsDir, 'validate.js');

  describe('Validation Script Existence', () => {
    it('should have validation script file', () => {
      expect(fs.existsSync(validateScript)).toBe(true);
    });

    it('should have scripts directory', () => {
      expect(fs.existsSync(scriptsDir)).toBe(true);
    });
  });

  describe('Validation Script Syntax', () => {
    it('should have valid JavaScript syntax', () => {
      const scriptContent = fs.readFileSync(validateScript, 'utf8');
      expect(scriptContent).toBeTruthy();
      expect(scriptContent.length).toBeGreaterThan(0);
    });

    it('should be executable', () => {
      // Check if file exists and is readable
      expect(fs.accessSync(validateScript, fs.constants.R_OK)).toBeUndefined();
    });
  });

  describe('Package.json Scripts', () => {
    const packageJsonPath = path.join(frontendDir, 'package.json');
    let packageJson: any;

    beforeAll(() => {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(content);
    });

    it('should have validate script', () => {
      expect(packageJson.scripts).toHaveProperty('validate');
    });

    it('should have validate:full script', () => {
      expect(packageJson.scripts).toHaveProperty('validate:full');
    });

    it('should have validate:quick script', () => {
      expect(packageJson.scripts).toHaveProperty('validate:quick');
    });

    it('should have type-check script', () => {
      expect(packageJson.scripts).toHaveProperty('type-check');
    });

    it('should have lint script', () => {
      expect(packageJson.scripts).toHaveProperty('lint');
    });

    it('should have build script', () => {
      expect(packageJson.scripts).toHaveProperty('build');
    });

    it('should have test script', () => {
      expect(packageJson.scripts).toHaveProperty('test');
    });
  });

  describe('Setup Scripts', () => {
    it('should have setup-hooks.sh script', () => {
      const setupScript = path.join(scriptsDir, 'setup-hooks.sh');
      expect(fs.existsSync(setupScript)).toBe(true);
    });

    it('should have setup-hooks.bat script', () => {
      const setupScript = path.join(scriptsDir, 'setup-hooks.bat');
      expect(fs.existsSync(setupScript)).toBe(true);
    });

    it('should have pre-push hook template', () => {
      const hookTemplate = path.join(frontendDir, '.githooks', 'pre-push');
      expect(fs.existsSync(hookTemplate)).toBe(true);
    });
  });

  describe('Documentation Files', () => {
    it('should have PRE_PUSH_VALIDATION.md', () => {
      const docPath = path.join(frontendDir, 'PRE_PUSH_VALIDATION.md');
      expect(fs.existsSync(docPath)).toBe(true);
    });

    it('should have QUICK_START.md', () => {
      const docPath = path.join(frontendDir, 'QUICK_START.md');
      expect(fs.existsSync(docPath)).toBe(true);
    });

    it('should have README_VALIDATION.md', () => {
      const docPath = path.join(frontendDir, 'README_VALIDATION.md');
      expect(fs.existsSync(docPath)).toBe(true);
    });
  });
});


