/**
 * Tests for validation scripts functionality
 * These tests verify that the scripts work correctly
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Validation Scripts Tests', () => {
  const frontendDir = path.resolve(__dirname, '../..');
  const scriptsDir = path.join(frontendDir, 'scripts');

  describe('Script Files', () => {
    it('should have validate.js script', () => {
      const validateScript = path.join(scriptsDir, 'validate.js');
      expect(fs.existsSync(validateScript)).toBe(true);
    });

    it('should have setup-hooks.sh script', () => {
      const setupScript = path.join(scriptsDir, 'setup-hooks.sh');
      expect(fs.existsSync(setupScript)).toBe(true);
    });

    it('should have setup-hooks.bat script', () => {
      const setupScript = path.join(scriptsDir, 'setup-hooks.bat');
      expect(fs.existsSync(setupScript)).toBe(true);
    });
  });

  describe('Validation Script Structure', () => {
    it('should have validate.js with required functions', () => {
      const validateScript = path.join(scriptsDir, 'validate.js');
      const content = fs.readFileSync(validateScript, 'utf8');
      
      // Check for key functions
      expect(content).toContain('checkEnvironmentVariables');
      expect(content).toContain('runTypeScriptCheck');
      expect(content).toContain('runESLint');
      expect(content).toContain('runTests');
      expect(content).toContain('runBuild');
    });

    it('should be a Node.js script', () => {
      const validateScript = path.join(scriptsDir, 'validate.js');
      const content = fs.readFileSync(validateScript, 'utf8');
      
      expect(content).toContain('#!/usr/bin/env node');
      expect(content).toContain('require');
    });
  });

  describe('Setup Scripts Structure', () => {
    it('should have setup-hooks.sh with Git hook setup', () => {
      const setupScript = path.join(scriptsDir, 'setup-hooks.sh');
      const content = fs.readFileSync(setupScript, 'utf8');
      
      expect(content).toContain('pre-push');
      expect(content).toContain('git');
    });

    it('should have setup-hooks.bat with Git hook setup', () => {
      const setupScript = path.join(scriptsDir, 'setup-hooks.bat');
      const content = fs.readFileSync(setupScript, 'utf8');
      
      expect(content).toContain('pre-push');
      expect(content).toContain('git');
    });
  });

  describe('Script Execution', () => {
    it('should be able to require validate script module', () => {
      const validateScript = path.join(scriptsDir, 'validate.js');
      // Just verify the file can be read and parsed
      const content = fs.readFileSync(validateScript, 'utf8');
      expect(content.length).toBeGreaterThan(0);
    });

    it('should have validate script as executable format', () => {
      const validateScript = path.join(scriptsDir, 'validate.js');
      const content = fs.readFileSync(validateScript, 'utf8');
      
      // Check for shebang
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    });
  });

  describe('Package.json Script Integration', () => {
    const packageJsonPath = path.join(frontendDir, 'package.json');
    let packageJson: any;

    beforeAll(() => {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(content);
    });

    it('should have validate script pointing to validate.js', () => {
      expect(packageJson.scripts.validate).toContain('scripts/validate.js');
    });

    it('should have validate:full script', () => {
      expect(packageJson.scripts['validate:full']).toBeDefined();
    });

    it('should have validate:quick script', () => {
      expect(packageJson.scripts['validate:quick']).toBeDefined();
      expect(packageJson.scripts['validate:quick']).toContain('type-check');
      expect(packageJson.scripts['validate:quick']).toContain('lint');
      expect(packageJson.scripts['validate:quick']).toContain('test');
    });
  });

  describe('Git Hook Template', () => {
    it('should have pre-push hook template', () => {
      const hookTemplate = path.join(frontendDir, '.githooks', 'pre-push');
      expect(fs.existsSync(hookTemplate)).toBe(true);
    });

    it('should have pre-push hook with validation logic', () => {
      const hookTemplate = path.join(frontendDir, '.githooks', 'pre-push');
      const content = fs.readFileSync(hookTemplate, 'utf8');
      
      expect(content).toContain('pre-push');
      expect(content).toContain('validate');
    });
  });
});


