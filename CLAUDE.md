# CLAUDE.md

Guidance for AI assistants working in this repository.

## Skills

Always load and follow the `writing-clean-ts` skill
(`~/.claude/skills/writing-clean-ts/SKILL.md`) before writing, refactoring,
or scaffolding any code here. Its conventions apply to all TypeScript files
in this repository: kebab-case filenames, one element per file, object params
in business layers, no comments, and the rest of its rules. For tests, use
the `contract-testing-ts` skill.

## Commands

This project uses pnpm. Quality gates (run before declaring any task done):

```bash
pnpm typecheck                            # tsc --noEmit
pnpm test:contract                        # vitest contract yaml + *.test.ts under src/
pnpm lint                                 # prettier --check + eslint + jsonsort check
pnpm exec expo export --platform android  # bundle verification
```

`pnpm lint-fix` runs the same lint pipeline in write mode; run it on newly
created files before the `pnpm lint` gate.

## Structure

- `src/app/` - Expo Router routes. Every file is a screen; `_layout.tsx`
  files define navigators. Keep route files thin: components and business
  logic live outside this folder.
- `src/business/` - domain code, mirroring the desktop layout:
  - `enum/` - enums (one per file, kebab-case)
  - `model/` - types and models (no enums in here)
  - `schema/` - zod schemas
  - `service/` - services (classes or plain-object utils with object params)
  - `store/` - zustand store
  - `util/` - business utilities
- `src/ui-component/` - React Native components, grouped per screen
  (`dashboard/`, `connection/`).
- `src/util/` - shared utilities: `theme.ts` (desktop color tokens),
  `constant.ts` (all constants), presentation utils.

Imports use the `@/` alias (mapped to `./src/*` in `tsconfig.json`), without
file extensions (the Expo bundler resolves them).

## Testing

Prefer contract yaml tests (`*.contract.yaml` run by
`@beecode/msh-test-contractor`) over Vitest unit tests; fall back to
`*.test.ts` only when yaml cannot express the case. Contract `params:` lists
are positional: a method taking one object param lists ONE item holding all
keys together. See existing `*.contract.yaml` files for the pattern.

## Desktop contract mirror

`src/business/model` and `src/business/schema` are a hand-maintained mirror
of the desktop wire contract in `../usage-pulse`
(`src/shared/business/model/mobile-api-model.ts` and
`src/main/business/schema/mobile-api-schema.ts`, plus the snapshot models and
enums). There is no code generation: when the desktop contract changes, copy
the changes here by hand, keeping names and string values identical, and run
`pnpm test:contract` in both repositories.
