import { type ReactElement } from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'

import { UpdateCheckErrorMapper } from '@/business/enum/update-check-error-mapper-enum'
import { UpdateCheckStatus } from '@/business/enum/update-check-status-enum'
import { useTheme } from '@/business/hook/use-theme'
import { useUpdateCheck } from '@/business/hook/use-update-check'
import { type AppUpdateError } from '@/business/model/app-update-model'
import { type ThemePalette } from '@/business/model/theme-model'

type StatusView = { color: string; label: string }

const noReleaseStatusLabel = 'No GitHub release published yet for this project.'
const genericErrorLabel = 'Could not check for updates. Try again.'

const resolveErrorLabel = (params: { error: AppUpdateError }): string => {
  const { error } = params
  switch (error.kind) {
    case UpdateCheckErrorMapper.HTTP_ERROR: {
      if (error.status === 404) {
        return noReleaseStatusLabel
      }
      return `Update check failed (HTTP ${String(error.status)}). Try again.`
    }
    case UpdateCheckErrorMapper.INVALID_RESPONSE: {
      return 'GitHub answered with an unexpected response. Try again.'
    }
    case UpdateCheckErrorMapper.NETWORK: {
      return 'Could not reach GitHub. Check your connection and try again.'
    }
    case UpdateCheckErrorMapper.RATE_LIMITED: {
      return `GitHub API rate limit exceeded — resets at ${resolveResetTimeLabel(error.resetAt)}.`
    }
    case UpdateCheckErrorMapper.TIMEOUT: {
      return 'The update check timed out. Try again.'
    }
    case UpdateCheckErrorMapper.UNKNOWN: {
      return genericErrorLabel
    }
    default: {
      throw new Error('unsupported update check error kind')
    }
  }
}

const resolveResetTimeLabel = (resetAt: number): string => {
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(resetAt))
}

const resolveStatusView = (params: {
  error: AppUpdateError | undefined
  status: UpdateCheckStatus
  theme: ThemePalette
  updateVersion: string
}): StatusView => {
  const { error, status, theme, updateVersion } = params
  switch (status) {
    case UpdateCheckStatus.CHECKING: {
      return { color: theme.muted, label: 'Checking for updates…' }
    }
    case UpdateCheckStatus.ERROR: {
      if (error === undefined) {
        return { color: theme.critical, label: genericErrorLabel }
      }
      return { color: theme.critical, label: resolveErrorLabel({ error }) }
    }
    case UpdateCheckStatus.IDLE: {
      return { color: theme.muted, label: '' }
    }
    case UpdateCheckStatus.UP_TO_DATE: {
      return { color: theme.muted, label: 'You are on the latest version.' }
    }
    case UpdateCheckStatus.UPDATE_AVAILABLE: {
      return { color: theme.good, label: `Version ${updateVersion} is available.` }
    }
    default: {
      throw new Error('unsupported update check status')
    }
  }
}

export const UpdateCheckSettings = (): ReactElement => {
  const theme = useTheme()
  const { checkForUpdate, error, status, update } = useUpdateCheck()
  const styles = createStyles({ theme })
  const statusView = resolveStatusView({ error, status, theme, updateVersion: update?.version ?? '' })

  const handleCheckPress = (): void => {
    checkForUpdate({ isSilent: false })
  }

  const handleDownloadPress = (): void => {
    if (update === undefined) {
      return
    }
    void Linking.openURL(update.downloadUrl).catch(() => {
      return undefined
    })
  }

  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" onPress={handleCheckPress} style={styles.checkButton}>
        <Text style={styles.checkButtonText}>Check for updates</Text>
      </Pressable>
      {statusView.label !== '' && (
        <Text style={[styles.statusText, { color: statusView.color }]}>{statusView.label}</Text>
      )}
      {update !== undefined && (
        <Pressable accessibilityRole="button" onPress={handleDownloadPress} style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>Download version {update.version}</Text>
        </Pressable>
      )}
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    checkButton: {
      alignItems: 'center',
      backgroundColor: theme.card,
      borderColor: theme.hairline,
      borderRadius: 8,
      borderWidth: 1,
      paddingVertical: 10,
    },
    checkButtonText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    container: {
      gap: 8,
    },
    downloadButton: {
      alignItems: 'center',
      backgroundColor: theme.accent,
      borderRadius: 8,
      paddingVertical: 12,
    },
    downloadButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    statusText: {
      fontSize: 13,
    },
  })
}
