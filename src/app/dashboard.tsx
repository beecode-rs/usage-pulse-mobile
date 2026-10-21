import { useRouter } from 'expo-router'
import { type ReactElement, useEffect, useRef, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { WsConnectionStatus } from '@/business/enum/ws-connection-status-enum'
import { useTheme } from '@/business/hook/use-theme'
import { type SessionInfo } from '@/business/model/session-model'
import { type ThemePalette } from '@/business/model/theme-model'
import { type ProviderSnapshot } from '@/business/model/usage-model'
import { stateSyncServiceSingleton } from '@/business/service/state-sync-service'
import { useAppStateStore } from '@/business/store/app-state-store'
import { constant } from '@/util/constant'
import { sessionFinishedPulseUtil } from '@/util/session-finished-pulse-util'
import { SessionRow } from '@/ui-component/dashboard/session-row'
import { SessionsSummaryLine } from '@/ui-component/dashboard/sessions-summary-line'
import { UnreachableHostsNote } from '@/ui-component/dashboard/unreachable-hosts-note'
import { UsageTrackerCard } from '@/ui-component/dashboard/usage-tracker-card'
import { HeaderMenu } from '@/ui-component/header/header-menu'

const resolveConnectionBanner = (params: {
  status: WsConnectionStatus
  theme: ThemePalette
}): { color: string; label: string } => {
  const { status, theme } = params
  switch (status) {
    case WsConnectionStatus.CLOSED: {
      return { color: theme.critical, label: 'Offline' }
    }
    case WsConnectionStatus.CONNECTING: {
      return { color: theme.warning, label: 'Connecting…' }
    }
    case WsConnectionStatus.OPEN: {
      return { color: theme.good, label: 'Connected' }
    }
    default: {
      return { color: theme.muted, label: 'Not connected' }
    }
  }
}

export default function DashboardScreen(): ReactElement {
  const { connectionStatus, sessions, usage } = useAppStateStore()
  const [finishedAtBySessionId, setFinishedAtBySessionId] = useState<Record<string, number>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const previousSessionsRef = useRef<SessionInfo[] | undefined>(undefined)
  const banner = resolveConnectionBanner({ status: connectionStatus, theme })
  const isDisconnected = connectionStatus === WsConnectionStatus.IDLE
  const styles = createStyles({ theme })

  useEffect(() => {
    const hasSnapshotError =
      sessions !== undefined && sessions.errorMessage !== undefined && sessions.errorMessage !== ''
    if (sessions === undefined || hasSnapshotError) {
      return
    }
    const previousSessions = previousSessionsRef.current

    previousSessionsRef.current = sessions.sessions
    setFinishedAtBySessionId((currentFinishedAtBySessionId) => {
      return sessionFinishedPulseUtil.resolveFinishedAtBySessionId({
        currentSessions: sessions.sessions,
        finishedAtBySessionId: currentFinishedAtBySessionId,
        nowMs: Date.now(),
        previousSessions,
      })
    })
  }, [sessions])

  const handleRefresh = (): void => {
    setIsRefreshing(true)
    void stateSyncServiceSingleton()
      .syncBySavedConfig()
      .finally(() => {
        setIsRefreshing(false)
      })
  }

  const handleRetry = (): void => {
    void stateSyncServiceSingleton().syncBySavedConfig()
  }

  const handleConnectPress = (): void => {
    void stateSyncServiceSingleton().syncBySavedConfig()
  }

  const handleDisconnectPress = (): void => {
    stateSyncServiceSingleton().disconnect()
  }

  const handleSettingsPress = (): void => {
    router.push('/settings')
  }

  const handleServersPress = (): void => {
    router.push('/')
  }

  const handleAboutPress = (): void => {
    router.push('/about')
  }

  const renderTrackerCard = (providerSnapshot: ProviderSnapshot): ReactElement => {
    return <UsageTrackerCard key={providerSnapshot.trackerId} providerSnapshot={providerSnapshot} />
  }

  const renderUsage = (): ReactElement => {
    if (usage === undefined) {
      return (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Waiting for the first sync…</Text>
        </View>
      )
    }

    if (usage.providers.length === 0) {
      return (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No trackers configured on the desktop</Text>
        </View>
      )
    }

    return <View style={styles.cardList}>{usage.providers.map(renderTrackerCard)}</View>
  }

  const renderSessionRow = (session: SessionInfo): ReactElement => {
    return (
      <SessionRow
        finishedAtMs={finishedAtBySessionId[session.sessionId]}
        key={session.sessionId}
        pulseMs={constant.sessionPulse.finishedDefaultMs}
        session={session}
      />
    )
  }

  const renderSessionsBody = (): ReactElement => {
    if (sessions === undefined) {
      return (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Waiting for the first poll…</Text>
        </View>
      )
    }

    if (sessions.sessions.length === 0) {
      return (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No running sessions</Text>
        </View>
      )
    }

    return <View style={styles.cardList}>{sessions.sessions.map(renderSessionRow)}</View>
  }

  const renderSessions = (): ReactElement => {
    return (
      <View style={styles.sessionsSection}>
        <Text style={styles.sectionTitle}>Sessions</Text>
        {sessions !== undefined && <SessionsSummaryLine sessions={sessions.sessions} />}
        {sessions !== undefined && <UnreachableHostsNote unreachableHosts={sessions.unreachableHosts} />}
        {renderSessionsBody()}
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.banner, { paddingTop: insets.top + 10 }]}>
        <View style={styles.bannerState}>
          <View style={[styles.bannerDot, { backgroundColor: banner.color }]} />
          <Text style={styles.bannerText}>{banner.label}</Text>
        </View>
        <HeaderMenu
          dropdownTopOffset={insets.top + 52}
          isDisconnected={isDisconnected}
          onAboutPress={handleAboutPress}
          onConnectPress={handleConnectPress}
          onDisconnectPress={handleDisconnectPress}
          onRetryConnectPress={handleRetry}
          onServersPress={handleServersPress}
          onSettingsPress={handleSettingsPress}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[theme.accent]}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            tintColor={theme.accent}
          />
        }
      >
        <Text style={styles.title}>Usage Pulse</Text>
        {renderUsage()}
        {renderSessions()}
      </ScrollView>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    banner: {
      alignItems: 'center',
      backgroundColor: theme.background,
      borderBottomColor: theme.hairline,
      borderBottomWidth: 1,
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'space-between',
      paddingBottom: 10,
      paddingHorizontal: 16,
    },
    bannerDot: {
      borderRadius: 4,
      height: 8,
      width: 8,
    },
    bannerState: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    bannerText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '500',
    },
    cardList: {
      gap: 12,
    },
    content: {
      flexGrow: 1,
      gap: 12,
      padding: 16,
    },
    emptyBox: {
      alignItems: 'center',
      backgroundColor: theme.card,
      borderColor: theme.hairline,
      borderRadius: 12,
      borderWidth: 1,
      gap: 8,
      padding: 24,
    },
    emptyText: {
      color: theme.muted,
      fontSize: 13,
      textAlign: 'center',
    },
    screen: {
      backgroundColor: theme.background,
      flex: 1,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
    sessionsSection: {
      gap: 8,
    },
    title: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '600',
    },
  })
}
