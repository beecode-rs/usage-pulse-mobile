import { type ReactElement, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { UsageActivityStatus } from '@/business/enum/usage-activity-status-enum'
import { useTheme } from '@/business/hook/use-theme'
import { type ProviderSnapshot, type UsageWindow } from '@/business/model/usage-model'
import { type ThemePalette } from '@/business/model/theme-model'
import { UsageStalenessUtil } from '@/business/util/usage-staleness-util'
import { ZaiPeakUtil } from '@/business/util/zai-peak-util'
import { constant } from '@/util/constant'
import { usageMeterUtil } from '@/util/usage-meter-util'
import { UsageStalePill } from '@/ui-component/dashboard/usage-stale-pill'
import { UsageWindowMeter } from '@/ui-component/dashboard/usage-window-meter'
import { UsageWindowToggle } from '@/ui-component/dashboard/usage-window-toggle'
import { ZaiPeakBanner } from '@/ui-component/dashboard/zai-peak-banner'
import { ProviderIcon } from '@/ui-component/provider/provider-icon'

const TICK_INTERVAL_MS = 30_000

const resolveStatusColor = (params: { status: UsageActivityStatus; theme: ThemePalette }): string => {
  const { status, theme } = params
  switch (status) {
    case UsageActivityStatus.ERROR: {
      return theme.critical
    }
    case UsageActivityStatus.OK: {
      return theme.good
    }
    case UsageActivityStatus.PENDING: {
      return theme.warning
    }
    default: {
      return theme.muted
    }
  }
}

const resolveStatusMessage = (params: { providerSnapshot: ProviderSnapshot }): string => {
  const { providerSnapshot } = params
  switch (providerSnapshot.status) {
    case UsageActivityStatus.ERROR: {
      return providerSnapshot.errorMessage ?? 'Error'
    }
    case UsageActivityStatus.PENDING: {
      return 'Loading usage…'
    }
    case UsageActivityStatus.UNCONFIGURED: {
      return 'Add an access token to track usage.'
    }
    default: {
      return 'No usage windows returned.'
    }
  }
}

const resolveStatusText = (status: UsageActivityStatus): string => {
  switch (status) {
    case UsageActivityStatus.ERROR: {
      return 'Error'
    }
    case UsageActivityStatus.OK: {
      return 'Live'
    }
    case UsageActivityStatus.PENDING: {
      return 'Loading'
    }
    default: {
      return 'No token'
    }
  }
}

const resolveMessageColor = (params: { status: UsageActivityStatus; theme: ThemePalette }): string => {
  const { status, theme } = params
  if (status === UsageActivityStatus.ERROR) {
    return theme.critical
  }
  return theme.muted
}

const resolveQuotaWindows = (usageWindows: UsageWindow[]): UsageWindow[] => {
  return usageWindows.filter((usageWindow) => {
    return usageMeterUtil.isQuotaWindow({ label: usageWindow.label })
  })
}

const resolveSessionWindows = (usageWindows: UsageWindow[]): UsageWindow[] => {
  return usageWindows.filter((usageWindow) => {
    return !usageMeterUtil.isQuotaWindow({ label: usageWindow.label })
  })
}

const resolveVisibleWindows = (params: {
  isQuotaSelected: boolean
  quotaWindows: UsageWindow[]
  sessionWindows: UsageWindow[]
}): UsageWindow[] => {
  const { isQuotaSelected, quotaWindows, sessionWindows } = params

  if (isQuotaSelected && quotaWindows.length > 0) {
    return quotaWindows
  }

  if (sessionWindows.length > 0) {
    return sessionWindows
  }

  return quotaWindows
}

export const UsageTrackerCard = (props: { providerSnapshot: ProviderSnapshot }): ReactElement => {
  const { providerSnapshot } = props
  const [isQuotaSelected, setIsQuotaSelected] = useState(false)
  const [now, setNow] = useState((): number => {
    return Date.now()
  })
  const theme = useTheme()
  const styles = createStyles({ theme })

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(Date.now())
    }, TICK_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const peakInfo = new ZaiPeakUtil().resolvePeakInfo({ nowMs: now, providerId: providerSnapshot.providerId })
  const isPeakHour = peakInfo?.isPeakHour ?? false
  const isSnapshotStale = new UsageStalenessUtil().isSnapshotStale({
    nowMs: now,
    providerSnapshot,
    refreshIntervalMs: providerSnapshot.refreshIntervalMs,
  })

  const usageWindows = providerSnapshot.usage ?? []
  const hasUsageWindows = providerSnapshot.status === UsageActivityStatus.OK && usageWindows.length > 0
  const quotaWindows = resolveQuotaWindows(usageWindows)
  const sessionWindows = resolveSessionWindows(usageWindows)
  const hasBothPanes = sessionWindows.length > 0 && quotaWindows.length > 0
  const visibleWindows = resolveVisibleWindows({ isQuotaSelected, quotaWindows, sessionWindows })

  const renderWindowMeter = (usageWindow: UsageWindow): ReactElement => {
    return <UsageWindowMeter key={usageWindow.label} nowMs={now} usageWindow={usageWindow} />
  }

  const renderBody = (): ReactElement => {
    if (!hasUsageWindows) {
      return (
        <Text style={[styles.message, { color: resolveMessageColor({ status: providerSnapshot.status, theme }) }]}>
          {resolveStatusMessage({ providerSnapshot })}
        </Text>
      )
    }

    return <View style={styles.windows}>{visibleWindows.map(renderWindowMeter)}</View>
  }

  return (
    <View style={[styles.card, isPeakHour && styles.cardPeakActive, isSnapshotStale && styles.cardStale]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeading}>
          <ProviderIcon providerId={providerSnapshot.providerId} />
          <Text numberOfLines={1} style={styles.title}>
            {providerSnapshot.trackerName}
          </Text>
        </View>
        <View style={styles.cardActions}>
          {hasBothPanes && (
            <UsageWindowToggle
              isQuotaSelected={isQuotaSelected}
              onQuotaSelectedChange={setIsQuotaSelected}
              quotaOptionLabel={quotaWindows[0].label}
              sessionOptionLabel={constant.usageMeter.sessionPaneLabelText}
            />
          )}
          {isSnapshotStale && <UsageStalePill fetchedAt={providerSnapshot.fetchedAt} />}
          <Text style={[styles.statusText, { color: resolveStatusColor({ status: providerSnapshot.status, theme }) }]}>
            {resolveStatusText(providerSnapshot.status)}
          </Text>
        </View>
      </View>
      <ZaiPeakBanner nowMs={now} providerId={providerSnapshot.providerId} />
      {renderBody()}
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      borderColor: theme.hairline,
      borderRadius: 12,
      borderWidth: 1,
      gap: 12,
      padding: 14,
    },
    cardActions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    cardHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    cardHeading: {
      alignItems: 'center',
      flexShrink: 1,
      flexDirection: 'row',
      gap: 8,
    },
    cardPeakActive: {
      borderColor: theme.warningBorder,
    },
    cardStale: {
      borderColor: theme.warning,
    },
    message: {
      fontSize: 13,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    title: {
      color: theme.text,
      flexShrink: 1,
      fontSize: 16,
      fontWeight: '600',
    },
    windows: {
      gap: 12,
    },
  })
}
