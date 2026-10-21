import { type ReactElement, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { type ConnectionConfig } from '@/business/model/connection-config-model'
import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { connectionFormUtil } from '@/util/connection-form-util'
import { ConnectionHint } from '@/ui-component/server/connection-hint'
import { HostField } from '@/ui-component/server/host-field'
import { NameField } from '@/ui-component/server/name-field'
import { PortField } from '@/ui-component/server/port-field'
import { TestConnectionButton } from '@/ui-component/server/test-connection-button'
import { TokenField } from '@/ui-component/server/token-field'

export type ServerFormMode = 'add' | 'clone' | 'edit'

export type ServerFormInitialValues = {
  host: string
  name: string
  port: string
  token: string
}

type ServerFormScreenProps = {
  initialValues: ServerFormInitialValues
  mode: ServerFormMode
  onBackPress?: (() => void) | undefined
  onSave: (params: { config: ConnectionConfig; name: string }) => void
}

const resolveFormTitle = (params: { mode: ServerFormMode }): string => {
  const { mode } = params
  if (mode === 'edit') {
    return 'Edit server'
  }
  return 'Add server'
}

export const ServerFormScreen = (props: ServerFormScreenProps): ReactElement => {
  const { initialValues, mode, onBackPress, onSave } = props
  const [name, setName] = useState(initialValues.name)
  const [host, setHost] = useState(initialValues.host)
  const [port, setPort] = useState(initialValues.port)
  const [token, setToken] = useState(initialValues.token)
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState('')
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const styles = createStyles({ theme })

  const handleNameChange = (value: string): void => {
    setFormErrorMessage('')
    setName(value)
  }

  const handleHostChange = (value: string): void => {
    setFormErrorMessage('')
    setHost(value)
  }

  const handlePortChange = (value: string): void => {
    setFormErrorMessage('')
    setPort(value)
  }

  const handleTokenChange = (value: string): void => {
    setFormErrorMessage('')
    setToken(value)
  }

  const handleSave = (): void => {
    setHasAttemptedSave(true)
    const formResolution = connectionFormUtil.resolveConfigOrErrorMessage({ host, port, token })
    if (formResolution.errorMessage !== undefined) {
      setFormErrorMessage(formResolution.errorMessage)
      return
    }
    onSave({ config: formResolution.config, name })
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        {onBackPress !== undefined && (
          <Pressable hitSlop={8} onPress={onBackPress} style={styles.backWrapper}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        )}
        <Text style={styles.headerTitle}>{resolveFormTitle({ mode })}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <NameField onValueChange={handleNameChange} value={name} />
          <HostField onValueChange={handleHostChange} value={host} />
          <PortField onValueChange={handlePortChange} shouldShowError={hasAttemptedSave} value={port} />
          <TokenField onValueChange={handleTokenChange} value={token} />
          <Pressable accessibilityRole="button" onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
          {formErrorMessage !== '' && <Text style={styles.errorText}>{formErrorMessage}</Text>}
          <TestConnectionButton host={host} port={port} token={token} />
          <ConnectionHint />
        </View>
      </ScrollView>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    backText: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: '600',
    },
    backWrapper: {
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    content: {
      flexGrow: 1,
      padding: 16,
    },
    errorText: {
      color: theme.critical,
      fontSize: 13,
    },
    form: {
      gap: 16,
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
    screen: {
      backgroundColor: theme.background,
      flex: 1,
    },
  })
}
