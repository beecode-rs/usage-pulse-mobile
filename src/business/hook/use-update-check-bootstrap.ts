import { useEffect } from 'react'

import { useUpdateCheckStore } from '@/business/store/update-check-store'

export const useUpdateCheckBootstrap = (): void => {
  useEffect(() => {
    useUpdateCheckStore.getState().checkForUpdate({ isSilent: true })
  }, [])
}
