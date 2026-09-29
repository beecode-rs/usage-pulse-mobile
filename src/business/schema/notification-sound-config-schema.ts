import { z } from 'zod'

import { SoundNameMapper } from '@/business/enum/sound-name-mapper-enum'
import { type NotificationSoundConfig } from '@/business/model/notification-sound-config-model'
import { constant } from '@/util/constant'

const { defaultConfig } = constant.notificationSound

export const notificationSoundConfigSchema: z.ZodType<NotificationSoundConfig> = z
  .object({
    sessionFinishedSoundId: z.enum(SoundNameMapper).catch(defaultConfig.sessionFinishedSoundId),
    waitingSoundId: z.enum(SoundNameMapper).catch(defaultConfig.waitingSoundId),
  })
  .catch(defaultConfig)
