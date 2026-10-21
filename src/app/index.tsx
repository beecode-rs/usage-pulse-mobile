import { useRouter } from 'expo-router'
import { type ReactElement, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ServerEntry } from '@/business/model/server-model'
import { type ThemePalette } from '@/business/model/theme-model'
import { stateSyncServiceSingleton } from '@/business/service/state-sync-service'
import { useServerStore } from '@/business/store/server-store'
import { ServerListScreen } from '@/ui-component/server/server-list-screen'

const resolveBackPress = (params: { canGoBack: boolean; onBackPress: () => void }): (() => void) | undefined => {
  const { canGoBack, onBackPress } = params
  if (!canGoBack) {
    return undefined
  }
  return onBackPress
}

export default function ServerListRoute(): ReactElement {
  const router = useRouter()
  const { hasHydrated } = useServerStore()
  const theme = useTheme()
  const styles = createStyles({ theme })

  useEffect(() => {
    void useServerStore.getState().hydrate()
  }, [])

  const handleBackPress = (): void => {
    router.back()
  }

  const handleAddPress = (): void => {
    router.push('/servers/add')
  }

  const handleSelectServer = (params: { server: ServerEntry }): void => {
    const { server } = params
    void useServerStore
      .getState()
      .selectServer({ server })
      .then(() => {
        return stateSyncServiceSingleton().syncBySavedConfig()
      })
      .catch(() => {
        return undefined
      })
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/dashboard')
  }

  const handleEditServer = (params: { serverId: string }): void => {
    const { serverId } = params
    router.push({ pathname: '/servers/add', params: { editId: serverId } })
  }

  const handleCloneServer = (params: { serverId: string }): void => {
    const { serverId } = params
    router.push({ pathname: '/servers/add', params: { cloneId: serverId } })
  }

  const handleDeleteServer = (params: { serverId: string }): void => {
    const { serverId } = params
    const isActive = useServerStore.getState().activeServerId === serverId
    void useServerStore
      .getState()
      .removeServer({ serverId })
      .then(() => {
        if (isActive) {
          stateSyncServiceSingleton().disconnect()
        }
        return undefined
      })
      .catch(() => {
        return undefined
      })
  }

  if (!hasHydrated) {
    return <View style={styles.screen} />
  }

  return (
    <ServerListScreen
      onAddPress={handleAddPress}
      onBackPress={resolveBackPress({ canGoBack: router.canGoBack(), onBackPress: handleBackPress })}
      onCloneServer={handleCloneServer}
      onDeleteServer={handleDeleteServer}
      onEditServer={handleEditServer}
      onSelectServer={handleSelectServer}
    />
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    screen: {
      backgroundColor: theme.background,
      flex: 1,
    },
  })
}
