import { vi } from 'vitest'

import { SessionStatusMapper } from '@/business/enum/session-status-mapper-enum'
import { WsConnectionStatus } from '@/business/enum/ws-connection-status-enum'
import { type AppStateModel } from '@/business/model/app-state-model'
import {
  type MobileSessionFinishedMessage,
  type MobileSessionWaitingMessage,
  type MobileUsageWarningMessage,
  type MobileWsMessage,
  UsageWarningReason,
} from '@/business/model/mobile-api-model'
import { StateSyncService } from '@/business/service/state-sync-service'
import { useAppStateStore } from '@/business/store/app-state-store'

vi.mock('@/business/service/background-connection-service', () => {
  return {
    BackgroundConnectionService: class {
      start(): Promise<void> {
        return Promise.resolve()
      }

      stop(): Promise<void> {
        return Promise.resolve()
      }
    },
  }
})

const sessionFinishedMessage: MobileSessionFinishedMessage = {
  session: {
    cwd: '/tmp/project',
    kind: 'claude-code',
    name: 'builder',
    pid: 7,
    sessionId: 'session-7',
    startedAt: 111,
    status: SessionStatusMapper.IDLE,
  },
  type: 'session-finished',
}

const sessionWaitingMessage: MobileSessionWaitingMessage = {
  session: {
    cwd: '/tmp/project',
    kind: 'claude-code',
    name: 'builder',
    pid: 7,
    sessionId: 'session-7',
    startedAt: 111,
    status: SessionStatusMapper.WAITING,
  },
  type: 'session-waiting',
}

const usageWarningMessage: MobileUsageWarningMessage = {
  type: 'usage-warning',
  warning: {
    reason: UsageWarningReason.HIGH_USAGE,
    trackerId: 'tracker-b',
    trackerName: 'Tracker b',
    usedPercent: 90,
    windowLabel: '5h',
  },
}

export const stateSyncContractHarness = {
  dispatchAppliesToStoreAndForwardsNotifications: () => {
    const service = new StateSyncService()
    useAppStateStore.setState({
      connectionStatus: WsConnectionStatus.IDLE,
      lastHeartbeatAt: undefined,
      sessions: undefined,
      usage: undefined,
    })
    const forwardedTypes: string[] = []
    service.addNotificationListener({
      listener: (message) => {
        forwardedTypes.push(message.type)
      },
    })
    service.dispatchMessage({ message: { at: 222, type: 'heartbeat' } })
    service.dispatchMessage({ message: sessionFinishedMessage })
    service.dispatchMessage({ message: sessionWaitingMessage })
    service.dispatchMessage({ message: usageWarningMessage })
    const { connectionStatus, lastHeartbeatAt, sessions, usage } = useAppStateStore.getState()

    return {
      connectionStatus,
      forwardedTypes,
      lastHeartbeatAt,
      sessions: sessions ?? null,
      usage: usage ?? null,
    }
  },

  resolveNextState: (params: { message: MobileWsMessage; state: AppStateModel }) => {
    const { message, state } = params

    return new StateSyncService().resolveNextState({ message, state })
  },
}
