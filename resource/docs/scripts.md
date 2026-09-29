# Scripts

| Script                                                   | Purpose                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| `pnpm typecheck`                                         | `tsc --noEmit`                                                  |
| `pnpm test:contract`                                     | vitest contract yaml + `*.test.ts` under `src/`                 |
| `pnpm lint`                                              | prettier `--check` + eslint + jsonsort check                    |
| `pnpm lint-fix`                                          | same, in write mode                                             |
| `pnpm start`                                             | start the Expo dev server                                       |
| `pnpm android` / `pnpm ios` / `pnpm web`                 | start the dev server for one platform                           |
| `pnpm android-rebuild`                                   | clean prebuild + release-variant install on Android             |
| `pnpm android-release`                                   | release-variant install on Android, without the clean prebuild  |
| `pnpm ios-rebuild`                                       | clean prebuild + release-variant install on iOS (best effort)   |
| `pnpm release:patch` / `release:minor` / `release:major` | bump, tag, and push a release (see [Releasing](./releasing.md)) |
| `pnpm exec expo export --platform android`               | bundle verification                                             |
