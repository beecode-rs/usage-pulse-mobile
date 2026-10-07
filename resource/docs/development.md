# Development setup

Requires [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io).

## Tech stack

Built with Expo (React Native, TypeScript, Expo Router), on Expo SDK 57 / React Native 0.86 / React 19. State is zustand, schemas are zod, settings persist in AsyncStorage, and contract tests run on Vitest. pnpm is the package manager.

## Daily commands

All defined in `package.json`:

```bash
pnpm start         # start the Expo dev server (needs a dev build on the device)
pnpm android       # start for Android
pnpm ios           # start for iOS
pnpm typecheck     # tsc --noEmit
pnpm lint          # prettier + eslint + jsonsort checks
pnpm test:contract # contract tests
```

The full list, including rebuild and release scripts, is in [Scripts](./scripts.md).

## Development builds

Expo Go cannot exercise notifications, and the app talks cleartext HTTP/WS to
the desktop, so on-device verification needs a local build. Local builds are
named **Usage Pulse Mobile (dev)**: the build scripts set `APP_VARIANT=dev`
and an `app.config.ts` appends " (dev)" to the app name, so development
installs are distinguishable from release installs. CI and release builds
keep the plain name.

Android is the reference platform; iOS is best effort:

```bash
pnpm android-rebuild   # clean prebuild + release-variant install
pnpm ios-rebuild       # best effort
```

Requires a connected device or emulator with USB debugging, plus the Android
SDK. Expo Go still cannot exercise notifications — use these builds for
on-device verification.

## iOS caveat

Android is configured with `expo.android.usesCleartextTraffic: true` because
`http://` and `ws://` are both cleartext. On iOS, release builds enforce App
Transport Security restrictions that may need extra configuration to allow
cleartext traffic. This is untested in this repository; iOS support is best
effort.

## Related docs

- [Scripts](./scripts.md) — every command and what it runs
- [Releasing](./releasing.md) — tag-driven releases and the one-time Android signing setup
- [Wire contract](./wire-contract.md) — the wire protocol and keeping the model/schema mirror in sync
