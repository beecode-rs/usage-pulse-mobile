import { type ReactElement, useRef, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { CopyIcon } from '@/ui-component/icon/copy-icon'
import { EditIcon } from '@/ui-component/icon/edit-icon'
import { MoreIcon } from '@/ui-component/icon/more-icon'
import { TrashIcon } from '@/ui-component/icon/trash-icon'

type ServerRowMenuProps = {
  onClonePress: () => void
  onDeletePress: () => void
  onEditPress: () => void
}

type ServerRowMenuItemView = {
  color: string
  icon: ReactElement
  label: string
  onPress: () => void
}

const resolveTriggerIconColor = (params: { isMenuOpen: boolean; theme: ThemePalette }): string => {
  const { isMenuOpen, theme } = params

  if (isMenuOpen) {
    return theme.text
  }

  return theme.muted
}

const resolvePressedBackground = (params: { isPressed: boolean; theme: ThemePalette }): string => {
  const { isPressed, theme } = params

  if (isPressed) {
    return theme.track
  }

  return 'transparent'
}

const resolveMenuItems = (params: {
  onClonePress: () => void
  onDeletePress: () => void
  onEditPress: () => void
  theme: ThemePalette
}): ServerRowMenuItemView[] => {
  const { onClonePress, onDeletePress, onEditPress, theme } = params
  return [
    { color: '#60a5fa', icon: <EditIcon color="#60a5fa" />, label: 'Edit', onPress: onEditPress },
    { color: theme.good, icon: <CopyIcon color={theme.good} />, label: 'Clone', onPress: onClonePress },
    { color: theme.critical, icon: <TrashIcon color={theme.critical} />, label: 'Delete', onPress: onDeletePress },
  ]
}

export const ServerRowMenu = (props: ServerRowMenuProps): ReactElement => {
  const { onClonePress, onDeletePress, onEditPress } = props
  const [dropdownTop, setDropdownTop] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const theme = useTheme()
  const styles = createStyles({ theme })
  const triggerRef = useRef<View>(null)
  const menuItems = resolveMenuItems({ onClonePress, onDeletePress, onEditPress, theme })

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

  const renderMenuItem = (item: ServerRowMenuItemView): ReactElement => {
    return (
      <Pressable
        key={item.label}
        onPress={() => {
          return handleMenuSelect({ onPress: item.onPress })
        }}
        style={(state) => {
          return { backgroundColor: resolvePressedBackground({ isPressed: state.pressed, theme }) }
        }}
      >
        <View style={styles.item}>
          <View style={styles.iconWrapper}>{item.icon}</View>
          <Text style={[styles.label, { color: item.color }]}>{item.label}</Text>
        </View>
      </Pressable>
    )
  }

  return (
    <View>
      <Pressable
        accessibilityLabel="Server actions"
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
          <View style={[styles.dropdown, { top: dropdownTop }]}>{menuItems.map(renderMenuItem)}</View>
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
      minWidth: 160,
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
    iconWrapper: {
      alignItems: 'center',
      height: 16,
      justifyContent: 'center',
      width: 16,
    },
    item: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    label: {
      fontSize: 14,
    },
    trigger: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
    },
  })
}
