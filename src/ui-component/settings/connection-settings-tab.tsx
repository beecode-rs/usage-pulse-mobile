import { type ReactElement, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type ConnectionConfig } from '@/business/model/connection-config-model'
import { type ThemePalette } from '@/business/model/theme-model'
import { connectionConfigService } from '@/business/service/connection-config-service'
import { stateSyncServiceSingleton } from '@/business/service/state-sync-service'
import { connectionFormUtil } from '@/util/connection-form-util'
import { ConnectionHint } from '@/ui-component/connection/connection-hint'
import { HostField } from '@/ui-component/connection/host-field'
import { PortField } from '@/ui-component/connection/port-field'
import { TestConnectionButton } from '@/ui-component/connection/test-connection-button'
import { TokenField } from '@/ui-component/connection/token-field'

export const ConnectionSettingsTab = (): ReactElement => {
  const [host, setHost] = useState('')
  const [port, setPort] = useState('')
  const [token, setToken] = useState('')
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const theme = useTheme()
  const styles = createStyles({ theme })

  useEffect(() => {
    void connectionConfigService.loadConfig().then((config) => {
      if (config === undefined) {
        return
      }
      setHost(config.host)
      setPort(String(config.port))
      setToken(config.token)
    })
  }, [])

  const handleHostChange = (value: string): void => {
    setHasSaved(false)
    setHost(value)
  }

  const handlePortChange = (value: string): void => {
    setHasSaved(false)
    setPort(value)
  }

  const handleTokenChange = (value: string): void => {
    setHasSaved(false)
    setToken(value)
  }

  const handleSave = (): void => {
    setHasAttemptedSave(true)
    setHasSaved(false)
    const portNumber = connectionFormUtil.resolvePortNumber({ port })
    if (portNumber === undefined) {
      return
    }
    const config: ConnectionConfig = { host, port: portNumber, token }
    void connectionConfigService
      .saveConfig({ config })
      .then(() => {
        setHasSaved(true)
        return stateSyncServiceSingleton().syncBySavedConfig()
      })
      .catch(() => {
        return undefined
      })
  }

  return (
    <View style={styles.tab}>
      <HostField onValueChange={handleHostChange} value={host} />
      <PortField onValueChange={handlePortChange} shouldShowError={hasAttemptedSave} value={port} />
      <TokenField onValueChange={handleTokenChange} value={token} />
      <Pressable accessibilityRole="button" onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>
      <TestConnectionButton host={host} port={port} token={token} />
      {hasSaved && <Text style={styles.savedText}>Saved. Reconnecting…</Text>}
      <ConnectionHint />
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    saveButton: {
      alignItems: 'center',
      backgroundColor: theme.accent,
      borderRadius: 8,
      paddingVertical: 12,
    },
    saveButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    savedText: {
      color: theme.good,
      fontSize: 13,
    },
    tab: {
      gap: 16,
    },
  })
}
