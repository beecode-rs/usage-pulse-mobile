import AsyncStorage from '@react-native-async-storage/async-storage'

import { type NotificationSoundConfig } from '@/business/model/notification-sound-config-model'
import { notificationSoundConfigSchema } from '@/business/schema/notification-sound-config-schema'
import { constant } from '@/util/constant'

export class NotificationSoundConfigService {
  async loadConfig(): Promise<NotificationSoundConfig> {
    const rawConfig = await AsyncStorage.getItem(constant.notificationSound.storageKey)
    return notificationSoundConfigSchema.parse(this._parseJson(rawConfig))
  }

  async saveConfig(params: { config: NotificationSoundConfig }): Promise<void> {
    const { config } = params
    await AsyncStorage.setItem(constant.notificationSound.storageKey, JSON.stringify(config))
  }

  protected _parseJson(rawConfig: string | null): unknown {
    if (rawConfig === null) {
      return undefined
    }
    try {
      return JSON.parse(rawConfig) as unknown
    } catch {
      return undefined
    }
  }
}
