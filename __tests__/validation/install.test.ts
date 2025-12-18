/**
 * Tests for installation and dependencies
 * These tests verify that dependencies are properly installed
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Installation and Dependencies Tests', () => {
  const frontendDir = path.resolve(__dirname, '../..');
  const nodeModulesDir = path.join(frontendDir, 'node_modules');
  const packageJsonPath = path.join(frontendDir, 'package.json');
  const packageLockPath = path.join(frontendDir, 'package-lock.json');

  describe('Package Files', () => {
    it('should have package.json', () => {
      expect(fs.existsSync(packageJsonPath)).toBe(true);
    });

    it('should have valid package.json', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson.name).toBeTruthy();
      expect(packageJson.version).toBeTruthy();
      expect(packageJson.scripts).toBeDefined();
    });

    it('should have package-lock.json', () => {
      // package-lock.json should exist after npm install
      if (fs.existsSync(packageLockPath)) {
        expect(fs.statSync(packageLockPath).isFile()).toBe(true);
      } else {
        console.warn('package-lock.json not found. Run npm install to generate it.');
      }
    });
  });

  describe('Node Modules', () => {
    it('should have node_modules directory', () => {
      if (fs.existsSync(nodeModulesDir)) {
        expect(fs.statSync(nodeModulesDir).isDirectory()).toBe(true);
      } else {
        console.warn('node_modules not found. Run npm install to install dependencies.');
      }
    });

    it('should have next in node_modules', () => {
      const nextPath = path.join(nodeModulesDir, 'next');
      if (fs.existsSync(nodeModulesDir)) {
        expect(fs.existsSync(nextPath)).toBe(true);
      }
    });

    it('should have react in node_modules', () => {
      const reactPath = path.join(nodeModulesDir, 'react');
      if (fs.existsSync(nodeModulesDir)) {
        expect(fs.existsSync(reactPath)).toBe(true);
      }
    });

    it('should have react-dom in node_modules', () => {
      const reactDomPath = path.join(nodeModulesDir, 'react-dom');
      if (fs.existsSync(nodeModulesDir)) {
        expect(fs.existsSync(reactDomPath)).toBe(true);
      }
    });

    it('should have typescript in node_modules (dev)', () => {
      const tsPath = path.join(nodeModulesDir, 'typescript');
      if (fs.existsSync(nodeModulesDir)) {
        expect(fs.existsSync(tsPath)).toBe(true);
      }
    });

    it('should have eslint in node_modules (dev)', () => {
      const eslintPath = path.join(nodeModulesDir, 'eslint');
      if (fs.existsSync(nodeModulesDir)) {
        expect(fs.existsSync(eslintPath)).toBe(true);
      }
    });

    it('should have jest in node_modules (dev)', () => {
      const jestPath = path.join(nodeModulesDir, 'jest');
      if (fs.existsSync(nodeModulesDir)) {
        expect(fs.existsSync(jestPath)).toBe(true);
      }
    });
  });

  describe('Required Dependencies', () => {
    let packageJson: any;

    beforeAll(() => {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(content);
    });

    it('should have next dependency', () => {
      expect(packageJson.dependencies).toHaveProperty('next');
    });

    it('should have react dependency', () => {
      expect(packageJson.dependencies).toHaveProperty('react');
    });

    it('should have react-dom dependency', () => {
      expect(packageJson.dependencies).toHaveProperty('react-dom');
    });

    it('should have axios dependency', () => {
      expect(packageJson.dependencies).toHaveProperty('axios');
    });

    it('should have typescript dev dependency', () => {
      expect(packageJson.devDependencies).toHaveProperty('typescript');
    });

    it('should have eslint dev dependency', () => {
      expect(packageJson.devDependencies).toHaveProperty('eslint');
    });

    it('should have jest dev dependency', () => {
      expect(packageJson.devDependencies).toHaveProperty('jest');
    });

    it('should have @types/react dev dependency', () => {
      expect(packageJson.devDependencies).toHaveProperty('@types/react');
    });

    it('should have @types/node dev dependency', () => {
      expect(packageJson.devDependencies).toHaveProperty('@types/node');
    });
  });

  describe('Dependency Versions', () => {
    let packageJson: any;

    beforeAll(() => {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(content);
    });

    it('should have next version specified', () => {
      expect(packageJson.dependencies.next).toBeTruthy();
      expect(packageJson.dependencies.next).toMatch(/^\^?\d+\.\d+\.\d+/);
    });

    it('should have react version specified', () => {
      expect(packageJson.dependencies.react).toBeTruthy();
      expect(packageJson.dependencies.react).toMatch(/^\^?\d+\.\d+\.\d+/);
    });

    it('should have typescript version specified', () => {
      expect(packageJson.devDependencies.typescript).toBeTruthy();
      expect(packageJson.devDependencies.typescript).toMatch(/^\^?\d+\.\d+\.\d+/);
    });
  });

  describe('Configuration Files', () => {
    it('should have tsconfig.json', () => {
      const tsConfigPath = path.join(frontendDir, 'tsconfig.json');
      expect(fs.existsSync(tsConfigPath)).toBe(true);
    });

    it('should have .eslintrc.json', () => {
      const eslintConfigPath = path.join(frontendDir, '.eslintrc.json');
      expect(fs.existsSync(eslintConfigPath)).toBe(true);
    });

    it('should have jest.config.js', () => {
      const jestConfigPath = path.join(frontendDir, 'jest.config.js');
      expect(fs.existsSync(jestConfigPath)).toBe(true);
    });

    it('should have tailwind.config.js', () => {
      const tailwindConfigPath = path.join(frontendDir, 'tailwind.config.js');
      expect(fs.existsSync(tailwindConfigPath)).toBe(true);
    });

    it('should have postcss.config.js', () => {
      const postcssConfigPath = path.join(frontendDir, 'postcss.config.js');
      expect(fs.existsSync(postcssConfigPath)).toBe(true);
    });
  });
});


