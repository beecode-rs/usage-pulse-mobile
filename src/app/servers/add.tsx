import { useLocalSearchParams, useRouter } from 'expo-router'
import { type ReactElement, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { type ConnectionConfig } from '@/business/model/connection-config-model'
import { type ServerEntry } from '@/business/model/server-model'
import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { serverListService } from '@/business/service/server-list-service'
import { stateSyncServiceSingleton } from '@/business/service/state-sync-service'
import { useServerStore } from '@/business/store/server-store'
import { type ServerFormInitialValues, ServerFormScreen } from '@/ui-component/server/server-form-screen'

type ServerFormTarget =
  { mode: 'add'; server: undefined } | { mode: 'clone'; server: ServerEntry } | { mode: 'edit'; server: ServerEntry }

const resolveFirstParam = (params: { value: string | string[] | undefined }): string | undefined => {
  const { value } = params
  if (Array.isArray(value)) {
    return value[0]
  }
  return value
}

const resolveFormTarget = (params: {
  cloneId: string | undefined
  editId: string | undefined
  servers: ServerEntry[]
}): ServerFormTarget => {
  const { cloneId, editId, servers } = params
  if (editId !== undefined) {
    const found = servers.find((existing) => {
      return existing.id === editId
    })
    if (found !== undefined) {
      return { mode: 'edit', server: found }
    }
  }
  if (cloneId !== undefined) {
    const found = servers.find((existing) => {
      return existing.id === cloneId
    })
    if (found !== undefined) {
      return { mode: 'clone', server: found }
    }
  }
  return { mode: 'add', server: undefined }
}

const resolveInitialValues = (params: { target: ServerFormTarget }): ServerFormInitialValues => {
  const { target } = params
  if (target.mode === 'add') {
    return { host: '', name: '', port: '', token: '' }
  }
  return {
    host: target.server.host,
    name: target.server.name,
    port: String(target.server.port),
    token: target.server.token,
  }
}

export default function AddServerRoute(): ReactElement {
  const router = useRouter()
  const searchParams = useLocalSearchParams<{ cloneId?: string; editId?: string }>()
  const { hasHydrated, servers } = useServerStore()
  const theme = useTheme()
  const styles = createStyles({ theme })
  const formTarget = resolveFormTarget({
    cloneId: resolveFirstParam({ value: searchParams.cloneId }),
    editId: resolveFirstParam({ value: searchParams.editId }),
    servers,
  })

  useEffect(() => {
    void useServerStore.getState().hydrate()
  }, [])

  const handleBackPress = (): void => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/')
  }

  const handleSave = (params: { config: ConnectionConfig; name: string }): void => {
    const { config, name } = params
    if (formTarget.mode === 'edit') {
      const updatedServer: ServerEntry = {
        host: config.host,
        id: formTarget.server.id,
        name,
        port: config.port,
        token: config.token,
      }
      void useServerStore
        .getState()
        .updateServer({ server: updatedServer })
        .then(() => {
          if (useServerStore.getState().activeServerId === updatedServer.id) {
            return stateSyncServiceSingleton().syncBySavedConfig()
          }
          return undefined
        })
        .catch(() => {
          return undefined
        })
      handleBackPress()
      return
    }
    const server = serverListService.createServerEntry({ config, name })
    void useServerStore
      .getState()
      .addAndSelectServer({ server })
      .then(() => {
        return stateSyncServiceSingleton().syncBySavedConfig()
      })
      .catch(() => {
        return undefined
      })
    router.replace('/dashboard')
  }

  if (!hasHydrated) {
    return <View style={styles.screen} />
  }

  return (
    <ServerFormScreen
      initialValues={resolveInitialValues({ target: formTarget })}
      mode={formTarget.mode}
      onBackPress={handleBackPress}
      onSave={handleSave}
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
