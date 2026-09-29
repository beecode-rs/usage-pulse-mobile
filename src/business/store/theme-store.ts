import { create } from 'zustand'

import { ThemeModeMapper } from '@/business/enum/theme-mode-mapper-enum'
import { themeConfigService } from '@/business/service/theme-config-service'
import { constant } from '@/util/constant'

type ThemeStore = {
  applyMode: (params: { mode: ThemeModeMapper }) => void
  mode: ThemeModeMapper
  selectMode: (params: { mode: ThemeModeMapper }) => void
}

export const useThemeStore = create<ThemeStore>()((set) => ({
  applyMode: (params: { mode: ThemeModeMapper }) => {
    const { mode } = params
    set({ mode })
  },
  mode: constant.themeConfig.defaultMode,
  selectMode: (params: { mode: ThemeModeMapper }) => {
    const { mode } = params
    set({ mode })
    void themeConfigService.saveMode({ mode }).catch(() => {
      return undefined
    })
  },
}))
