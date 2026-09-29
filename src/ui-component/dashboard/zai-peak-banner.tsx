import { type ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { type ProviderIdMapper } from '@/business/enum/provider-id-mapper-enum'
import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { ZaiPeakUtil } from '@/business/util/zai-peak-util'
import { PeakIcon } from '@/ui-component/icon/peak-icon'

type ZaiPeakBannerProps = {
  nowMs: number
  providerId: ProviderIdMapper
}

const resolveActiveTooltipText = (params: {
  peakRemainingText: string | undefined
  peakWindowText: string
}): string => {
  const { peakRemainingText, peakWindowText } = params
  return [
    `3× peak ends in ${peakRemainingText ?? 'under 1m'}.`,
    'Premium models are billed at 3× credits during peak hours and 1× off-peak.',
    `Peak hours are weekdays 14:00–18:00 (UTC+8) — ${peakWindowText} your time.`,
  ].join('\n')
}

const resolveInactiveTooltipText = (params: { peakWindowText: string }): string => {
  const { peakWindowText } = params
  return [
    'Premium models are billed at 3× credits during peak hours and 1× off-peak.',
    'Peak hours are weekdays 14:00–18:00 (UTC+8).',
    `Your local peak window: ${peakWindowText}.`,
  ].join('\n')
}

export const ZaiPeakBanner = (props: ZaiPeakBannerProps): ReactElement | null => {
  const { nowMs, providerId } = props
  const theme = useTheme()
  const styles = createStyles({ theme })
  const zaiPeakUtil = new ZaiPeakUtil()
  const peakInfo = zaiPeakUtil.resolvePeakInfo({ nowMs, providerId })

  if (peakInfo === undefined) {
    return null
  }

  if (peakInfo.isPeakHour) {
    const peakRemainingPercent = zaiPeakUtil.resolvePeakRemainingPercent({ nowMs, providerId }) ?? 0
    const peakRemainingText = zaiPeakUtil.resolvePeakRemainingText({ nowMs, providerId })

    return (
      <View
        accessibilityLabel={resolveActiveTooltipText({
          peakRemainingText,
          peakWindowText: peakInfo.peakWindowText,
        })}
        style={[styles.banner, styles.bannerActive]}
      >
        <View style={styles.bannerLine}>
          <PeakIcon color={theme.warning} />
          <Text style={[styles.bannerText, styles.bannerTextActive]}>
            {`3× peak ends in ${peakRemainingText ?? 'under 1m'}`}
          </Text>
        </View>
        <View
          accessibilityLabel="Time remaining in z.ai peak hours"
          accessibilityRole="progressbar"
          accessibilityValue={{ max: 100, now: Math.round(peakRemainingPercent) }}
          style={styles.progressTrack}
        >
          <View style={[styles.progressFill, { width: `${peakRemainingPercent}%` }]} />
        </View>
      </View>
    )
  }

  return (
    <View
      accessibilityLabel={resolveInactiveTooltipText({ peakWindowText: peakInfo.peakWindowText })}
      style={styles.banner}
    >
      <View style={styles.bannerLine}>
        <PeakIcon color={theme.muted} />
        <Text style={styles.bannerText}>{`Peak hours ${peakInfo.peakWindowText} your time`}</Text>
      </View>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    banner: {
      backgroundColor: theme.subtleTint,
      borderRadius: 8,
      gap: 6,
      padding: 10,
    },
    bannerActive: {
      backgroundColor: theme.warningTint,
    },
    bannerLine: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    bannerText: {
      color: theme.muted,
      fontSize: 12,
    },
    bannerTextActive: {
      color: theme.warning,
      fontWeight: '600',
    },
    progressFill: {
      backgroundColor: theme.warning,
      borderRadius: 1,
      height: '100%',
    },
    progressTrack: {
      backgroundColor: theme.warningTrack,
      borderRadius: 1,
      flexDirection: 'row',
      height: 2,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
  })
}
