import { vi } from 'vitest'

import { ApiClientErrorMapper } from '@/business/enum/api-client-error-mapper-enum'
import { ProviderIdMapper } from '@/business/enum/provider-id-mapper-enum'
import { SessionProviderMapper } from '@/business/enum/session-provider-mapper-enum'
import { SessionStatusMapper } from '@/business/enum/session-status-mapper-enum'
import { UsageActivityStatus } from '@/business/enum/usage-activity-status-enum'
import { WsConnectionStatus } from '@/business/enum/ws-connection-status-enum'
import { type ApiClientResult } from '@/business/model/api-client-model'
import { type AppStateModel } from '@/business/model/app-state-model'
import {
  type MobileSessionFinishedMessage,
  type MobileSessionWaitingMessage,
  type MobileStateResponse,
  type MobileUsageWarningMessage,
  type MobileWsMessage,
  UsageWarningReason,
} from '@/business/model/mobile-api-model'
import { StateSyncService } from '@/business/service/state-sync-service'
import { useAppStateStore } from '@/business/store/app-state-store'

const commandMocks = vi.hoisted(() => {
  return {
    config: undefined as { host: string; port: number; token: string } | undefined,
    refreshTrackerParams: [] as { trackerId: string }[],
    result: {
      data: { sessions: null, usage: { providers: [] } },
      success: true,
    } as ApiClientResult<MobileStateResponse>,
    setTrackerPausedParams: [] as { isAutoRefreshPaused: boolean; trackerId: string }[],
  }
})

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

vi.mock('@/business/service/api-client-service', () => {
  return {
    ApiClientService: class {
      refreshTracker(params: { trackerId: string }): Promise<typeof commandMocks.result> {
        commandMocks.refreshTrackerParams.push(params)

        return Promise.resolve(commandMocks.result)
      }

      setTrackerPaused(params: {
        isAutoRefreshPaused: boolean
        trackerId: string
      }): Promise<typeof commandMocks.result> {
        commandMocks.setTrackerPausedParams.push(params)

        return Promise.resolve(commandMocks.result)
      }
    },
  }
})

vi.mock('@/business/service/connection-config-service', () => {
  return {
    connectionConfigService: {
      loadConfig: () => {
        return Promise.resolve(commandMocks.config)
      },
    },
  }
})

const sessionFinishedMessage: MobileSessionFinishedMessage = {
  session: {
    cwd: '/tmp/project',
    kind: 'claude-code',
    name: 'builder',
    pid: 7,
    provider: SessionProviderMapper.CLAUDE_CODE,
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
    provider: SessionProviderMapper.CLAUDE_CODE,
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

const resetCommandMocks = (params: { config?: { host: string; port: number; token: string } }): void => {
  const { config } = params
  commandMocks.config = config
  commandMocks.refreshTrackerParams = []
  commandMocks.setTrackerPausedParams = []
  commandMocks.result = {
    data: {
      sessions: null,
      usage: {
        providers: [
          {
            isAutoRefreshPaused: true,
            providerId: ProviderIdMapper.ZAI,
            status: UsageActivityStatus.OK,
            trackerId: 'tracker-zai',
            trackerName: 'z.ai',
            usage: [{ label: 'Weekly', usedPercent: 64 }],
          },
        ],
      },
    },
    success: true,
  }
}

const resetStore = (): void => {
  useAppStateStore.setState({
    connectionStatus: WsConnectionStatus.IDLE,
    lastHeartbeatAt: undefined,
    sessions: undefined,
    usage: undefined,
  })
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

  refreshTrackerWhenDispatched: async (params: { trackerId: string }) => {
    const { trackerId } = params
    resetCommandMocks({ config: { host: '192.168.1.10', port: 8787, token: 'pairing-token' } })
    resetStore()
    await new StateSyncService().refreshTracker({ trackerId })
    const { usage } = useAppStateStore.getState()

    return {
      refreshTrackerParams: commandMocks.refreshTrackerParams,
      usage: usage ?? null,
    }
  },

  refreshTrackerWhenFailed: async (params: { trackerId: string }) => {
    const { trackerId } = params
    resetCommandMocks({ config: { host: '192.168.1.10', port: 8787, token: 'pairing-token' } })
    commandMocks.result = { error: ApiClientErrorMapper.NETWORK, success: false }
    resetStore()
    await new StateSyncService().refreshTracker({ trackerId })
    const { usage } = useAppStateStore.getState()

    return {
      refreshTrackerParams: commandMocks.refreshTrackerParams,
      usage: usage ?? null,
    }
  },

  refreshTrackerWhenNoConfig: async (params: { trackerId: string }) => {
    const { trackerId } = params
    resetCommandMocks({})
    resetStore()
    await new StateSyncService().refreshTracker({ trackerId })
    const { usage } = useAppStateStore.getState()

    return {
      refreshTrackerParams: commandMocks.refreshTrackerParams,
      usage: usage ?? null,
    }
  },

  resolveNextState: (params: { message: MobileWsMessage; state: AppStateModel }) => {
    const { message, state } = params

    return new StateSyncService().resolveNextState({ message, state })
  },

  setTrackerPausedWhenDispatched: async (params: { isAutoRefreshPaused: boolean; trackerId: string }) => {
    const { isAutoRefreshPaused, trackerId } = params
    resetCommandMocks({ config: { host: '192.168.1.10', port: 8787, token: 'pairing-token' } })
    resetStore()
    await new StateSyncService().setTrackerPaused({ isAutoRefreshPaused, trackerId })
    const { usage } = useAppStateStore.getState()

    return {
      setTrackerPausedParams: commandMocks.setTrackerPausedParams,
      usage: usage ?? null,
    }
  },
}
