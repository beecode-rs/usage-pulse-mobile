Guidance for AI assistants working in this repository. This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Skills

Always load and follow the `writing-clean-ts` skill
(`~/.claude/skills/writing-clean-ts/SKILL.md`) before writing, refactoring,
or scaffolding any code here. Its conventions apply to all TypeScript files
in this repository: kebab-case filenames, one element per file, object params
in business layers, no comments, and the rest of its rules. For tests, use
the `contract-testing-ts` skill.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

### Project quality gates (usage-pulse-mobile)

This project uses pnpm. Every task must pass these gates before it is done:

```bash
pnpm typecheck                            # tsc --noEmit
pnpm test:contract                        # vitest contract yaml + *.test.ts under src/
pnpm lint                                 # prettier --check + eslint + jsonsort check
pnpm lint-fix                             # same, in write mode
pnpm exec expo export --platform android  # bundle verification
```

`pnpm lint-fix` runs the same lint pipeline in write mode; run it on newly
created files before the `pnpm lint` gate.

## Structure

- `src/app/` - Expo Router routes. Every file is a screen; `_layout.tsx`
  files define navigators. Keep route files thin: components, hooks, and
  business logic live outside this folder.
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

## Navigation & Routing

- Use **Expo Router** for all navigation.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Testing

Prefer contract yaml tests (`*.contract.yaml` run by
`@beecode/msh-test-contractor`) over Vitest unit tests; fall back to
`*.test.ts` only when yaml cannot express the case. See existing
`*.contract.yaml` files for the pattern.

### Contract yaml params are positional

In `*.contract.yaml` files, the `params:` list is spread as POSITIONAL
arguments onto the subject. A method that takes one object param must list
ONE item holding all keys together (`- message: {...}\n  state: {...}`);
separate list items become separate arguments and the extras are silently
dropped. `params: []` calls a zero-arg scenario.

## React Native style typing gotchas

- `fontWeight` must come from RN's enumerated set (`'600'`, `'bold'`, ...);
  CSS-only values like `'650'` are TS2322 errors even though the desktop CSS
  uses them.
- Percentage widths in styles must be `${number}%` template literals
  (`` width: `${fillPercent}%` ``); interpolating `String(x)` widens the type
  to `${string}%`, which `DimensionValue` rejects.
- Theme hex values live in `src/util/theme.ts` (copied from the desktop
  `usage-dashboard.css` `:root`); import from there instead of inlining hex.

## Desktop contract mirror

`src/business/model` and `src/business/schema` are a hand-maintained mirror
of the desktop wire contract in `../usage-pulse`
(`src/shared/business/model/mobile-api-model.ts` and
`src/main/business/schema/mobile-api-schema.ts`, plus the snapshot models and
enums). There is no code generation: when the desktop contract changes, copy
the changes here by hand, keeping names and string values identical, and run
`pnpm test:contract` in both repositories.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
