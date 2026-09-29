import { useEffect } from 'react'

import { themeConfigService } from '@/business/service/theme-config-service'
import { useThemeStore } from '@/business/store/theme-store'

export const useThemeBootstrap = (): void => {
  useEffect(() => {
    void themeConfigService
      .loadMode()
      .then((mode) => {
        useThemeStore.getState().applyMode({ mode })
        return undefined
      })
      .catch(() => {
        return undefined
      })
  }, [])
}
