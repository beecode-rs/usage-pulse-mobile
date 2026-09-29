import { type ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { NotificationSoundSettings } from '@/ui-component/settings/notification-sound-settings'
import { ThemeModeSelector } from '@/ui-component/settings/theme-mode-selector'

export const SystemSettingsTab = (): ReactElement => {
  const theme = useTheme()
  const styles = createStyles({ theme })

  return (
    <View style={styles.tab}>
      <Text style={styles.sectionTitle}>Appearance</Text>
      <ThemeModeSelector />
      <Text style={styles.hintText}>Auto follows the device system appearance.</Text>
      <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Notification sounds</Text>
      <NotificationSoundSettings />
      <Text style={styles.hintText}>Played when a desktop session finishes or needs your input.</Text>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    hintText: {
      color: theme.muted,
      fontSize: 13,
      lineHeight: 18,
    },
    sectionSpacing: {
      marginTop: 12,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    tab: {
      gap: 12,
    },
  })
}
