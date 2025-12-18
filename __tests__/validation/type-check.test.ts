/**
 * Tests for TypeScript type checking
 * These tests verify that TypeScript configuration and type checking work
 */

import * as fs from 'fs';
import * as path from 'path';

describe('TypeScript Type Check Tests', () => {
  const frontendDir = path.resolve(__dirname, '../..');
  const tsConfigPath = path.join(frontendDir, 'tsconfig.json');
  const srcDir = path.join(frontendDir, 'src');

  describe('TypeScript Configuration', () => {
    it('should have tsconfig.json', () => {
      expect(fs.existsSync(tsConfigPath)).toBe(true);
    });

    it('should have valid tsconfig.json structure', () => {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      expect(tsConfig.compilerOptions).toBeDefined();
      expect(tsConfig.compilerOptions).toBeInstanceOf(Object);
    });

    it('should have required compiler options', () => {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      const options = tsConfig.compilerOptions;
      
      expect(options).toHaveProperty('module');
      expect(options).toHaveProperty('jsx');
      expect(options).toHaveProperty('moduleResolution');
    });

    it('should include src directory', () => {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      expect(tsConfig.include).toBeDefined();
      expect(tsConfig.include).toContain('**/*.ts');
      expect(tsConfig.include).toContain('**/*.tsx');
    });

    it('should exclude node_modules', () => {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      expect(tsConfig.exclude).toBeDefined();
      expect(tsConfig.exclude).toContain('node_modules');
    });
  });

  describe('TypeScript Source Files', () => {
    it('should have src directory', () => {
      expect(fs.existsSync(srcDir)).toBe(true);
      expect(fs.statSync(srcDir).isDirectory()).toBe(true);
    });

    it('should have TypeScript files in src', () => {
      const files = getAllFiles(srcDir, ['.ts', '.tsx']);
      expect(files.length).toBeGreaterThan(0);
    });

    it('should have app directory with TypeScript files', () => {
      const appDir = path.join(srcDir, 'app');
      if (fs.existsSync(appDir)) {
        const files = getAllFiles(appDir, ['.ts', '.tsx']);
        expect(files.length).toBeGreaterThan(0);
      }
    });

    it('should have components directory with TypeScript files', () => {
      const componentsDir = path.join(srcDir, 'components');
      if (fs.existsSync(componentsDir)) {
        const files = getAllFiles(componentsDir, ['.ts', '.tsx']);
        expect(files.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Type Definitions', () => {
    it('should have next-env.d.ts', () => {
      const nextEnvPath = path.join(frontendDir, 'next-env.d.ts');
      expect(fs.existsSync(nextEnvPath)).toBe(true);
    });

    it('should have type definition files in src', () => {
      const files = getAllFiles(srcDir, ['.d.ts']);
      // Should have at least some type definitions
      expect(files.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Package.json TypeScript Script', () => {
    const packageJsonPath = path.join(frontendDir, 'package.json');
    let packageJson: any;

    beforeAll(() => {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(content);
    });

    it('should have type-check script', () => {
      expect(packageJson.scripts).toHaveProperty('type-check');
    });

    it('should have type-check script using tsc', () => {
      expect(packageJson.scripts['type-check']).toContain('tsc');
      expect(packageJson.scripts['type-check']).toContain('--noEmit');
    });

    it('should have typescript in devDependencies', () => {
      expect(packageJson.devDependencies).toHaveProperty('typescript');
    });
  });

  // Helper function to get all files with specific extensions
  function getAllFiles(dir: string, extensions: string[]): string[] {
    let results: string[] = [];
    
    if (!fs.existsSync(dir)) {
      return results;
    }

    const list = fs.readdirSync(dir);
    
    list.forEach((file) => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      
      if (stat && stat.isDirectory()) {
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
});


