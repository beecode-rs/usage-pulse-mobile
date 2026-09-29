# Releasing

Releases are tag-driven. From `main`:

```bash
pnpm release:patch   # or release:minor / release:major
```

That bumps the version (`package.json` + `app.json`, including `android.versionCode` and `ios.buildNumber`), commits, tags `v<version>`, and pushes. GitHub Actions then runs the quality gate, builds the Android APK and the unsigned iOS IPA — failing if the tag does not match the version in `app.json` — and publishes both to the Releases page with auto-generated notes. The workflow can also be run manually from the Actions tab as a dry run: it builds both artifacts but skips the release step.

The script pushes to the `github` remote when one exists, otherwise `origin`. If you keep Gitea as `origin`, add the GitHub remote once:

```bash
git remote add github git@github.com:beecode-rs/usage-pulse-mobile.git
```

## One-time Android signing setup

The keystore is **not** generated in CI. The workflow only decodes the
`ANDROID_KEYSTORE_BASE64` secret into `android/app/upload.jks` at build time
(the "Decode release keystore" step in `.github/workflows/release.yml`). The
key is created manually, once, from outside this repository — keep the
original somewhere durable that is not the repo (a personal keystore folder,
a password manager vault, an encrypted backup). Without it, future releases
cannot install as updates over existing installs.

Generate it (`keytool` ships with any JDK):

```bash
mkdir -p ~/keystores
keytool -genkey -v \
  -keystore ~/keystores/usage-pulse-upload.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias usage-pulse-upload
```

`keytool` prompts for the keystore and key passwords (one password for both
is fine) and a distinguished name (name, organization, city — the values are
informational). Save the password in a password manager immediately; it
cannot be recovered from the file.

Verify the key and note the SHA-256 certificate fingerprint:

```bash
keytool -list -v -keystore ~/keystores/usage-pulse-upload.jks
```

Encode the file for the GitHub secret:

```bash
base64 -i ~/keystores/usage-pulse-upload.jks
```

Then add these secrets to the GitHub repository:

| Secret                               | Value                   |
| ------------------------------------ | ----------------------- |
| `ANDROID_KEYSTORE_BASE64`            | the base64 output above |
| `USAGE_PULSE_ANDROID_STORE_PASSWORD` | the keystore password   |
| `USAGE_PULSE_ANDROID_KEY_ALIAS`      | `usage-pulse-upload`    |
| `USAGE_PULSE_ANDROID_KEY_PASSWORD`   | the key password        |
