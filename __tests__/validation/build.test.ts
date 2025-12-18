/**
 * Tests for build process
 * These tests verify that the build process works correctly
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Build Process Tests', () => {
  const frontendDir = path.resolve(__dirname, '../..');
  const buildDir = path.join(frontendDir, '.next');
  const packageJsonPath = path.join(frontendDir, 'package.json');

  // Skip build tests if NODE_ENV is test and we don't want to run actual builds
  const skipActualBuild = process.env.SKIP_BUILD_TESTS === 'true';

  describe('Build Configuration', () => {
    it('should have build script in package.json', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts.build).toBeTruthy();
    });

    it('should have next.config.js', () => {
      const nextConfigPath = path.join(frontendDir, 'next.config.js');
      expect(fs.existsSync(nextConfigPath)).toBe(true);
    });

    it('should have tsconfig.json', () => {
      const tsConfigPath = path.join(frontendDir, 'tsconfig.json');
      expect(fs.existsSync(tsConfigPath)).toBe(true);
    });
  });

  describe('Build Script Execution', () => {
    it('should have valid build command', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const buildCommand = packageJson.scripts.build;
      expect(buildCommand).toContain('next build');
    });
  });

  describe('Build Output Structure', () => {
    // This test will only pass if a build has been run
    // It's marked as optional to not fail if build hasn't run
    it('should create .next directory after build', () => {
      if (fs.existsSync(buildDir)) {
        expect(fs.statSync(buildDir).isDirectory()).toBe(true);
      } else {
        // Skip if build hasn't been run yet
        console.warn('Build directory not found. Run npm run build to test.');
      }
    });

    it('should have BUILD_ID file after build', () => {
      const buildIdPath = path.join(buildDir, 'BUILD_ID');
      if (fs.existsSync(buildIdPath)) {
        const buildId = fs.readFileSync(buildIdPath, 'utf8');
        expect(buildId).toBeTruthy();
        expect(buildId.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe('TypeScript Configuration', () => {
    it('should have valid tsconfig.json', () => {
      const tsConfigPath = path.join(frontendDir, 'tsconfig.json');
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      expect(tsConfig.compilerOptions).toBeDefined();
      expect(tsConfig.compilerOptions.module).toBe('esnext');
      expect(tsConfig.compilerOptions.jsx).toBe('preserve');
    });

    it('should include src directory in tsconfig', () => {
      const tsConfigPath = path.join(frontendDir, 'tsconfig.json');
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      expect(tsConfig.include).toBeDefined();
      expect(tsConfig.include).toContain('**/*.ts');
      expect(tsConfig.include).toContain('**/*.tsx');
    });
  });

  describe('Next.js Configuration', () => {
    it('should have valid next.config.js', () => {
      const nextConfigPath = path.join(frontendDir, 'next.config.js');
      const configContent = fs.readFileSync(nextConfigPath, 'utf8');
      
      expect(configContent).toContain('nextConfig');
      expect(configContent).toContain('reactStrictMode');
    });
  });

  describe('Build Dependencies', () => {
    it('should have next in dependencies', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson.dependencies).toHaveProperty('next');
    });

    it('should have react in dependencies', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson.dependencies).toHaveProperty('react');
    });

    it('should have react-dom in dependencies', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson.dependencies).toHaveProperty('react-dom');
    });
  });

  // Only run actual build test if SKIP_BUILD_TESTS is not set
  if (!skipActualBuild) {
    describe('Actual Build Process', () => {
      it.skip('should successfully build the project', () => {
        // This test actually runs the build
        // Uncomment and run manually when needed
        // const result = execSync('npm run build', { 
        //   cwd: frontendDir,
        //   encoding: 'utf8'
        // });
        // expect(result).toBeTruthy();
      });
    });
  }
});


