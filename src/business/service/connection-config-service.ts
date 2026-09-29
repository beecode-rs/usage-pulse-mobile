import AsyncStorage from '@react-native-async-storage/async-storage'

import { type ConnectionConfig } from '@/business/model/connection-config-model'
import { constant } from '@/util/constant'

export const connectionConfigService = {
  loadConfig: async (): Promise<ConnectionConfig | undefined> => {
    const rawConfig = await AsyncStorage.getItem(constant.connectionConfig.storageKey)

    if (rawConfig === null) {
      return undefined
    }

    return JSON.parse(rawConfig) as ConnectionConfig
  },

  saveConfig: async (params: { config: ConnectionConfig }): Promise<void> => {
    const { config } = params
    await AsyncStorage.setItem(constant.connectionConfig.storageKey, JSON.stringify(config))
  },
}
