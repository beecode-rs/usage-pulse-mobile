import { useEffect } from 'react'

import { NotificationSoundConfigService } from '@/business/service/notification-sound-config-service'
import { useNotificationSoundStore } from '@/business/store/notification-sound-store'

export const useNotificationSoundBootstrap = (): void => {
  useEffect(() => {
    void new NotificationSoundConfigService()
      .loadConfig()
      .then((config) => {
        useNotificationSoundStore.getState().applyConfig({ config })
        return undefined
      })
      .catch(() => {
        return undefined
      })
  }, [])
}
