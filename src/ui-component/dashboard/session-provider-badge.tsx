import { type ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { SessionProviderMapper } from '@/business/enum/session-provider-mapper-enum'
import { type ThemePalette } from '@/business/model/theme-model'
import { sessionPresentationUtil } from '@/util/session-presentation-util'
import { ClaudeCodeIcon } from '@/ui-component/icon/claude-code-icon'
import { OpenCodeIcon } from '@/ui-component/icon/opencode-icon'

const resolveProviderIcon = (params: { color: string; provider: SessionProviderMapper }): ReactElement => {
  const { color, provider } = params

  switch (provider) {
    case SessionProviderMapper.CLAUDE_CODE: {
      return <ClaudeCodeIcon color={color} size={11} />
    }
    case SessionProviderMapper.OPENCODE: {
      return <OpenCodeIcon color={color} size={11} />
    }
    default: {
      return <ClaudeCodeIcon color={color} size={11} />
    }
  }
}

export const SessionProviderBadge = (props: { provider: SessionProviderMapper }): ReactElement => {
  const { provider } = props
  const theme = useTheme()
  const styles = createStyles({ theme })

  return (
    <View style={styles.badge}>
      {resolveProviderIcon({ color: theme.muted, provider })}
      <Text style={styles.badgeText}>{sessionPresentationUtil.resolveProviderLabel({ provider })}</Text>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    badge: {
      alignItems: 'center',
      backgroundColor: theme.track,
      borderRadius: 999,
      flexDirection: 'row',
      flexShrink: 0,
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    badgeText: {
      color: theme.muted,
      fontSize: 10,
      fontWeight: '600',
    },
  })
}
