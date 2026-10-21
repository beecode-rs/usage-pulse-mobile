import { vi } from 'vitest'

import { type ConnectionConfig } from '@/business/model/connection-config-model'
import { type ServerListPayload } from '@/business/model/server-model'
import { serverListService } from '@/business/service/server-list-service'
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

export const serverListServiceContractHarness = {
  createEntryFromConfig: (params: { config: ConnectionConfig; name: string }) => {
    const { config, name } = params
    const first = serverListService.createServerEntry({ config, name })
    const second = serverListService.createServerEntry({ config, name })

    return {
      host: first.host,
      idFirstPresent: first.id.length > 0,
      idsDiffer: first.id !== second.id,
      name: first.name,
      port: first.port,
      token: first.token,
    }
  },

  loadAfterSave: async (params: { payload: ServerListPayload }) => {
    const { payload } = params
    storageContent.clear()
    await serverListService.savePayload({ payload })

    return await serverListService.loadPayload()
  },

  loadMigratesLegacyConfig: async (params: { config: ConnectionConfig }) => {
    const { config } = params
    storageContent.clear()
    storageContent.set(constant.connectionConfig.storageKey, JSON.stringify(config))
    const migratedPayload = await serverListService.loadPayload()
    storageContent.delete(constant.connectionConfig.storageKey)
    const reloadedPayload = await serverListService.loadPayload()
    const migratedServer = migratedPayload?.servers[0]

    return {
      activeServerIdIsMigratedServerId: migratedPayload?.activeServerId === migratedServer?.id,
      host: migratedServer?.host,
      idPresent: typeof migratedServer?.id === 'string' && migratedServer.id.length > 0,
      name: migratedServer?.name,
      port: migratedServer?.port,
      persistedWithoutLegacyKey: JSON.stringify(reloadedPayload) === JSON.stringify(migratedPayload),
      serverCount: migratedPayload?.servers.length ?? 0,
      token: migratedServer?.token,
    }
  },

  loadWhenBothKeysStored: async (params: { legacyConfig: ConnectionConfig; payload: ServerListPayload }) => {
    const { legacyConfig, payload } = params
    storageContent.clear()
    storageContent.set(constant.connectionConfig.storageKey, JSON.stringify(legacyConfig))
    storageContent.set(constant.serverList.storageKey, JSON.stringify(payload))

    return await serverListService.loadPayload()
  },

  loadWhenStorageContainsRawValue: async (params: { rawValue: string }) => {
    const { rawValue } = params
    storageContent.clear()
    storageContent.set(constant.serverList.storageKey, rawValue)

    return await serverListService.loadPayload()
  },

  loadWhenStorageEmpty: async () => {
    storageContent.clear()

    return await serverListService.loadPayload()
  },

  loadWhenStorageInvalidAndLegacyConfigPresent: async (params: {
    legacyConfig: ConnectionConfig
    rawValue: string
  }) => {
    const { legacyConfig, rawValue } = params
    storageContent.clear()
    storageContent.set(constant.serverList.storageKey, rawValue)
    storageContent.set(constant.connectionConfig.storageKey, JSON.stringify(legacyConfig))
    const payload = await serverListService.loadPayload()

    return {
      legacyKeyUntouched: storageContent.get(constant.connectionConfig.storageKey) === JSON.stringify(legacyConfig),
      payloadIsUndefined: payload === undefined,
      rawKeyLeftInPlace: storageContent.get(constant.serverList.storageKey) === rawValue,
    }
  },
}
