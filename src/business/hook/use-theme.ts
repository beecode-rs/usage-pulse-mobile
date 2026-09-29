import { useColorScheme } from 'react-native'

import { type ThemePalette } from '@/business/model/theme-model'
import { useThemeStore } from '@/business/store/theme-store'
import { themeUtil } from '@/util/theme-util'

export const useTheme = (): ThemePalette => {
  const mode = useThemeStore((state) => {
    return state.mode
  })
  const systemScheme = useColorScheme()
  return themeUtil.resolvePalette({ mode, systemScheme })
}
