import { ThemeModeMapper } from '@/business/enum/theme-mode-mapper-enum'
import { useThemeStore } from '@/business/store/theme-store'

export const useThemeMode = (): { mode: ThemeModeMapper; selectMode: (params: { mode: ThemeModeMapper }) => void } => {
  const mode = useThemeStore((state) => {
    return state.mode
  })
  const selectMode = useThemeStore((state) => {
    return state.selectMode
  })
  return { mode, selectMode }
}
