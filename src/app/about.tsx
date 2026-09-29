import { useRouter } from 'expo-router'
import { type ReactElement } from 'react'

import { AboutScreen } from '@/ui-component/about/about-screen'

export default function AboutRoute(): ReactElement {
  const router = useRouter()

  const handleBackPress = (): void => {
    router.back()
  }

  return <AboutScreen onBackPress={handleBackPress} />
}
