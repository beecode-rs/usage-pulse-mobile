import { type ReactElement, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { ApiClientErrorMapper } from '@/business/enum/api-client-error-mapper-enum'
import { useTheme } from '@/business/hook/use-theme'
import { type ApiClientResult } from '@/business/model/api-client-model'
import { type MobileHealthResponse } from '@/business/model/mobile-api-model'
import { type ThemePalette } from '@/business/model/theme-model'
import { ApiClientService } from '@/business/service/api-client-service'
import { connectionFormUtil } from '@/util/connection-form-util'

type TestConnectionButtonProps = {
  host: string
  port: string
  token: string
}

type TestConnectionState = 'IDLE' | 'INVALID_FORM' | 'SUCCESS' | 'TESTING' | 'UNAUTHORIZED' | 'UNREACHABLE'

const resolveNextStateByResult = (result: ApiClientResult<MobileHealthResponse>): TestConnectionState => {
  if (result.success) {
    return 'SUCCESS'
  }
  if (result.error === ApiClientErrorMapper.UNAUTHORIZED) {
    return 'UNAUTHORIZED'
  }
  return 'UNREACHABLE'
}

const resolveStateView = (params: {
  appVersion: string
  formErrorMessage: string
  state: TestConnectionState
  theme: ThemePalette
}): { color: string; label: string } => {
  const { appVersion, formErrorMessage, state, theme } = params
  switch (state) {
    case 'SUCCESS': {
      return { color: theme.good, label: `Connected · Usage Pulse v${appVersion}` }
    }
    case 'TESTING': {
      return { color: theme.muted, label: 'Testing connection…' }
    }
    case 'INVALID_FORM': {
      return { color: theme.critical, label: formErrorMessage }
    }
    case 'UNAUTHORIZED': {
      return { color: theme.serious, label: 'Unauthorized: check the pairing token' }
    }
    case 'UNREACHABLE': {
      return { color: theme.critical, label: 'Could not reach the desktop server' }
    }
    default: {
      return { color: theme.muted, label: '' }
    }
  }
}

const apiClient = new ApiClientService()

export const TestConnectionButton = (props: TestConnectionButtonProps): ReactElement => {
  const { host, port, token } = props
  const [appVersion, setAppVersion] = useState('')
  const [formErrorMessage, setFormErrorMessage] = useState('')
  const [state, setState] = useState<TestConnectionState>('IDLE')
  const theme = useTheme()
  const styles = createStyles({ theme })
  const stateView = resolveStateView({ appVersion, formErrorMessage, state, theme })

  const handlePress = (): void => {
    const formResolution = connectionFormUtil.resolveConfigOrErrorMessage({ host, port, token })
    if (formResolution.errorMessage !== undefined) {
      setFormErrorMessage(formResolution.errorMessage)
      setState('INVALID_FORM')
      return
    }
    setState('TESTING')
    void apiClient
      .fetchHealth({ config: formResolution.config })
      .then((result) => {
        if (result.success) {
          setAppVersion(result.data.appVersion)
        }
        setState(resolveNextStateByResult(result))
      })
      .catch(() => {
        setState('UNREACHABLE')
      })
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} style={styles.buttonWrapper}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Test connection</Text>
        </View>
      </Pressable>
      {stateView.label !== '' && <Text style={[styles.result, { color: stateView.color }]}>{stateView.label}</Text>}
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.accent,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    buttonWrapper: {
      alignSelf: 'flex-start',
    },
    container: {
      gap: 8,
    },
    result: {
      fontSize: 13,
    },
  })
}
