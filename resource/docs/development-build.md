# Development build

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
