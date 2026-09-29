This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

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

### Contract yaml params are positional

In `*.contract.yaml` files, the `params:` list is spread as POSITIONAL
arguments onto the subject. A method that takes one object param must list
ONE item holding all keys together (`- message: {...}\n  state: {...}`);
separate list items become separate arguments and the extras are silently
dropped. `params: []` calls a zero-arg scenario.

### React Native style typing gotchas

- `fontWeight` must come from RN's enumerated set (`'600'`, `'bold'`, ...);
  CSS-only values like `'650'` are TS2322 errors even though the desktop CSS
  uses them.
- Percentage widths in styles must be `${number}%` template literals
  (`` width: `${fillPercent}%` ``); interpolating `String(x)` widens the type
  to `${string}%`, which `DimensionValue` rejects.
- Theme hex values live in `src/util/theme.ts` (copied from the desktop
  `usage-dashboard.css` `:root`); import from there instead of inlining hex.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
