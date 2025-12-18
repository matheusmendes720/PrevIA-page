# CRUSH - Frontend Project Guidelines

## Commands

**Development:**
- `npm run dev` - Start Next.js dev server (port 3003)
- `npm run dev:bun` - Fast Bun-based dev server
- `npm run build` - Build production version
- `npm run start` - Start production server

**Testing:**
- `npm run test` - Run all tests
- `npm run test:watch` - Jest watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ci` - CI mode with coverage
- `npx jest --testNamePattern="pattern"` - Run tests by name pattern
- `npx jest path/to/test.test.tsx` - Run single test file
- `npm run test:5g` - Run 5G feature tests with coverage
- `npm run test:5g:watch` - Watch 5G tests
- `npm run test:5g:chart` - Chart-specific tests
- `npm run test:5g:page` - Page component tests
- `npm run test:5g:integration` - Integration tests
- `npm run test:validation` - Validation test suite
- `npm run test:validation:watch` - Watch validation tests

**Quality:**
- `npm run lint` - ESLint check (next/core-web-vitals)
- `npm run lint:fix` - Auto-fix lint issues
- `npm run type-check` - TypeScript type checking
- `npm run validate:quick` - Quick validation (type-check + lint + test)
- `npm run validate:full` - Full validation pipeline
- `npm run pre-push` - Pre-push validation hook

**Monitoring:**
- `npm run watch:logs` - Console log monitoring
- `npm run watch:logs:mcp` - MCP-based log watching

## Code Style

**Imports:**
- React: `import React from 'react'`
- Hooks: `import { useState, useEffect } from 'react'`
- Types: `import { CardProps } from '../types'`
- Components: `import Component from '@/components/Component'` (@ alias → src/)
- Testing: `import { render, screen } from '@testing-library/react'`

**Naming:**
- Components: PascalCase (`Card`, `Dashboard`)
- Functions/Variables: camelCase (`generateMockData`)
- Files: kebab-case (`card.tsx`, `five-g-expansion-chart.tsx`)
- Test files: `component-name.test.tsx` in `__tests__/` directory

**TypeScript:**
- Interfaces for props: `interface ComponentProps { ... }`
- React.FC type: `const Component: React.FC<Props> = ({ prop }) => { ... }`
- Optional props: `prop?: Type`
- React.ReactNode for children
- strict: false, path aliases: `@/` → `src/`
- Use error boundaries with proper typing

**React Patterns:**
- 'use client' directive for client components
- Functional components only (except ErrorBoundary)
- Default exports: `export default Component`
- Destructure props in signature
- Tailwind classes for styling
- JSDoc for complex functions

**Error Handling:**
- Wrap components in ErrorBoundary
- Console.error for logging
- User-friendly error messages in Portuguese
- Graceful fallbacks

**Testing:**
- Jest with Next.js config, jsdom environment
- testMatch: `**/__tests__/**/*.test.[jt]s?(x)`
- Mock Next.js components: `jest.mock('next/script', ...)`
- Testing-library for DOM testing
- MSW for API mocking
- Coverage collection from src/ (exclude .d.ts, stories)
- moduleNameMapper: @/ → src/