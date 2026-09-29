import { type ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { constant } from '@/util/constant'
import { WarningIcon } from '@/ui-component/icon/warning-icon'

const resolveStaleTooltipText = (params: { fetchedAt?: number }): string => {
  const { fetchedAt } = params

  if (fetchedAt === undefined) {
    return 'Usage data is stale — older than the tracker refresh interval.'
  }

  return `Usage data is stale — last fetched ${new Date(fetchedAt).toLocaleString()}, older than the tracker refresh interval.`
}

export const UsageStalePill = (props: { fetchedAt?: number }): ReactElement => {
  const { fetchedAt } = props
  const theme = useTheme()
  const styles = createStyles({ theme })

  return (
    <View accessibilityLabel={resolveStaleTooltipText({ fetchedAt })} style={styles.pill}>
      <Text style={styles.pillText}>{constant.usageMeter.staleLabelText}</Text>
      <WarningIcon color={theme.warning} />
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    pill: {
      alignItems: 'center',
      backgroundColor: theme.warningTint,
      borderRadius: 999,
      flexDirection: 'row',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    pillText: {
      color: theme.warning,
      fontSize: 11,
      fontWeight: '600',
    },
  })
}
