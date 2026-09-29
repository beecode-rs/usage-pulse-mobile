import { vi } from 'vitest'

import { ThemeModeMapper } from '@/business/enum/theme-mode-mapper-enum'
import { themeConfigService } from '@/business/service/theme-config-service'
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

export const themeConfigServiceContractHarness = {
  loadAfterSave: async (params: { mode: ThemeModeMapper }) => {
    const { mode } = params
    storageContent.clear()
    await themeConfigService.saveMode({ mode })
    return await themeConfigService.loadMode()
  },
  loadWhenStorageContainsInvalidValue: async () => {
    storageContent.clear()
    storageContent.set(constant.themeConfig.storageKey, 'high-contrast')
    return await themeConfigService.loadMode()
  },
  loadWhenStorageEmpty: async () => {
    storageContent.clear()
    return await themeConfigService.loadMode()
  },
}
