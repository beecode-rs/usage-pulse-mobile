# Features

The detail behind the README's feature list: what each feature does, its
settings, and its edge cases.

## Dashboard

<img src="../screenshots/dashboard.png" height="480" alt="Dashboard with usage cards and session rows" />

<img src="../screenshots/dashboard-waiting-working.png" height="480" alt="Dashboard with a Claude Code session in progress" />

The dashboard mirrors the desktop app: one usage card per tracker plus live
session rows, updated over the WebSocket connection. On every (re)connection
the desktop pushes a full state snapshot first, so the dashboard never shows
stale data; if the connection drops, the app reconnects automatically. The
app is read-only — it has no controls for the desktop.

## Notifications

<img src="../screenshots/notification-session-finished.png" height="480" alt="Local notification shown when a session finishes" />

When a session finishes (transitions from BUSY or WAITING to IDLE), a session
starts waiting for your input, a usage window crosses the 85% (high usage) or
95% (limit reached) threshold upward, or a tracker enters an error state, the
app shows a local notification. On Android these use the `usage-pulse-alerts`
channel, or a per-sound channel when a custom notification sound is
configured (see [Sounds](#sounds) below).

Limitations:

- Notifications are local only (no push relay, no accounts). They are
  delivered while the app is running and connected, in the foreground or
  backgrounded-but-alive. They are **not** delivered when the app has been
  killed.
- `expo-notifications` does not work inside Expo Go (SDK 53+). Verify
  notifications with a [development build](./development.md).

## Sounds

Each notification event has its own sound setting — one for session finished,
one for session waiting. The options are System default, None (silent), and
six bundled `.wav` sounds: Beep, Chime, Ding, Fanfare, Ping, and Success.
Tapping an option in settings previews the sound. Defaults are Success for
session finished and Chime for session waiting.

On Android, notifications without a custom sound use the "Usage Pulse alerts"
channel (`usage-pulse-alerts`); each custom sound gets its own channel
("Session alerts · \<sound\>"), so Android's per-channel notification
settings keep working.

## Settings

<img src="../screenshots/settings-connection.png" height="480" alt="Connection settings with host, port, and pairing token" />

**Connection** — host, port, and pairing token for the desktop server.
**Test connection** verifies the setup and reports the exact failure:
success with the desktop app version, an unauthorized error for a bad
token, or a network failure. Saved settings live in the app's on-device
storage, so a reinstall loses them.

<img src="../screenshots/settings-system.png" height="480" alt="App settings with theme and notification sound" />

**System** — theme (light, dark, or auto to follow the system setting) and
the per-event notification sound pickers.

The settings screen opens from the **Settings** link in the dashboard's
connection banner.
