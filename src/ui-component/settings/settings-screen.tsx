import { type ReactElement } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { SystemSettingsTab } from '@/ui-component/settings/system-settings-tab'

type SettingsScreenProps = {
  onBackPress: () => void
}

export const SettingsScreen = (props: SettingsScreenProps): ReactElement => {
  const { onBackPress } = props
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const styles = createStyles({ theme })

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable hitSlop={8} onPress={onBackPress} style={styles.backWrapper}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SystemSettingsTab />
      </ScrollView>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    backText: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: '600',
    },
    backWrapper: {
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    content: {
      padding: 16,
    },
    header: {
      alignItems: 'center',
      backgroundColor: theme.background,
      borderBottomColor: theme.hairline,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 10,
      paddingHorizontal: 16,
    },
    headerSpacer: {
      width: 38,
    },
    headerTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
    screen: {
      backgroundColor: theme.background,
      flex: 1,
    },
  })
}
