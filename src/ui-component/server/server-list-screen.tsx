import { type ReactElement } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/business/hook/use-theme'
import { type ServerEntry } from '@/business/model/server-model'
import { type ThemePalette } from '@/business/model/theme-model'
import { useServerStore } from '@/business/store/server-store'
import { constant } from '@/util/constant'
import { ServerIcon } from '@/ui-component/icon/server-icon'
import { ServerRowMenu } from '@/ui-component/server/server-row-menu'

type ServerListScreenProps = {
  onAddPress: () => void
  onBackPress?: (() => void) | undefined
  onCloneServer: (params: { serverId: string }) => void
  onDeleteServer: (params: { serverId: string }) => void
  onEditServer: (params: { serverId: string }) => void
  onSelectServer: (params: { server: ServerEntry }) => void
}

const resolveServerLabel = (params: { host: string; name: string }): string => {
  const { host, name } = params
  if (name === '') {
    return host
  }
  return name
}

const resolveServerLocation = (params: { host: string; port: number }): string => {
  const { host, port } = params
  if (port === constant.connectionForm.defaultPort) {
    return host
  }
  return `${host}:${String(port)}`
}

export const ServerListScreen = (props: ServerListScreenProps): ReactElement => {
  const { onAddPress, onBackPress, onCloneServer, onDeleteServer, onEditServer, onSelectServer } = props
  const { activeServerId, servers } = useServerStore()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const styles = createStyles({ theme })

  const handleServerSelect = (params: { server: ServerEntry }): void => {
    const { server } = params
    onSelectServer({ server })
  }

  const handleEditPress = (params: { server: ServerEntry }): void => {
    const { server } = params
    onEditServer({ serverId: server.id })
  }

  const handleClonePress = (params: { server: ServerEntry }): void => {
    const { server } = params
    onCloneServer({ serverId: server.id })
  }

  const handleDeletePress = (params: { server: ServerEntry }): void => {
    const { server } = params
    const label = resolveServerLabel({ host: server.host, name: server.name })
    Alert.alert('Delete server', `Remove ${label} from your server list?`, [
      { style: 'cancel', text: 'Cancel' },
      {
        onPress: () => {
          onDeleteServer({ serverId: server.id })
        },
        style: 'destructive',
        text: 'Delete',
      },
    ])
  }

  const renderHeaderLeading = (): ReactElement => {
    if (onBackPress === undefined) {
      return <View style={styles.headerSpacer} />
    }
    return (
      <Pressable hitSlop={8} onPress={onBackPress} style={styles.sideButtonWrapper}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    )
  }

  const renderServerRow = (server: ServerEntry): ReactElement => {
    const isActive = server.id === activeServerId
    return (
      <Pressable
        key={server.id}
        onPress={() => {
          return handleServerSelect({ server })
        }}
        style={styles.row}
      >
        <ServerIcon color={theme.muted} />
        <View style={styles.rowText}>
          <View style={styles.rowLabelLine}>
            <Text style={styles.rowLabel}>{resolveServerLabel({ host: server.host, name: server.name })}</Text>
            {isActive && (
              <View style={styles.rowBadgePill}>
                <Text style={styles.rowBadgeText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={styles.rowDetail}>{resolveServerLocation({ host: server.host, port: server.port })}</Text>
        </View>
        <ServerRowMenu
          onClonePress={() => {
            return handleClonePress({ server })
          }}
          onDeletePress={() => {
            return handleDeletePress({ server })
          }}
          onEditPress={() => {
            return handleEditPress({ server })
          }}
        />
      </Pressable>
    )
  }

  const renderEmptyBox = (): ReactElement => {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyTitle}>No servers yet</Text>
        <Text style={styles.emptyText}>Add a server running the Usage Pulse desktop app to see live usage.</Text>
        <Pressable hitSlop={8} onPress={onAddPress} style={styles.sideButtonWrapper}>
          <Text style={styles.linkText}>Add a server</Text>
        </Pressable>
      </View>
    )
  }

  const renderListBody = (): ReactElement => {
    if (servers.length === 0) {
      return renderEmptyBox()
    }
    return <View style={styles.rowList}>{servers.map(renderServerRow)}</View>
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        {renderHeaderLeading()}
        <Text style={styles.headerTitle}>Servers</Text>
        <Pressable
          accessibilityLabel="Add server"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onAddPress}
          style={styles.sideButtonWrapper}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>{renderListBody()}</ScrollView>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    addButtonText: {
      color: theme.accent,
      fontSize: 24,
      fontWeight: '600',
    },
    backText: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: '600',
    },
    content: {
      gap: 12,
      padding: 16,
    },
    emptyBox: {
      alignItems: 'center',
      backgroundColor: theme.card,
      borderColor: theme.hairline,
      borderRadius: 12,
      borderWidth: 1,
      gap: 8,
      padding: 24,
    },
    emptyText: {
      color: theme.muted,
      fontSize: 13,
      textAlign: 'center',
    },
    emptyTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '600',
    },
    header: {
      alignItems: 'center',
      backgroundColor: theme.background,
      borderBottomColor: theme.hairline,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 10,
      paddingHorizontal: 16,
    },
    headerSpacer: {
      width: 38,
    },
    headerTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
    linkText: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: '600',
    },
    row: {
      alignItems: 'center',
      backgroundColor: theme.card,
      borderColor: theme.hairline,
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowBadgePill: {
      backgroundColor: theme.track,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    rowBadgeText: {
      color: theme.good,
      fontSize: 10,
      fontWeight: '600',
    },
    rowDetail: {
      color: theme.muted,
      fontSize: 12,
      opacity: 0.8,
    },
    rowLabel: {
      color: theme.text,
      fontSize: 14,
    },
    rowLabelLine: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    rowList: {
      gap: 10,
    },
    rowText: {
      flex: 1,
      gap: 3,
    },
    screen: {
      backgroundColor: theme.background,
      flex: 1,
    },
    sideButtonWrapper: {
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
  })
}
