import { vi } from 'vitest'

import { type ConnectionConfig } from '@/business/model/connection-config-model'
import { connectionConfigService } from '@/business/service/connection-config-service'

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

export const connectionConfigServiceContractHarness = {
  loadAfterSave: async (params: { config: ConnectionConfig }) => {
    const { config } = params
    storageContent.clear()
    await connectionConfigService.saveConfig({ config })

    return await connectionConfigService.loadConfig()
  },

  loadWhenStorageEmpty: async () => {
    storageContent.clear()

    return await connectionConfigService.loadConfig()
  },
}
