import { type ReactElement } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { connectionFormUtil } from '@/util/connection-form-util'

type PortFieldProps = {
  onValueChange: (value: string) => void
  shouldShowError: boolean
  value: string
}

export const PortField = (props: PortFieldProps): ReactElement => {
  const { onValueChange, shouldShowError, value } = props
  const theme = useTheme()
  const styles = createStyles({ theme })
  const errorMessage = connectionFormUtil.resolvePortErrorMessage({ port: value })

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Port</Text>
      <TextInput
        keyboardType="number-pad"
        maxLength={5}
        onChangeText={onValueChange}
        placeholder="8787"
        placeholderTextColor={theme.muted}
        style={styles.input}
        value={value}
      />
      {shouldShowError && errorMessage !== undefined && <Text style={styles.error}>{errorMessage}</Text>}
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    error: {
      color: theme.critical,
      fontSize: 12,
    },
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
