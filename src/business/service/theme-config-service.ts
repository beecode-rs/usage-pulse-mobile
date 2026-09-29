import AsyncStorage from '@react-native-async-storage/async-storage'

import { ThemeModeMapper } from '@/business/enum/theme-mode-mapper-enum'
import { constant } from '@/util/constant'
import { themeUtil } from '@/util/theme-util'

export const themeConfigService = {
  loadMode: async (): Promise<ThemeModeMapper> => {
    const rawMode = await AsyncStorage.getItem(constant.themeConfig.storageKey)
    return themeUtil.resolveThemeMode({ rawMode })
  },

  saveMode: async (params: { mode: ThemeModeMapper }): Promise<void> => {
    const { mode } = params
    await AsyncStorage.setItem(constant.themeConfig.storageKey, mode)
  },
}
