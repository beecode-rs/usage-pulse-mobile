# Keeping the wire contract in sync

## The wire protocol

- The desktop's Electron main process embeds a token-protected HTTP +
  WebSocket server bound to `0.0.0.0:<port>` (default `8787`, valid range
  1024 to 65535). The pairing token is a 48-character hex string, shown and
  regenerable on the desktop app's **Mobile** page.
- REST: `GET /api/health` (health check) and `GET /api/state` (full
  hydration), both requiring `Authorization: Bearer <token>`.
- WebSocket: `/ws` authenticated with `?token=` on the upgrade (React Native
  WebSocket cannot set headers). On every (re)connection the server
  immediately pushes a full `state` message, so reconnects never show stale
  data. Afterwards it pushes live events: `usage-snapshot`,
  `sessions-snapshot`, `session-finished`, `session-waiting`,
  `usage-warning`, and `heartbeat`.
- Stability: a server heartbeat every 30 s (protocol ping plus an app-level
  `heartbeat` message, because React Native cannot observe protocol pings), a
  client liveness watchdog (75 s without any message forces a reconnect), and
  client auto-reconnect with exponential backoff (1 s doubling, capped at
  30 s, reset after a successful connection).
- The transport is plaintext HTTP/WS. That is acceptable because this is a
  personal tool confined to the VPN/LAN; the token prevents casual access
  from other machines on the same networks. There is no TLS.

## Keeping the model and schema mirror in sync

`src/business/model` and `src/business/schema` are a hand-maintained mirror
of the desktop contract. There is no code generation. When the desktop side
changes, update the mobile copies to match:

- Desktop `../usage-pulse/src/shared/business/model/mobile-api-model.ts`
  mirrors to `src/business/model/mobile-api-model.ts`
  (plus `usage-model.ts` / `session-model.ts` and the enums in
  `src/business/enum/`, copied verbatim with the same names and string
  values).
- Desktop `../usage-pulse/src/main/business/schema/mobile-api-schema.ts`
  mirrors to `src/business/schema/mobile-api-schema.ts`.

Run `pnpm test:contract` in both repositories after any change; the schema
contract tests on both sides pin the same wire shapes.
