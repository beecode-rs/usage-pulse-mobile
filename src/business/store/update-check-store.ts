import { create } from 'zustand'

import { UpdateCheckStatus } from '@/business/enum/update-check-status-enum'
import { type AppUpdate, type AppUpdateError } from '@/business/model/app-update-model'
import { UpdateCheckService } from '@/business/service/update-check-service'

type UpdateCheckStore = {
  applyUpdate: (params: { update: AppUpdate | undefined }) => void
  checkForUpdate: (params: { isSilent: boolean }) => void
  error: AppUpdateError | undefined
  status: UpdateCheckStatus
  update: AppUpdate | undefined
}

export const useUpdateCheckStore = create<UpdateCheckStore>()((set, get) => ({
  applyUpdate: (params: { update: AppUpdate | undefined }) => {
    const { update } = params
    if (update === undefined) {
      set({ error: undefined, status: UpdateCheckStatus.UP_TO_DATE, update: undefined })
      return
    }
    set({ error: undefined, status: UpdateCheckStatus.UPDATE_AVAILABLE, update })
  },
  checkForUpdate: (params: { isSilent: boolean }) => {
    const { isSilent } = params
    set({ error: undefined, status: UpdateCheckStatus.CHECKING })
    const updateCheckService = new UpdateCheckService()
    void updateCheckService
      .checkForNewVersion({ currentVersion: updateCheckService.resolveCurrentVersion() })
      .then((update) => {
        get().applyUpdate({ update })
        return undefined
      })
      .catch((error: unknown) => {
        const updateError = updateCheckService.resolveUpdateError({ error })
        if (isSilent) {
          console.warn('update check failed', updateError)
          set({ status: UpdateCheckStatus.IDLE })
          return
        }
        console.error('update check failed', error)
        set({ error: updateError, status: UpdateCheckStatus.ERROR })
      })
  },
  error: undefined,
  status: UpdateCheckStatus.IDLE,
  update: undefined,
}))
