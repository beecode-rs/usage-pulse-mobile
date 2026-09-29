import { type ReactElement } from 'react'
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { constant } from '@/util/constant'

export const BeecodeCredit = (): ReactElement => {
  const theme = useTheme()
  const styles = createStyles({ theme })

  const handlePress = (): void => {
    void Linking.openURL(constant.about.beecodeUrl)
  }

  return (
    <Pressable
      accessibilityLabel="Open beecode.rs"
      accessibilityRole="link"
      hitSlop={4}
      onPress={handlePress}
      style={styles.row}
    >
      <Image resizeMode="contain" source={require('@/assets/images/beecode-logo.png')} style={styles.logo} />
      <View style={styles.textColumn}>
        <Text style={styles.rowTitle}>Built by Beecode</Text>
        <Text style={styles.rowSubtitle}>beecode.rs</Text>
      </View>
    </Pressable>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    logo: {
      borderRadius: 8,
      height: 40,
      width: 40,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
    },
    rowSubtitle: {
      color: theme.muted,
      fontSize: 13,
    },
    rowTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    textColumn: {
      gap: 2,
    },
  })
}
