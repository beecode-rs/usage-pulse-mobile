import { type ReactElement, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'

type TokenFieldProps = {
  onValueChange: (value: string) => void
  value: string
}

const resolveToggleLabel = (isVisible: boolean): string => {
  if (isVisible) {
    return 'Hide'
  }
  return 'Show'
}

export const TokenField = (props: TokenFieldProps): ReactElement => {
  const { onValueChange, value } = props
  const [isVisible, setIsVisible] = useState(false)
  const theme = useTheme()
  const styles = createStyles({ theme })

  const handleToggleVisibility = (): void => {
    setIsVisible(!isVisible)
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Pairing token</Text>
      <View style={styles.row}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onValueChange}
          placeholder="48-character token from the desktop"
          placeholderTextColor={theme.muted}
          secureTextEntry={!isVisible}
          style={styles.input}
          value={value}
        />
        <Pressable hitSlop={8} onPress={handleToggleVisibility} style={styles.toggle}>
          <Text style={styles.toggleText}>{resolveToggleLabel(isVisible)}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    field: {
      gap: 6,
    },
    input: {
      backgroundColor: theme.card,
      borderColor: theme.hairline,
      borderRadius: 8,
      borderWidth: 1,
      color: theme.text,
      flex: 1,
      fontSize: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    label: {
      color: theme.muted,
      fontSize: 13,
      fontWeight: '500',
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
    },
    toggle: {
      paddingHorizontal: 4,
      paddingVertical: 8,
    },
    toggleText: {
      color: theme.accent,
      fontSize: 13,
      fontWeight: '600',
    },
  })
}
