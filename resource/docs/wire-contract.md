# Keeping the wire contract in sync

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
