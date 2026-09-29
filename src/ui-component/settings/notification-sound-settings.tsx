import { type ReactElement, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { type SoundNameMapper } from '@/business/enum/sound-name-mapper-enum'
import { useNotificationSoundConfig } from '@/business/hook/use-notification-sound-config'
import { SoundPreviewService } from '@/business/service/sound-preview-service'
import { NotificationSoundField } from '@/ui-component/settings/notification-sound-field'

export const NotificationSoundSettings = (): ReactElement => {
  const { config, selectConfig } = useNotificationSoundConfig()
  const [soundPreview] = useState(() => {
    return new SoundPreviewService()
  })

  useEffect(() => {
    return () => {
      soundPreview.release()
    }
  }, [soundPreview])

  const handleSoundIdChange = (params: { key: keyof typeof config; soundId: SoundNameMapper }): void => {
    const { key, soundId } = params
    selectConfig({ config: { ...config, [key]: soundId } })
    soundPreview.play({ soundId })
  }

  return (
    <View style={styles.list}>
      <NotificationSoundField
        label="Finished"
        onPlayPress={() => {
          return soundPreview.play({ soundId: config.sessionFinishedSoundId })
        }}
        onSoundIdChange={(soundId) => {
          return handleSoundIdChange({ key: 'sessionFinishedSoundId', soundId })
        }}
        soundId={config.sessionFinishedSoundId}
      />
      <NotificationSoundField
        label="Needs you"
        onPlayPress={() => {
          return soundPreview.play({ soundId: config.waitingSoundId })
        }}
        onSoundIdChange={(soundId) => {
          return handleSoundIdChange({ key: 'waitingSoundId', soundId })
        }}
        soundId={config.waitingSoundId}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 16,
  },
})
