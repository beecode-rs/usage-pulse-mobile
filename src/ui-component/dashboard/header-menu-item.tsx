import { type ReactElement } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'

type HeaderMenuItemProps = {
  icon: ReactElement
  label: string
  onPress: () => void
}

const resolvePressedBackground = (params: { isPressed: boolean; theme: ThemePalette }): string => {
  const { isPressed, theme } = params

  if (isPressed) {
    return theme.track
  }

  return 'transparent'
}

export const HeaderMenuItem = (props: HeaderMenuItemProps): ReactElement => {
  const { icon, label, onPress } = props
  const theme = useTheme()
  const styles = createStyles({ theme })

  return (
    <Pressable
      onPress={onPress}
      style={(state) => {
        return { backgroundColor: resolvePressedBackground({ isPressed: state.pressed, theme }) }
      }}
    >
      <View style={styles.item}>
        <View style={styles.iconWrapper}>{icon}</View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    iconWrapper: {
      alignItems: 'center',
      height: 18,
      justifyContent: 'center',
      width: 18,
    },
    item: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    label: {
      color: theme.text,
      fontSize: 14,
    },
  })
}
