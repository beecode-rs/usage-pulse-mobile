import { UpdateCheckStatus } from '@/business/enum/update-check-status-enum'
import { type AppUpdate, type AppUpdateError } from '@/business/model/app-update-model'
import { useUpdateCheckStore } from '@/business/store/update-check-store'

export const useUpdateCheck = (): {
  checkForUpdate: (params: { isSilent: boolean }) => void
  error: AppUpdateError | undefined
  status: UpdateCheckStatus
  update: AppUpdate | undefined
} => {
  const checkForUpdate = useUpdateCheckStore((state) => {
    return state.checkForUpdate
  })
  const error = useUpdateCheckStore((state) => {
    return state.error
  })
  const status = useUpdateCheckStore((state) => {
    return state.status
  })
  const update = useUpdateCheckStore((state) => {
    return state.update
  })

  return { checkForUpdate, error, status, update }
}
