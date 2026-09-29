import { type ReactElement, useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { HeaderMenuItem } from '@/ui-component/dashboard/header-menu-item'
import { GearIcon } from '@/ui-component/icon/gear-icon'
import { InfoIcon } from '@/ui-component/icon/info-icon'
import { MoreIcon } from '@/ui-component/icon/more-icon'
import { PlugIcon } from '@/ui-component/icon/plug-icon'
import { PowerIcon } from '@/ui-component/icon/power-icon'
import { RetryIcon } from '@/ui-component/icon/retry-icon'

type HeaderMenuProps = {
  dropdownTopOffset: number
  isDisconnected: boolean
  onAboutPress: () => void
  onConnectPress: () => void
  onDisconnectPress: () => void
  onRetryConnectPress: () => void
  onSettingsPress: () => void
}

type ConnectionItemView = {
  icon: ReactElement
  label: string
  onPress: () => void
}

const resolveConnectionItemView = (params: {
  isDisconnected: boolean
  onConnectPress: () => void
  onDisconnectPress: () => void
  theme: ThemePalette
}): ConnectionItemView => {
  const { isDisconnected, onConnectPress, onDisconnectPress, theme } = params

  if (isDisconnected) {
    return { icon: <PlugIcon color={theme.muted} />, label: 'Connect', onPress: onConnectPress }
  }

  return { icon: <PowerIcon color={theme.muted} />, label: 'Disconnect', onPress: onDisconnectPress }
}

const resolveTriggerIconColor = (params: { isMenuOpen: boolean; theme: ThemePalette }): string => {
  const { isMenuOpen, theme } = params

  if (isMenuOpen) {
    return theme.text
  }

  return theme.muted
}

export const HeaderMenu = (props: HeaderMenuProps): ReactElement => {
  const {
    dropdownTopOffset,
    isDisconnected,
    onAboutPress,
    onConnectPress,
    onDisconnectPress,
    onRetryConnectPress,
    onSettingsPress,
  } = props
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const theme = useTheme()
  const styles = createStyles({ theme })
  const connectionItemView = resolveConnectionItemView({ isDisconnected, onConnectPress, onDisconnectPress, theme })

  const handleTriggerPress = (): void => {
    setIsMenuOpen(true)
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
        accessibilityLabel="Open menu"
        accessibilityRole="button"
        hitSlop={8}
        onPress={handleTriggerPress}
        style={styles.trigger}
      >
        <MoreIcon color={resolveTriggerIconColor({ isMenuOpen, theme })} />
      </Pressable>
      <Modal animationType="fade" onRequestClose={handleClose} statusBarTranslucent transparent visible={isMenuOpen}>
        <Pressable onPress={handleClose} style={styles.backdrop}>
          <View style={[styles.dropdown, { top: dropdownTopOffset }]}>
            <HeaderMenuItem
              icon={connectionItemView.icon}
              label={connectionItemView.label}
              onPress={() => {
                return handleMenuSelect({ onPress: connectionItemView.onPress })
              }}
            />
            {!isDisconnected && (
              <HeaderMenuItem
                icon={<RetryIcon color={theme.muted} />}
                label="Retry to connect"
                onPress={() => {
                  return handleMenuSelect({ onPress: onRetryConnectPress })
                }}
              />
            )}
            <HeaderMenuItem
              icon={<GearIcon color={theme.muted} />}
              label="Settings"
              onPress={() => {
                return handleMenuSelect({ onPress: onSettingsPress })
              }}
            />
            <HeaderMenuItem
              icon={<InfoIcon color={theme.muted} />}
              label="About"
              onPress={() => {
                return handleMenuSelect({ onPress: onAboutPress })
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
