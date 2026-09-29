import { type NotificationSoundConfig } from '@/business/model/notification-sound-config-model'
import { useNotificationSoundStore } from '@/business/store/notification-sound-store'

export const useNotificationSoundConfig = (): {
  config: NotificationSoundConfig
  selectConfig: (params: { config: NotificationSoundConfig }) => void
} => {
  const config = useNotificationSoundStore((state) => {
    return state.config
  })
  const selectConfig = useNotificationSoundStore((state) => {
    return state.selectConfig
  })
  return { config, selectConfig }
}
