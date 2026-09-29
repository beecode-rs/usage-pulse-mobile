import { type ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'

type UsageBarProps = {
  accessibilityLabel: string
  fillColor: string
  isRightAnchored?: boolean
  label: string
  percent: number
  valueText: string
}

export const UsageBar = (props: UsageBarProps): ReactElement => {
  const { accessibilityLabel, fillColor, isRightAnchored, label, percent, valueText } = props
  const theme = useTheme()
  const styles = createStyles({ theme })
  const barPercent = Math.min(Math.max(percent, 0), 100)

  return (
    <View style={styles.bar}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{valueText}</Text>
      </View>
      <View
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="progressbar"
        accessibilityValue={{ max: 100, now: Math.round(barPercent) }}
        style={[styles.track, isRightAnchored && styles.trackRightAnchored]}
      >
        <View style={[styles.fill, { backgroundColor: fillColor, width: `${barPercent}%` }]} />
      </View>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    bar: {
      gap: 4,
    },
    barHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    barLabel: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '500',
    },
    barValue: {
      color: theme.muted,
      fontSize: 12,
    },
    fill: {
      borderRadius: 3,
      height: '100%',
    },
    track: {
      backgroundColor: theme.track,
      borderRadius: 3,
      height: 6,
      overflow: 'hidden',
    },
    trackRightAnchored: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  })
}
