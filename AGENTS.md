# Repository Guidelines

## Project Structure & Module Organization
This repository is a Bun-based Turborepo. Main applications live in `apps/`:

- `apps/web`: Next.js 16 frontend using the App Router. Routes are under `app/`, shared UI is in `components/`, helpers in `lib/`, hooks in `hooks/`, and static assets in `public/`.
- `apps/api`: Elysia API server. Entry point is `src/index.ts`; domain modules live in `src/domain/`, plugins in `src/plugins/`, and email templates in `src/email/`.
- `packages/ui`: shared React UI primitives in `src/`.
- `packages/eslint-config` and `packages/typescript-config`: shared tooling presets.

## Build, Test, and Development Commands
Use Bun at the repo root (`bun install` if dependencies are missing).

- `bun run dev`: starts all workspace dev tasks through Turbo.
- `bun run build`: builds all apps/packages.
- `bun run lint`: runs workspace lint tasks.
- `bun run check-types`: runs type checks where configured.
- `bun run format`: formats `*.ts`, `*.tsx`, and `*.md` from the repo root.
- `cd apps/web && bun run dev`: runs the frontend only on port 3000.
- `cd apps/api && bun run dev`: runs the API only on port 3001 with watch mode.

## Coding Style & Naming Conventions
TypeScript is the default across the repo. In `apps/web`, Biome enforces 2-space indentation, import organization, and React/Next lint rules; run `cd apps/web && bun run format` before large UI edits. Shared packages use ESLint. Follow existing naming patterns: route files use Next conventions (`page.tsx`, `layout.tsx`), reusable components use kebab-case filenames such as `create-bill.tsx`, and React exports use PascalCase.

## Testing Guidelines
There is no meaningful automated test suite yet. `apps/api` still contains the placeholder `test` script, so contributors should treat `bun run lint`, `bun run check-types`, and focused manual verification as the minimum gate. When adding tests, place them next to the feature or under a local `__tests__/` folder and use `*.test.ts` / `*.test.tsx`.

## Commit & Pull Request Guidelines
Recent history mostly follows Conventional Commit prefixes such as `feat:`, `fix:`, `refactor:`, and `chore:`. Prefer that format and keep subjects imperative and specific, for example `fix: correct bill total rounding`. Pull requests should include a short scope summary, linked issue or task, environment notes for config changes, and screenshots or recordings for `apps/web` UI changes.

## Configuration Tips
Turbo tasks include `.env*` as build inputs, so document new environment variables in the PR. Do not commit secrets; keep local values in untracked env files.
