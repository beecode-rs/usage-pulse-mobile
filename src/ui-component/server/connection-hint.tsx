import { type ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'

export const ConnectionHint = (): ReactElement => {
  const theme = useTheme()
  const styles = createStyles({ theme })

  return (
    <View style={styles.hintBox}>
      <Text style={styles.hintTitle}>Pairing with the desktop</Text>
      <Text style={styles.hintText}>
        On the desktop app, open the Mobile page and enable the server. Then enter the VPN IP address of this computer
        (for example its Tailscale or WireGuard IP), the port shown on the Mobile page, and the pairing token.
      </Text>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    hintBox: {
      backgroundColor: theme.card,
      borderColor: theme.hairline,
      borderRadius: 12,
      borderWidth: 1,
      gap: 6,
      padding: 16,
    },
    hintText: {
      color: theme.muted,
      fontSize: 13,
      lineHeight: 19,
    },
    hintTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
  })
}
