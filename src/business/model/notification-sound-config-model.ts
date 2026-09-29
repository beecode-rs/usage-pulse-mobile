import { type SoundNameMapper } from '@/business/enum/sound-name-mapper-enum'

export type NotificationSoundConfig = {
  sessionFinishedSoundId: SoundNameMapper
  waitingSoundId: SoundNameMapper
}
