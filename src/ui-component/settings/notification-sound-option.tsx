import { type ReactElement } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { CheckIcon } from '@/ui-component/icon/check-icon'
import { constant } from '@/util/constant'

const resolvePressedBackground = (params: { isPressed: boolean; theme: ThemePalette }): string => {
  const { isPressed, theme } = params

  if (isPressed) {
    return theme.track
  }

  return 'transparent'
}

export const NotificationSoundOption = (props: {
  isSelected: boolean
  label: string
  onPress: () => void
}): ReactElement => {
  const { isSelected, label, onPress } = props
  const theme = useTheme()
  const styles = createStyles({ theme })

  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={(state) => {
        return { backgroundColor: resolvePressedBackground({ isPressed: state.pressed, theme }) }
      }}
    >
      <View style={styles.item}>
        <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>
        <View style={styles.checkWrapper}>{isSelected && <CheckIcon color={theme.accent} />}</View>
      </View>
    </Pressable>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    checkWrapper: {
      alignItems: 'center',
      height: 18,
      justifyContent: 'center',
      width: 18,
    },
    item: {
      alignItems: 'center',
      flexDirection: 'row',
      height: constant.notificationSound.dropdownItemHeight,
      justifyContent: 'space-between',
      paddingHorizontal: 14,
    },
    label: {
      color: theme.text,
      fontSize: 14,
    },
    labelSelected: {
      color: theme.accent,
      fontWeight: '600',
    },
  })
}
