# AGENT.md - packages/config

This package provides shared configuration for the monorepo, including ESLint and TypeScript base configs.

## Core responsibilities

- Define authoritative linting and style rules.
- Provide shareable ESLint configs for different project types (Next.js, NestJS, Expo, Base).
- Ensure consistent coding standards across all apps and packages.

## Rules

- Configurations must be exportable and consumable by other packages.
- Do not include project-specific logic here; keep it generic.
- Do not introduce circular dependencies.
- Changes here affect the entire repository; test impact found globally.

## Available Configs

- `eslint/base`: Base TypeScript/JS config.
- `eslint/next`: Config for Next.js apps (`apps/web`).
- `eslint/nest`: Config for NestJS apps (`apps/api`).
- `eslint/expo`: Config for Expo apps (`apps/mobile`).

## Commands (root)

- Lint: `pnpm --filter @sd/config lint`
