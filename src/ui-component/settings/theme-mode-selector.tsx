import { type ReactElement } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { ThemeModeMapper } from '@/business/enum/theme-mode-mapper-enum'
import { useTheme } from '@/business/hook/use-theme'
import { useThemeMode } from '@/business/hook/use-theme-mode'
import { type ThemePalette } from '@/business/model/theme-model'

type ThemeModeView = { label: string; mode: ThemeModeMapper }

const resolveModeViews = (): ThemeModeView[] => {
  return [
    { label: 'Auto', mode: ThemeModeMapper.AUTO },
    { label: 'Dark', mode: ThemeModeMapper.DARK },
    { label: 'Light', mode: ThemeModeMapper.LIGHT },
  ]
}

export const ThemeModeSelector = (): ReactElement => {
  const theme = useTheme()
  const { mode, selectMode } = useThemeMode()
  const styles = createStyles({ theme })

  return (
    <View style={styles.row}>
      {resolveModeViews().map((modeView) => {
        const isActive = modeView.mode === mode
        return (
          <Pressable
            key={modeView.mode}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => {
              return selectMode({ mode: modeView.mode })
            }}
            style={[styles.option, isActive && styles.optionActive]}
          >
            <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{modeView.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    option: {
      alignItems: 'center',
      backgroundColor: theme.card,
      borderColor: theme.hairline,
      borderRadius: 8,
      borderWidth: 1,
      flex: 1,
      paddingVertical: 10,
    },
    optionActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    optionText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '500',
    },
    optionTextActive: {
      color: '#ffffff',
      fontWeight: '600',
    },
    row: {
      flexDirection: 'row',
      gap: 8,
    },
  })
}
