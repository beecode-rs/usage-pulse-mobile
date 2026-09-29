import { type ReactElement, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { SessionStatusMapper } from '@/business/enum/session-status-mapper-enum'
import { useTheme } from '@/business/hook/use-theme'
import { type SessionInfo } from '@/business/model/session-model'
import { type ThemePalette } from '@/business/model/theme-model'
import { sessionPresentationUtil } from '@/util/session-presentation-util'
import { SessionFinishedPulse } from '@/ui-component/dashboard/session-finished-pulse'
import { SessionOriginIcon } from '@/ui-component/dashboard/session-origin-icon'
import { SessionWaitingPulse } from '@/ui-component/dashboard/session-waiting-pulse'

const TICK_INTERVAL_MS = 30_000

const resolveStatusColor = (params: { status: SessionStatusMapper; theme: ThemePalette }): string => {
  const { status, theme } = params
  switch (status) {
    case SessionStatusMapper.BUSY: {
      return theme.good
    }
    case SessionStatusMapper.WAITING: {
      return theme.sessionWaiting
    }
    default: {
      return theme.muted
    }
  }
}

const resolveStatusText = (status: SessionStatusMapper): string => {
  switch (status) {
    case SessionStatusMapper.BUSY: {
      return 'Working'
    }
    case SessionStatusMapper.IDLE: {
      return 'Idle'
    }
    case SessionStatusMapper.WAITING: {
      return 'Waiting'
    }
    default: {
      return 'Unknown'
    }
  }
}

export const SessionRow = (props: { finishedAtMs?: number; pulseMs: number; session: SessionInfo }): ReactElement => {
  const { finishedAtMs, pulseMs, session } = props
  const theme = useTheme()
  const styles = createStyles({ theme })
  const sessionTitle = sessionPresentationUtil.resolveSessionTitle({ session })
  const sessionTitleParts = sessionPresentationUtil.resolveSessionTitleParts({ title: sessionTitle })
  const [now, setNow] = useState((): number => {
    return Date.now()
  })

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(Date.now())
    }, TICK_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const renderMeta = (): ReactElement | null => {
    if (session.transcript === undefined) {
      return null
    }
    const metaParts = [
      sessionPresentationUtil.resolveModelLabel({ model: session.transcript.model }),
      session.transcript.gitBranch,
      sessionPresentationUtil.resolveLastActivityLabel({
        lastActivityAt: session.transcript.lastActivityAt,
        nowMs: now,
      }),
    ].filter((part) => {
      return part !== ''
    })
    if (metaParts.length === 0) {
      return null
    }
    return <Text style={styles.meta}>{metaParts.join(' · ')}</Text>
  }

  return (
    <View style={[styles.row, { borderLeftColor: resolveStatusColor({ status: session.status, theme }) }]}>
      <SessionFinishedPulse finishedAtMs={finishedAtMs} nowMs={now} pulseMs={pulseMs} />
      <SessionWaitingPulse isWaiting={session.status === SessionStatusMapper.WAITING} />
      <View style={styles.rowHeader}>
        <View style={styles.titleWrap}>
          <SessionOriginIcon isRemote={session.hostId !== undefined} />
          <Text numberOfLines={1} style={styles.title}>
            {sessionTitleParts.name}
            {sessionTitleParts.suffix !== undefined && (
              <Text style={styles.titleSuffix}> ({sessionTitleParts.suffix})</Text>
            )}
          </Text>
          {session.hostId !== undefined && session.hostLabel !== undefined && (
            <View style={styles.hostWrap}>
              <Text style={styles.host}>{session.hostLabel}</Text>
            </View>
          )}
        </View>
        <View style={styles.chip}>
          <View style={[styles.chipDot, { backgroundColor: resolveStatusColor({ status: session.status, theme }) }]} />
          <Text style={[styles.chipText, { color: resolveStatusColor({ status: session.status, theme }) }]}>
            {resolveStatusText(session.status)}
          </Text>
        </View>
      </View>
      {renderMeta()}
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    chip: {
      alignItems: 'center',
      backgroundColor: theme.track,
      borderRadius: 999,
      flexDirection: 'row',
      flexShrink: 0,
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    chipDot: {
      borderRadius: 4,
      height: 7,
      width: 7,
    },
    chipText: {
      fontSize: 11,
      fontWeight: '600',
    },
    host: {
      color: theme.muted,
      flexShrink: 0,
      fontSize: 11,
    },
    hostWrap: {
      flexShrink: 0,
    },
    meta: {
      color: theme.muted,
      fontSize: 12,
    },
    row: {
      backgroundColor: theme.card,
      borderColor: theme.hairline,
      borderRadius: 12,
      borderLeftColor: theme.muted,
      borderLeftWidth: 3,
      borderWidth: 1,
      gap: 8,
      padding: 12,
    },
    rowHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'space-between',
    },
    title: {
      color: theme.text,
      flexShrink: 1,
      fontSize: 14,
      fontWeight: '600',
    },
    titleSuffix: {
      color: theme.muted,
      fontWeight: '400',
    },
    titleWrap: {
      alignItems: 'center',
      flexDirection: 'row',
      flexShrink: 1,
      gap: 6,
    },
  })
}
