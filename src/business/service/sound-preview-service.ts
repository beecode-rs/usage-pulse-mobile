import { type AudioPlayer, type AudioSource, createAudioPlayer } from 'expo-audio'
import { Platform } from 'react-native'

import { SoundNameMapper } from '@/business/enum/sound-name-mapper-enum'
import { constant } from '@/util/constant'

export class SoundPreviewService {
  protected _player: AudioPlayer | undefined

  play(params: { soundId: SoundNameMapper }): void {
    const { soundId } = params
    const asset = this._resolveAsset({ soundId })
    if (asset === undefined) {
      return
    }
    this.release()
    this._player = createAudioPlayer(asset)
    this._player.play()
  }

  release(): void {
    this._player?.remove()
    this._player = undefined
  }

  protected _resolveAsset(params: { soundId: SoundNameMapper }): AudioSource | number | undefined {
    const { soundId } = params
    switch (soundId) {
      case SoundNameMapper.BEEP: {
        return require('@/assets/sounds/beep.wav') as number
      }
      case SoundNameMapper.CHIME: {
        return require('@/assets/sounds/chime.wav') as number
      }
      case SoundNameMapper.DING: {
        return require('@/assets/sounds/ding.wav') as number
      }
      case SoundNameMapper.FANFARE: {
        return require('@/assets/sounds/fanfare.wav') as number
      }
      case SoundNameMapper.NONE: {
        return undefined
      }
      case SoundNameMapper.PING: {
        return require('@/assets/sounds/ping.wav') as number
      }
      case SoundNameMapper.SUCCESS: {
        return require('@/assets/sounds/success.wav') as number
      }
      case SoundNameMapper.SYSTEM_DEFAULT: {
        return this._resolveSystemDefaultSource()
      }
      default: {
        throw new Error('unsupported sound name')
      }
    }
  }

  protected _resolveSystemDefaultSource(): AudioSource | undefined {
    if (Platform.OS !== 'android') {
      return undefined
    }
    return { uri: constant.notificationSound.systemDefaultAndroidUri }
  }
}
