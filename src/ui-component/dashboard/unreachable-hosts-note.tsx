import { type ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { type UnreachableHost } from '@/business/model/session-model'

export const UnreachableHostsNote = (props: { unreachableHosts: UnreachableHost[] }): ReactElement | null => {
  const { unreachableHosts } = props
  const theme = useTheme()
  const styles = createStyles({ theme })

  const renderHostLine = (unreachableHost: UnreachableHost): ReactElement => {
    return (
      <Text key={unreachableHost.hostId} style={styles.hostLine}>
        {`${unreachableHost.hostLabel}: ${unreachableHost.errorMessage}`}
      </Text>
    )
  }

  if (unreachableHosts.length === 0) {
    return null
  }

  return <View style={styles.note}>{unreachableHosts.map(renderHostLine)}</View>
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    hostLine: {
      color: theme.critical,
      fontSize: 12,
    },
    note: {
      gap: 4,
    },
  })
}
