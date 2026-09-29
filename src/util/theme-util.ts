import { ThemeModeMapper } from '@/business/enum/theme-mode-mapper-enum'
import { type ThemePalette, type ThemeScheme } from '@/business/model/theme-model'
import { constant } from '@/util/constant'
import { theme } from '@/util/theme'

export const themeUtil = {
  resolvePalette(params: { mode: ThemeModeMapper; systemScheme: ThemeScheme | 'unspecified' | null }): ThemePalette {
    const { mode, systemScheme } = params
    const scheme = themeUtil.resolveScheme({ mode, systemScheme })
    return theme[scheme]
  },

  resolveScheme(params: { mode: ThemeModeMapper; systemScheme: ThemeScheme | 'unspecified' | null }): ThemeScheme {
    const { mode, systemScheme } = params
    switch (mode) {
      case ThemeModeMapper.DARK: {
        return 'dark'
      }
      case ThemeModeMapper.LIGHT: {
        return 'light'
      }
      case ThemeModeMapper.AUTO: {
        if (systemScheme === 'light') {
          return 'light'
        }
        return 'dark'
      }
      default: {
        throw new Error('unsupported theme mode')
      }
    }
  },

  resolveThemeMode(params: { rawMode: string | null }): ThemeModeMapper {
    const { rawMode } = params
    switch (rawMode) {
      case ThemeModeMapper.AUTO:
      case ThemeModeMapper.DARK:
      case ThemeModeMapper.LIGHT: {
        return rawMode
      }
      default: {
        return constant.themeConfig.defaultMode
      }
    }
  },
}
