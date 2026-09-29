import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Fragment, useEffect } from 'react'
import { useColorScheme } from 'react-native'

import { useNotificationSoundBootstrap } from '@/business/hook/use-notification-sound-bootstrap'
import { useThemeBootstrap } from '@/business/hook/use-theme-bootstrap'
import { useThemeMode } from '@/business/hook/use-theme-mode'
import { type ThemeScheme } from '@/business/model/theme-model'
import { NotificationService } from '@/business/service/notification-service'
import { type StateSyncNotificationListener, stateSyncServiceSingleton } from '@/business/service/state-sync-service'
import { useNotificationSoundStore } from '@/business/store/notification-sound-store'
import { notificationMappingUtil } from '@/business/util/notification-mapping-util'
import { theme } from '@/util/theme'
import { themeUtil } from '@/util/theme-util'

const resolveStatusBarStyle = (params: { scheme: ThemeScheme }): 'light' | 'dark' => {
  const { scheme } = params
  if (scheme === 'dark') {
    return 'light'
  }
  return 'dark'
}

export default function AppLayout() {
  useThemeBootstrap()
  useNotificationSoundBootstrap()
  const { mode } = useThemeMode()
  const systemScheme = useColorScheme()
  const scheme = themeUtil.resolveScheme({ mode, systemScheme })
  const screenOptions = {
    contentStyle: { backgroundColor: theme[scheme].background },
    headerShown: false,
  }

  useEffect(() => {
    const notificationService = new NotificationService()
    const listener: StateSyncNotificationListener = (message) => {
      const notification = notificationMappingUtil.resolveNotification({
        message,
        soundConfig: useNotificationSoundStore.getState().config,
      })
      if (notification === undefined) {
        return
      }
      void notificationService.presentNotification(notification).catch(() => {
        return undefined
      })
    }
    stateSyncServiceSingleton().addNotificationListener({ listener })
    void notificationService.ensurePermission().catch(() => {
      return false
    })
    void stateSyncServiceSingleton().syncBySavedConfig()
    return () => {
      stateSyncServiceSingleton().removeNotificationListener({ listener })
    }
  }, [])

  return (
    <Fragment>
      <StatusBar style={resolveStatusBarStyle({ scheme })} />
      <Stack screenOptions={screenOptions} />
    </Fragment>
  )
}
