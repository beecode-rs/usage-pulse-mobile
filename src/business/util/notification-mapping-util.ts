import { type MobileWsMessage, type UsageWarning, UsageWarningReason } from '@/business/model/mobile-api-model'
import { type SoundNameMapper } from '@/business/enum/sound-name-mapper-enum'
import { type LocalNotificationModel } from '@/business/model/local-notification-model'
import { type NotificationSoundConfig } from '@/business/model/notification-sound-config-model'
import { type SessionInfo } from '@/business/model/session-model'
import { constant } from '@/util/constant'
import { sessionPresentationUtil } from '@/util/session-presentation-util'

export const notificationMappingUtil = {
  resolveNotification: (params: {
    message: MobileWsMessage
    soundConfig: NotificationSoundConfig
  }): LocalNotificationModel | undefined => {
    const { message, soundConfig } = params

    switch (message.type) {
      case 'session-finished': {
        return notificationMappingUtil.resolveSessionNotification({
          session: message.session,
          soundId: soundConfig.sessionFinishedSoundId,
          title: '✅ Finished',
        })
      }
      case 'session-waiting': {
        return {
          ...notificationMappingUtil.resolveSessionNotification({
            session: message.session,
            soundId: soundConfig.waitingSoundId,
            title: '🙋 Needs you',
          }),
          accentColor: constant.notification.waitingAccentColor,
        }
      }
      case 'usage-warning': {
        const { reason } = message.warning
        return {
          body: notificationMappingUtil.resolveWarningBody({ warning: message.warning }),
          title: notificationMappingUtil.resolveWarningTitle({ reason }),
        }
      }
      default: {
        return undefined
      }
    }
  },

  resolveSessionNotification: (params: {
    session: SessionInfo
    soundId: SoundNameMapper
    title: string
  }): LocalNotificationModel => {
    const { session, soundId, title } = params
    const sessionTitleLabel = sessionPresentationUtil.resolveSessionTitleLabel({ session })

    return {
      body: `${sessionTitleLabel}\n${session.cwd}`,
      sessionId: session.sessionId,
      soundId,
      title,
    }
  },

  resolveWarningBody: (params: { warning: UsageWarning }): string => {
    const { warning } = params

    switch (warning.reason) {
      case UsageWarningReason.HIGH_USAGE:
      case UsageWarningReason.LIMIT_REACHED: {
        return `${warning.trackerName} · ${warning.windowLabel ?? ''} ${String(warning.usedPercent ?? 0)}%`
      }
      case UsageWarningReason.PROVIDER_ERROR: {
        return warning.errorMessage ?? ''
      }
      default: {
        throw new Error('unsupported usage warning reason')
      }
    }
  },

  resolveWarningTitle: (params: { reason: UsageWarningReason }): string => {
    const { reason } = params

    switch (reason) {
      case UsageWarningReason.HIGH_USAGE: {
        return 'High usage'
      }
      case UsageWarningReason.LIMIT_REACHED: {
        return 'Limit reached'
      }
      case UsageWarningReason.PROVIDER_ERROR: {
        return 'Provider error'
      }
      default: {
        throw new Error('unsupported usage warning reason')
      }
    }
  },
}
