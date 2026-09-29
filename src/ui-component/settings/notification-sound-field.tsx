import { type ReactElement } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { SoundNameMapper } from '@/business/enum/sound-name-mapper-enum'
import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { PlayIcon } from '@/ui-component/icon/play-icon'
import { NotificationSoundDropdown } from '@/ui-component/settings/notification-sound-dropdown'

export const NotificationSoundField = (props: {
  label: string
  onPlayPress: () => void
  onSoundIdChange: (soundId: SoundNameMapper) => void
  soundId: SoundNameMapper
}): ReactElement => {
  const { label, onPlayPress, onSoundIdChange, soundId } = props
  const theme = useTheme()
  const styles = createStyles({ theme })
  const isPlayDisabled = soundId === SoundNameMapper.NONE

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <NotificationSoundDropdown
          accessibilityLabel={`${label} sound`}
          onSoundIdChange={onSoundIdChange}
          soundId={soundId}
        />
        <Pressable
          accessibilityLabel={`Play ${label.toLowerCase()} sound`}
          accessibilityRole="button"
          disabled={isPlayDisabled}
          onPress={onPlayPress}
          style={[styles.playButton, isPlayDisabled && styles.playButtonDisabled]}
        >
          <PlayIcon color={theme.text} size={14} />
        </Pressable>
      </View>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    field: {
      gap: 8,
    },
    label: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '500',
    },
    playButton: {
      alignItems: 'center',
      backgroundColor: theme.card,
      borderColor: theme.hairline,
      borderRadius: 8,
      borderWidth: 1,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    playButtonDisabled: {
      opacity: 0.4,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
  })
}
