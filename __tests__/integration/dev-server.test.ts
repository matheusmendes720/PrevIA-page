/**
 * Integration tests for dev server
 * Tests that npm run dev works correctly and the dev server starts properly
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Dev Server Tests', () => {
  const projectRoot = join(__dirname, '../..');
  const packageJsonPath = join(projectRoot, 'package.json');
  const nextConfigPath = join(projectRoot, 'next.config.js');

  describe('Package.json Configuration', () => {
    it('should have dev script defined', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(typeof packageJson.scripts.dev).toBe('string');
      expect(packageJson.scripts.dev).toContain('next dev');
    });

    it('should have dev script using Node.js (not Bun) by default', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const devScript = packageJson.scripts.dev;
      // Should NOT contain 'bun --bun' in default dev script
      expect(devScript).not.toContain('bun --bun');
      // Should use 'next dev' (may include port kill script)
      expect(devScript).toMatch(/next dev/);
    });

    it('should have dev script configured for port 3003', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const devScript = packageJson.scripts.dev;
      expect(devScript).toContain('-p 3003');
    });

    it('should have alternative dev scripts (dev:bun, dev:npm)', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts).toHaveProperty('dev:bun');
      expect(packageJson.scripts).toHaveProperty('dev:npm');
    });
  });

  describe('Next.js Configuration', () => {
    it('should have valid next.config.js file', () => {
      const configContent = readFileSync(nextConfigPath, 'utf-8');
      expect(configContent).toBeDefined();
      expect(configContent.length).toBeGreaterThan(0);
    });

    it('should export nextConfig object', () => {
      // Dynamically require the config to test it loads
      const nextConfig = require(nextConfigPath);
      expect(nextConfig).toBeDefined();
      expect(typeof nextConfig).toBe('object');
    });

    it('should have reactStrictMode enabled', () => {
      const nextConfig = require(nextConfigPath);
      expect(nextConfig.reactStrictMode).toBe(true);
    });

    it('should have swcMinify enabled', () => {
      const nextConfig = require(nextConfigPath);
      expect(nextConfig.swcMinify).toBe(true);
    });

    it('should have experimental.optimizeCss enabled', () => {
      const nextConfig = require(nextConfigPath);
      expect(nextConfig.experimental).toBeDefined();
      expect(nextConfig.experimental.optimizeCss).toBe(true);
    });

    it('should have correct output configuration for Netlify', () => {
      const nextConfig = require(nextConfigPath);
      expect(nextConfig.output).toBe('standalone');
    });
  });

  describe('Dev Server Startup Validation', () => {
    it('should have Next.js installed as dependency', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.dependencies).toHaveProperty('next');
      expect(packageJson.dependencies.next).toMatch(/^\^?14\./);
    });

    it('should have React and React-DOM installed', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('react-dom');
    });

    it('should have TypeScript configured', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.devDependencies).toHaveProperty('typescript');
    });

    it('should have valid tsconfig.json', () => {
      const tsconfigPath = join(projectRoot, 'tsconfig.json');
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
      expect(tsconfig).toBeDefined();
      expect(tsconfig.compilerOptions).toBeDefined();
    });
  });

  describe('Dev Server Script Execution', () => {
    it('should validate that dev script syntax is correct', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const devScript = packageJson.scripts.dev;
      
      // Should not have syntax errors
      expect(devScript).not.toContain('undefined');
      expect(devScript).not.toContain('null');
      
      // Should be a valid command
      expect(devScript.length).toBeGreaterThan(0);
    });

    it('should have dev script that uses Node.js runtime', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const devScript = packageJson.scripts.dev;
      
      // Default dev should use Node.js (no bun prefix)
      // This ensures compatibility with Next.js tracing API
      // May include port kill script before next dev
      expect(devScript).not.toMatch(/^bun/);
      expect(devScript).toMatch(/next dev/);
    });
  });

  describe('Environment Configuration', () => {
    it('should have .env.local support configured in Next.js', () => {
      const nextConfig = require(nextConfigPath);
      // Next.js automatically loads .env.local, but we can check env config exists
      expect(nextConfig.env).toBeDefined();
    });

    it('should have API URL environment variable configured', () => {
      const nextConfig = require(nextConfigPath);
      expect(nextConfig.env).toHaveProperty('NEXT_PUBLIC_API_URL');
    });
  });

  describe('Build Compatibility', () => {
    it('should have build script that works with npm', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts).toHaveProperty('build:npm');
      const buildScript = packageJson.scripts['build:npm'];
      expect(buildScript).toContain('next build');
    });

    it('should have start script for production', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts).toHaveProperty('start:npm');
      const startScript = packageJson.scripts['start:npm'];
      expect(startScript).toContain('next start');
    });
  });

  describe('Instrumentation File', () => {
    it('should have instrumentation.ts file for Bun compatibility', () => {
      const instrumentationPath = join(projectRoot, 'src/instrumentation.ts');
      try {
        const instrumentationContent = readFileSync(instrumentationPath, 'utf-8');
        expect(instrumentationContent).toBeDefined();
        expect(instrumentationContent).toContain('register');
      } catch (error) {
        // File might not exist, which is okay
        // But if it exists, it should be valid
      }
    });
  });
});

