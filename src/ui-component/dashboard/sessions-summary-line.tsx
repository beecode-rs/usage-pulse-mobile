import { type ReactElement } from 'react'
import { StyleSheet, Text } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type SessionInfo } from '@/business/model/session-model'
import { type ThemePalette } from '@/business/model/theme-model'
import { sessionPresentationUtil } from '@/util/session-presentation-util'

export const SessionsSummaryLine = (props: { sessions: SessionInfo[] }): ReactElement => {
  const { sessions } = props
  const theme = useTheme()
  const styles = createStyles({ theme })
  const counts = sessionPresentationUtil.resolveSummaryCounts({ sessions })

  return <Text style={styles.summary}>{sessionPresentationUtil.resolveSummaryLine({ counts })}</Text>
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    summary: {
      color: theme.muted,
      fontSize: 12,
    },
  })
}
