import { vi } from 'vitest'

import { type NotificationSoundConfig } from '@/business/model/notification-sound-config-model'
import { NotificationSoundConfigService } from '@/business/service/notification-sound-config-service'
import { constant } from '@/util/constant'

const storageContent = vi.hoisted(() => {
  return new Map<string, string>()
})

vi.mock('@react-native-async-storage/async-storage', () => {
  return {
    default: {
      getItem: (key: string) => {
        return Promise.resolve(storageContent.get(key) ?? null)
      },
      setItem: (key: string, value: string) => {
        storageContent.set(key, value)
        return Promise.resolve()
      },
    },
  }
})

export const notificationSoundConfigServiceContractHarness = {
  loadAfterSave: async (params: { config: NotificationSoundConfig }) => {
    const { config } = params
    storageContent.clear()
    const service = new NotificationSoundConfigService()
    await service.saveConfig({ config })
    return await service.loadConfig()
  },
  loadWhenStorageContainsRawValue: async (params: { rawValue: string }) => {
    const { rawValue } = params
    storageContent.clear()
    storageContent.set(constant.notificationSound.storageKey, rawValue)
    return await new NotificationSoundConfigService().loadConfig()
  },
  loadWhenStorageEmpty: async () => {
    storageContent.clear()
    return await new NotificationSoundConfigService().loadConfig()
  },
}
