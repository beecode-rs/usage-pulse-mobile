# Peak hours tab above the usage card

The desktop app (`usage-pulse`) recently redesigned the z.ai peak-hours banner: instead of a rounded pill inside the card, it is now a **flat tab merged into the card's top edge** — a two-level block where the tab grows out of the card. This document explains how to replicate that design here.

Reference implementation (desktop):

- `usage-pulse/src/renderer/src/ui-component/usage-dashboard/provider-usage-card.tsx`
- `usage-pulse/src/renderer/src/ui-component/usage-dashboard/usage-dashboard.css` (`.provider-card-wrap`, `.provider-card-peak-banner`)

## Target look

```
   /----------------------------------\
   | ⚡ Peak hours 08:00–12:00         |   ← tab: flat ~24px, hairline border,
   |----------------------------------|      top corners rounded, inset from
   |  header                          |      both sides, merged into the card
   |  usage meters …                  |
   \----------------------------------/
```

- The tab is a **separate level above the card**, slightly narrower than the card (inset on both sides, matching the card's horizontal padding).
- It **merges with the card**: no gap, no bottom rounding, its bottom border forms the seam line between the two levels, and it overlaps the card's own top border by 1px so the seam renders as a single hairline.
- During peak hours the tab switches to the warning tint, shows the `3× peak ends in …` countdown, and a thin progress line runs along the seam.
- Cards for providers without peak hours (Claude, …) render no tab — just the card.

## Current state (mobile)

- `src/ui-component/dashboard/usage-tracker-card.tsx` renders `<ZaiPeakBanner />` **inside** the card, between the header and the body (line ~185), so it reads as a middle section, not a level above the block.
- `src/ui-component/dashboard/zai-peak-banner.tsx` styles the banner as a standalone rounded pill (`borderRadius: 8`, `theme.subtleTint` background, `padding: 10`), with the progress track in normal flow below the text.

## Changes

### 1. Move the banner above the card (`usage-tracker-card.tsx`)

Wrap the tab and the card in one container and render the banner as the card's previous sibling:

```tsx
return (
  <View style={styles.cardWrap}>
    <ZaiPeakBanner nowMs={now} providerId={providerSnapshot.providerId} />
    <View style={[styles.card, isPeakHour && styles.cardPeakActive, isSnapshotStale && styles.cardStale]}>
      <View style={styles.cardHeader}>
        {/* …unchanged header content… */}
      </View>
      {renderBody()}
    </View>
  </View>
)
```

- Delete the `<ZaiPeakBanner … />` line that currently sits between `</View>` (header) and `{renderBody()}`.
- The card's existing `gap: 12` keeps spacing between header and body; the banner no longer participates in it.
- `ZaiPeakBanner` already returns `null` for non-z.ai providers, so those cards render the wrap with only the card inside — no JSX branching needed.

### 2. Restyle the banner as the tab (`zai-peak-banner.tsx`)

Replace the `banner` and `progressTrack` entries in `createStyles` (keep `bannerLine`, `bannerText*`, `progressFill` as they are):

```ts
banner: {
  backgroundColor: theme.card,
  borderColor: theme.hairline,
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  borderWidth: 1,
  height: 24,
  justifyContent: 'center',
  marginBottom: -1,
  marginHorizontal: 14,
  paddingHorizontal: 12,
  zIndex: 1,
},
bannerActive: {
  backgroundColor: theme.warningTint,
},
progressTrack: {
  backgroundColor: theme.warningTrack,
  bottom: 0,
  flexDirection: 'row',
  height: 2,
  justifyContent: 'flex-end',
  left: 10,
  overflow: 'hidden',
  position: 'absolute',
  right: 10,
},
```

Remove from the old `banner` style: `borderRadius: 8`, `gap: 6`, `padding: 10`.

Why each piece:

| Style | Purpose |
| --- | --- |
| `height: 24` | Fixed, flat tab. Yoga measures `height` border-box, so 24px includes the 2px of borders — the 12px text and 13px icon center comfortably. |
| `marginHorizontal: 14` | Matches the card's `padding: 14`, so the tab is inset exactly one card-padding from each side ("full width, a bit narrow"). |
| `marginBottom: -1` | Pulls the card up 1px so the tab's bottom border and the card's top border occupy the same pixel — one seam line, not two. |
| `borderTopLeftRadius/TopRight: 8` (no bottom rounding) | Square bottom corners meet the card edge flush; only the protruding top corners are rounded. |
| `borderWidth: 1` all around | The bottom border is deliberate: it is the separator line between the tab level and the card level. |
| `backgroundColor: theme.card` | Opaque card surface, matching the card so the two levels read as one block. |
| `zIndex: 1` | The banner renders before the card sibling; `zIndex` keeps the tab's border painting above the card's top border at the overlap. |
| `position: 'absolute'` progress track | The countdown line runs along the tab's bottom edge (the seam) instead of stacking under the text — that is what keeps the tab 24px flat. `justifyContent: 'flex-end'` keeps the fill right-anchored as it drains. |

### 3. Card styles (`usage-tracker-card.tsx`)

`card`, `cardPeakActive`, `cardStale` stay unchanged. Optionally add an explicit (empty for now) `cardWrap` style entry so the two-level container is visible in the stylesheet:

```ts
cardWrap: {},
```

No reserved top padding is needed today: the dashboard renders cards in a single-column `ScrollView` (`src/app/index.tsx`), so there is no row-stretch alignment to compensate for. **If a grid/tablet stretch layout is ever introduced**, reserve the tab slot on every card the way the desktop does — a fixed offset (24px tab minus the 1px overlap = 23px) applied as top padding on the wrap for all cards, with the tab pulling back up via a matching negative top margin (desktop: `--provider-card-tab-offset: 23px`). Expose the number once (e.g. `constant.usageCard.tabOffset`) so the tab height and the reservation cannot drift apart.

## Verification

1. `pnpm lint-fix && pnpm lint`
2. Run the app and open the dashboard:
   - z.ai tracker: tab merged into the top of the card, one hairline seam, countdown + progress line along the seam during peak hours (weekdays 14:00–18:00 UTC+8), tinted text outside them.
   - Claude (or any non-z.ai) tracker: card only, unchanged.
3. Screen reader (`accessibilityLabel` on the banner root) should still announce the same tooltip text.
