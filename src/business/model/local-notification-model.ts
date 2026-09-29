import { type SoundNameMapper } from '@/business/enum/sound-name-mapper-enum'

export type LocalNotificationModel = {
  accentColor?: string
  body: string
  sessionId?: string
  soundId?: SoundNameMapper
  title: string
}
