import AsyncStorage from '@react-native-async-storage/async-storage'

import { type ConnectionConfig } from '@/business/model/connection-config-model'
import { type ServerEntry, type ServerListPayload } from '@/business/model/server-model'
import { connectionConfigService } from '@/business/service/connection-config-service'
import { serverListPayloadSchema } from '@/business/schema/server-list-schema'
import { constant } from '@/util/constant'

export const serverListService = {
  createServerEntry: (params: { config: ConnectionConfig; name: string }): ServerEntry => {
    const { config, name } = params
    return {
      host: config.host,
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      name,
      port: config.port,
      token: config.token,
    }
  },

  loadPayload: async (): Promise<ServerListPayload | undefined> => {
    const rawPayload = await AsyncStorage.getItem(constant.serverList.storageKey)

    if (rawPayload === null) {
      const legacyConfig = await connectionConfigService.loadConfig()

      if (legacyConfig === undefined) {
        return undefined
      }

      const legacyServer = serverListService.createServerEntry({ config: legacyConfig, name: '' })
      const payload = { activeServerId: legacyServer.id, servers: [legacyServer] }
      await AsyncStorage.setItem(constant.serverList.storageKey, JSON.stringify(payload))
      return payload
    }

    try {
      return serverListPayloadSchema.parse(JSON.parse(rawPayload))
    } catch {
      return undefined
    }
  },

  savePayload: async (params: { payload: ServerListPayload }): Promise<void> => {
    const { payload } = params
    await AsyncStorage.setItem(constant.serverList.storageKey, JSON.stringify(payload))
  },
}
