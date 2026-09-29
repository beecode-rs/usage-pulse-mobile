import { create } from 'zustand'

import { WsConnectionStatus } from '@/business/enum/ws-connection-status-enum'
import { type AppStateModel } from '@/business/model/app-state-model'

type AppStateStore = AppStateModel & {
  applyNextState: (params: { state: AppStateModel }) => void
  setConnectionStatus: (params: { status: WsConnectionStatus }) => void
}

export const useAppStateStore = create<AppStateStore>()((set) => ({
  applyNextState: (params: { state: AppStateModel }) => {
    const { state } = params
    set(state)
  },
  connectionStatus: WsConnectionStatus.IDLE,
  setConnectionStatus: (params: { status: WsConnectionStatus }) => {
    const { status } = params
    set({ connectionStatus: status })
  },
}))
