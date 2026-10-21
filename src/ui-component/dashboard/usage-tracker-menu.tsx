import { type ReactElement, useRef, useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { HeaderMenuItem } from '@/ui-component/header/header-menu-item'
import { MoreIcon } from '@/ui-component/icon/more-icon'
import { PauseIcon } from '@/ui-component/icon/pause-icon'
import { PlayIcon } from '@/ui-component/icon/play-icon'
import { RetryIcon } from '@/ui-component/icon/retry-icon'

type UsageTrackerMenuProps = {
  isPaused: boolean
  onPauseResumePress: () => void
  onRefreshPress: () => void
}

type PauseResumeItemView = {
  icon: ReactElement
  label: string
}

const resolvePauseResumeItemView = (params: { isPaused: boolean; theme: ThemePalette }): PauseResumeItemView => {
  const { isPaused, theme } = params

  if (isPaused) {
    return { icon: <PlayIcon color={theme.accent} />, label: 'Resume auto-refresh' }
  }

  return { icon: <PauseIcon color={theme.muted} />, label: 'Pause auto-refresh' }
}

const resolveTriggerIconColor = (params: { isMenuOpen: boolean; theme: ThemePalette }): string => {
  const { isMenuOpen, theme } = params

  if (isMenuOpen) {
    return theme.text
  }

  return theme.muted
}

export const UsageTrackerMenu = (props: UsageTrackerMenuProps): ReactElement => {
  const { isPaused, onPauseResumePress, onRefreshPress } = props
  const [dropdownTop, setDropdownTop] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const theme = useTheme()
  const styles = createStyles({ theme })
  const triggerRef = useRef<View>(null)
  const pauseResumeItemView = resolvePauseResumeItemView({ isPaused, theme })

  const handleTriggerPress = (): void => {
    triggerRef.current?.measure((_x, _y, _width, height, _pageX, pageY) => {
      setDropdownTop(pageY + height + 8)
      setIsMenuOpen(true)
    })
  }

  const handleClose = (): void => {
    setIsMenuOpen(false)
  }

  const handleMenuSelect = (params: { onPress: () => void }): void => {
    const { onPress } = params

    setIsMenuOpen(false)
    onPress()
  }

  return (
    <View>
      <Pressable
        accessibilityLabel="Open tracker menu"
        accessibilityRole="button"
        hitSlop={8}
        onPress={handleTriggerPress}
        ref={triggerRef}
        style={styles.trigger}
      >
        <MoreIcon color={resolveTriggerIconColor({ isMenuOpen, theme })} />
      </Pressable>
      <Modal animationType="fade" onRequestClose={handleClose} statusBarTranslucent transparent visible={isMenuOpen}>
        <Pressable onPress={handleClose} style={styles.backdrop}>
          <View style={[styles.dropdown, { top: dropdownTop }]}>
            <HeaderMenuItem
              icon={<RetryIcon color={theme.muted} />}
              label="Refresh now"
              onPress={() => {
                return handleMenuSelect({ onPress: onRefreshPress })
              }}
            />
            <HeaderMenuItem
              icon={pauseResumeItemView.icon}
              label={pauseResumeItemView.label}
              onPress={() => {
                return handleMenuSelect({ onPress: onPauseResumePress })
              }}
            />
          </View>
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
      minWidth: 216,
      overflow: 'hidden',
      paddingBottom: 4,
      paddingTop: 4,
      position: 'absolute',
      right: 12,
      shadowColor: '#000000',
      shadowOffset: { height: 8, width: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    trigger: {
      alignItems: 'center',
      backgroundColor: theme.subtleTint,
      borderRadius: 6,
      justifyContent: 'center',
      padding: 6,
    },
  })
}
