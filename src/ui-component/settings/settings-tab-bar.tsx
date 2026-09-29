import { type ReactElement } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { SettingsTabMapper } from '@/business/enum/settings-tab-mapper-enum'
import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { constant } from '@/util/constant'

type SettingsTabBarProps = {
  activeTab: SettingsTabMapper
  onTabSelect: (params: { tab: SettingsTabMapper }) => void
}

export const SettingsTabBar = (props: SettingsTabBarProps): ReactElement => {
  const { activeTab, onTabSelect } = props
  const theme = useTheme()
  const styles = createStyles({ theme })

  return (
    <View style={styles.bar}>
      {constant.settings.tabCatalog.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => {
              return onTabSelect({ tab: tab.id })
            }}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    bar: {
      backgroundColor: theme.background,
      borderBottomColor: theme.hairline,
      borderBottomWidth: 1,
      flexDirection: 'row',
      paddingHorizontal: 16,
    },
    tab: {
      alignItems: 'center',
      borderBottomColor: 'transparent',
      borderBottomWidth: 2,
      flex: 1,
      paddingVertical: 10,
    },
    tabActive: {
      borderBottomColor: theme.accent,
    },
    tabText: {
      color: theme.muted,
      fontSize: 14,
      fontWeight: '500',
    },
    tabTextActive: {
      color: theme.text,
      fontWeight: '600',
    },
  })
}
