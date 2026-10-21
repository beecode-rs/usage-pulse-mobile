import { type ReactElement } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'

type HostFieldProps = {
  onValueChange: (value: string) => void
  value: string
}

export const HostField = (props: HostFieldProps): ReactElement => {
  const { onValueChange, value } = props
  const theme = useTheme()
  const styles = createStyles({ theme })

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Host</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onValueChange}
        placeholder="Desktop VPN IP, e.g. 100.101.102.103"
        placeholderTextColor={theme.muted}
        style={styles.input}
        value={value}
      />
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
      fontSize: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    label: {
      color: theme.muted,
      fontSize: 13,
      fontWeight: '500',
    },
  })
}
