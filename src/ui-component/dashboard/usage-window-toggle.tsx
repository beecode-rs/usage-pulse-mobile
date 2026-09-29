import { type ReactElement } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { SwapIcon } from '@/ui-component/icon/swap-icon'

type UsageWindowToggleProps = {
  isQuotaSelected: boolean
  onQuotaSelectedChange: (isQuotaSelected: boolean) => void
  quotaOptionLabel: string
  sessionOptionLabel: string
}

const resolveIconColor = (params: { isQuotaSelected: boolean; theme: ThemePalette }): string => {
  const { isQuotaSelected, theme } = params

  if (isQuotaSelected) {
    return theme.accent
  }

  return theme.muted
}

const resolveTargetLabelText = (params: {
  isQuotaSelected: boolean
  quotaOptionLabel: string
  sessionOptionLabel: string
}): string => {
  const { isQuotaSelected, quotaOptionLabel, sessionOptionLabel } = params

  if (isQuotaSelected) {
    return sessionOptionLabel
  }

  return quotaOptionLabel
}

export const UsageWindowToggle = (props: UsageWindowToggleProps): ReactElement => {
  const { isQuotaSelected, onQuotaSelectedChange, quotaOptionLabel, sessionOptionLabel } = props
  const theme = useTheme()
  const styles = createStyles({ theme })

  const handlePress = (): void => {
    onQuotaSelectedChange(!isQuotaSelected)
  }

  return (
    <Pressable
      accessibilityLabel={`Show ${resolveTargetLabelText({ isQuotaSelected, quotaOptionLabel, sessionOptionLabel })}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isQuotaSelected }}
      hitSlop={8}
      onPress={handlePress}
      style={styles.button}
    >
      <SwapIcon color={resolveIconColor({ isQuotaSelected, theme })} />
    </Pressable>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.subtleTint,
      borderRadius: 6,
      justifyContent: 'center',
      padding: 4,
    },
  })
}
