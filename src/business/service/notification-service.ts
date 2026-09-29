import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import { SoundNameMapper } from '@/business/enum/sound-name-mapper-enum'
import { type LocalNotificationModel } from '@/business/model/local-notification-model'
import { constant } from '@/util/constant'

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }
  },
})

export class NotificationService {
  protected _createdAndroidChannelIds = new Set<string>()

  async ensurePermission(): Promise<boolean> {
    const status = await Notifications.getPermissionsAsync()
    if (status.granted) {
      return true
    }
    const requestedStatus = await Notifications.requestPermissionsAsync()
    return requestedStatus.granted
  }

  async presentNotification(params: LocalNotificationModel): Promise<void> {
    const { accentColor, body, sessionId, soundId, title } = params
    const channelId = this._resolveAndroidChannelId({ soundId })
    await this._ensureAndroidChannel({ channelId, soundId })
    const isGranted = await this.ensurePermission()
    if (!isGranted) {
      return
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        body,
        color: accentColor,
        data: this._resolveContentData({ sessionId }),
        sound: this._resolveContentSound({ soundId }),
        title,
      },
      identifier: this._resolveIdentifier({ sessionId }),
      trigger: this._resolveTrigger({ channelId }),
    })
  }

  protected async _ensureAndroidChannel(params: { channelId: string; soundId?: SoundNameMapper }): Promise<void> {
    const { channelId, soundId } = params
    if (this._createdAndroidChannelIds.has(channelId) || Platform.OS !== 'android') {
      return
    }
    this._createdAndroidChannelIds.add(channelId)
    await Notifications.setNotificationChannelAsync(channelId, this._resolveAndroidChannelInput({ soundId }))
  }

  protected _resolveAndroidChannelId(params: { soundId?: SoundNameMapper }): string {
    const { soundId } = params
    if (soundId === undefined) {
      return constant.notification.androidChannelId
    }
    return `${constant.notificationSound.androidChannelIdPrefix}${soundId}`
  }

  protected _resolveAndroidChannelInput(params: { soundId?: SoundNameMapper }): Notifications.NotificationChannelInput {
    const { soundId } = params
    if (soundId === undefined) {
      return {
        importance: Notifications.AndroidImportance.HIGH,
        name: constant.notification.androidChannelName,
      }
    }
    const name = `${constant.notificationSound.androidChannelNamePrefix}${this._resolveSoundLabel({ soundId })}`
    if (soundId === SoundNameMapper.SYSTEM_DEFAULT) {
      return { importance: Notifications.AndroidImportance.HIGH, name }
    }
    return {
      importance: Notifications.AndroidImportance.HIGH,
      name,
      sound: this._resolveSoundFileName({ soundId }),
    }
  }

  protected _resolveContentData(params: { sessionId?: string }): Record<string, unknown> | undefined {
    const { sessionId } = params
    if (sessionId === undefined) {
      return undefined
    }
    return { sessionId }
  }

  protected _resolveContentSound(params: { soundId?: SoundNameMapper }): boolean | string {
    const { soundId } = params
    if (soundId === undefined || soundId === SoundNameMapper.SYSTEM_DEFAULT) {
      return true
    }
    return this._resolveSoundFileName({ soundId }) ?? false
  }

  protected _resolveIdentifier(params: { sessionId?: string }): string | undefined {
    const { sessionId } = params
    if (sessionId === undefined) {
      return undefined
    }
    return `${constant.notification.sessionIdentifierPrefix}${sessionId}`
  }

  protected _resolveSoundFileName(params: { soundId: SoundNameMapper }): string | null {
    const { soundId } = params
    if (soundId === SoundNameMapper.NONE) {
      return null
    }
    return `${soundId}${constant.notificationSound.fileExtension}`
  }

  protected _resolveSoundLabel(params: { soundId: SoundNameMapper }): string {
    const { soundId } = params
    const option = constant.notificationSound.optionCatalog.find((candidate) => {
      return candidate.soundId === soundId
    })
    return option?.label ?? soundId
  }

  protected _resolveTrigger(params: { channelId: string }): Notifications.NotificationTriggerInput {
    const { channelId } = params
    if (Platform.OS !== 'android') {
      return null
    }
    return { channelId }
  }
}
