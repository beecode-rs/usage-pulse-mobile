import { useRouter } from 'expo-router'
import { type ReactElement } from 'react'

import { SettingsScreen } from '@/ui-component/settings/settings-screen'

export default function SettingsRoute(): ReactElement {
  const router = useRouter()
  const handleBackPress = (): void => {
    router.back()
  }

  return <SettingsScreen onBackPress={handleBackPress} />
}
