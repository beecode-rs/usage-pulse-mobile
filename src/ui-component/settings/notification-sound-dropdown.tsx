import { type ReactElement, useRef, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'

import { type SoundNameMapper } from '@/business/enum/sound-name-mapper-enum'
import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { ChevronDownIcon } from '@/ui-component/icon/chevron-down-icon'
import { NotificationSoundOption } from '@/ui-component/settings/notification-sound-option'
import { constant } from '@/util/constant'

type DropdownAnchor = { height: number; width: number; x: number; y: number }

const DROPDOWN_GAP = 4
const DROPDOWN_VERTICAL_PADDING = 8

const resolveSelectedLabel = (params: { soundId: SoundNameMapper }): string => {
  const { soundId } = params
  const option = constant.notificationSound.optionCatalog.find((candidate) => {
    return candidate.soundId === soundId
  })
  return option?.label ?? soundId
}

const resolveDropdownTop = (params: { anchor: DropdownAnchor; windowHeight: number }): number => {
  const { anchor, windowHeight } = params
  const dropdownHeight =
    constant.notificationSound.optionCatalog.length * constant.notificationSound.dropdownItemHeight +
    DROPDOWN_VERTICAL_PADDING
  const belowTop = anchor.y + anchor.height + DROPDOWN_GAP
  if (belowTop + dropdownHeight <= windowHeight) {
    return belowTop
  }
  return Math.max(anchor.y - dropdownHeight - DROPDOWN_GAP, 0)
}

export const NotificationSoundDropdown = (props: {
  accessibilityLabel: string
  onSoundIdChange: (soundId: SoundNameMapper) => void
  soundId: SoundNameMapper
}): ReactElement => {
  const { accessibilityLabel, onSoundIdChange, soundId } = props
  const [anchor, setAnchor] = useState<DropdownAnchor | undefined>(undefined)
  const triggerRef = useRef<View>(null)
  const { height: windowHeight } = useWindowDimensions()
  const theme = useTheme()
  const styles = createStyles({ theme })

  const handleTriggerPress = (): void => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ height, width, x, y })
    })
  }

  const handleClose = (): void => {
    setAnchor(undefined)
  }

  const handleSelect = (params: { selectedSoundId: SoundNameMapper }): void => {
    const { selectedSoundId } = params
    setAnchor(undefined)
    onSoundIdChange(selectedSoundId)
  }

  return (
    <View style={styles.wrapper}>
      <Pressable
        ref={triggerRef}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={handleTriggerPress}
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>{resolveSelectedLabel({ soundId })}</Text>
        <ChevronDownIcon color={theme.muted} />
      </Pressable>
      <Modal
        animationType="fade"
        onRequestClose={handleClose}
        statusBarTranslucent
        transparent
        visible={anchor !== undefined}
      >
        <Pressable onPress={handleClose} style={styles.backdrop}>
          {anchor !== undefined && (
            <View
              style={[
                styles.dropdown,
                { left: anchor.x, top: resolveDropdownTop({ anchor, windowHeight }), width: anchor.width },
              ]}
            >
              {constant.notificationSound.optionCatalog.map((option) => {
                return (
                  <NotificationSoundOption
                    key={option.soundId}
                    isSelected={option.soundId === soundId}
                    label={option.label}
                    onPress={() => {
                      return handleSelect({ selectedSoundId: option.soundId })
                    }}
                  />
                )
              })}
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    backdrop: {
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      flex: 1,
    },
    dropdown: {
      backgroundColor: theme.card,
      borderColor: theme.hairline,
      borderRadius: 10,
      borderWidth: 1,
      elevation: 12,
      overflow: 'hidden',
      paddingVertical: DROPDOWN_VERTICAL_PADDING / 2,
      position: 'absolute',
      shadowColor: '#000000',
      shadowOffset: { height: 8, width: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    trigger: {
      alignItems: 'center',
      backgroundColor: theme.card,
      borderColor: theme.hairline,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      height: 44,
      justifyContent: 'space-between',
      paddingHorizontal: 14,
    },
    triggerText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '500',
    },
    wrapper: {
      flex: 1,
    },
  })
}
