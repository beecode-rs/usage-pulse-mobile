import { create } from 'zustand'

import { type NotificationSoundConfig } from '@/business/model/notification-sound-config-model'
import { NotificationSoundConfigService } from '@/business/service/notification-sound-config-service'
import { constant } from '@/util/constant'

type NotificationSoundStore = {
  applyConfig: (params: { config: NotificationSoundConfig }) => void
  config: NotificationSoundConfig
  selectConfig: (params: { config: NotificationSoundConfig }) => void
}

export const useNotificationSoundStore = create<NotificationSoundStore>()((set) => ({
  applyConfig: (params: { config: NotificationSoundConfig }) => {
    const { config } = params
    set({ config })
  },
  config: constant.notificationSound.defaultConfig,
  selectConfig: (params: { config: NotificationSoundConfig }) => {
    const { config } = params
    set({ config })
    void new NotificationSoundConfigService().saveConfig({ config }).catch(() => {
      return undefined
    })
  },
}))
