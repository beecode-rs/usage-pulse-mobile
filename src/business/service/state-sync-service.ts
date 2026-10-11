import { type ApiClientResult } from '@/business/model/api-client-model'
import { type AppStateModel } from '@/business/model/app-state-model'
import { type ConnectionConfig } from '@/business/model/connection-config-model'
import {
  type MobileSessionFinishedMessage,
  type MobileSessionWaitingMessage,
  type MobileStateResponse,
  type MobileUsageWarningMessage,
  type MobileWsMessage,
} from '@/business/model/mobile-api-model'
import { ApiClientService } from '@/business/service/api-client-service'
import { BackgroundConnectionService } from '@/business/service/background-connection-service'
import { connectionConfigService } from '@/business/service/connection-config-service'
import { WsClientService } from '@/business/service/ws-client-service'
import { useAppStateStore } from '@/business/store/app-state-store'

export type StateSyncNotificationListener = (
  message: MobileSessionFinishedMessage | MobileSessionWaitingMessage | MobileUsageWarningMessage,
) => void

export class StateSyncService {
  protected _apiClient = new ApiClientService()
  protected _backgroundConnection = new BackgroundConnectionService()
  protected _isListening = false
  protected _notificationListeners: StateSyncNotificationListener[] = []
  protected _wsClient = new WsClientService()

  addNotificationListener(params: { listener: StateSyncNotificationListener }): void {
    const { listener } = params
    this._notificationListeners = [...this._notificationListeners, listener]
  }

  disconnect(): void {
    this._wsClient.disconnect()
    void this._backgroundConnection.stop()
  }

  dispatchMessage(params: { message: MobileWsMessage }): void {
    const { message } = params
    const nextState = this.resolveNextState({ message, state: this._fetchCurrentState() })
    useAppStateStore.getState().applyNextState({ state: nextState })
    this._notifyNotificationListenersIfWorthy({ message })
  }

  removeNotificationListener(params: { listener: StateSyncNotificationListener }): void {
    const { listener } = params
    this._notificationListeners = this._notificationListeners.filter((existing) => {
      return existing !== listener
    })
  }

  async refreshTracker(params: { trackerId: string }): Promise<void> {
    const { trackerId } = params
    await this._sendCommandBySavedConfig({
      sendCommand: (config) => {
        return this._apiClient.refreshTracker({ config, trackerId })
      },
    })
  }

  async setTrackerPaused(params: { isAutoRefreshPaused: boolean; trackerId: string }): Promise<void> {
    const { isAutoRefreshPaused, trackerId } = params
    await this._sendCommandBySavedConfig({
      sendCommand: (config) => {
        return this._apiClient.setTrackerPaused({ config, isAutoRefreshPaused, trackerId })
      },
    })
  }

  resolveNextState(params: { message: MobileWsMessage; state: AppStateModel }): AppStateModel {
    const { message, state } = params

    switch (message.type) {
      case 'heartbeat': {
        return { ...state, lastHeartbeatAt: message.at }
      }
      case 'session-finished': {
        return state
      }
      case 'session-waiting': {
        return state
      }
      case 'sessions-snapshot': {
        return { ...state, sessions: message.sessions }
      }
      case 'state': {
        return { ...state, sessions: message.sessions ?? undefined, usage: message.usage }
      }
      case 'usage-snapshot': {
        return { ...state, usage: message.usage }
      }
      case 'usage-warning': {
        return state
      }
      default: {
        throw new Error('unsupported ws message type')
      }
    }
  }

  async syncBySavedConfig(): Promise<void> {
    this._ensureWsListeners()
    try {
      const config = await connectionConfigService.loadConfig()
      if (config === undefined) {
        this.disconnect()
        return
      }
      await this._backgroundConnection.start()
      await this._hydrateStateByConfig({ config })
      this._wsClient.connect({
        url: this._apiClient.resolveWsUrl({ host: config.host, port: config.port, token: config.token }),
      })
    } catch {
      return
    }
  }

  protected _ensureWsListeners(): void {
    if (this._isListening) {
      return
    }
    this._isListening = true
    this._wsClient.addMessageListener({
      listener: (message) => {
        this.dispatchMessage({ message })
      },
    })
    this._wsClient.onStatusChange({
      listener: (status) => {
        useAppStateStore.getState().setConnectionStatus({ status })
      },
    })
  }

  protected _fetchCurrentState(): AppStateModel {
    const { connectionStatus, lastHeartbeatAt, sessions, usage } = useAppStateStore.getState()

    return { connectionStatus, lastHeartbeatAt, sessions, usage }
  }

  protected async _hydrateStateByConfig(params: { config: ConnectionConfig }): Promise<void> {
    const { config } = params
    this._dispatchStateResult({ stateResult: await this._apiClient.fetchState({ config }) })
  }

  protected _dispatchStateResult(params: { stateResult: ApiClientResult<MobileStateResponse> }): void {
    const { stateResult } = params

    if (!stateResult.success) {
      return
    }

    this.dispatchMessage({
      message: { sessions: stateResult.data.sessions, type: 'state', usage: stateResult.data.usage },
    })
  }

  protected async _sendCommandBySavedConfig(params: {
    sendCommand: (config: ConnectionConfig) => Promise<ApiClientResult<MobileStateResponse>>
  }): Promise<void> {
    const { sendCommand } = params

    try {
      const config = await connectionConfigService.loadConfig()

      if (config === undefined) {
        return
      }

      this._dispatchStateResult({ stateResult: await sendCommand(config) })
    } catch {
      return
    }
  }

  protected _isNotificationWorthy(
    message: MobileWsMessage,
  ): message is MobileSessionFinishedMessage | MobileSessionWaitingMessage | MobileUsageWarningMessage {
    switch (message.type) {
      case 'session-finished': {
        return true
      }
      case 'session-waiting': {
        return true
      }
      case 'usage-warning': {
        return true
      }
      default: {
        return false
      }
    }
  }

  protected _notifyNotificationListenersIfWorthy(params: { message: MobileWsMessage }): void {
    const { message } = params
    if (!this._isNotificationWorthy(message)) {
      return
    }
    this._notificationListeners.forEach((listener) => {
      listener(message)
    })
  }
}

let stateSyncServiceInstance: StateSyncService | undefined

export const stateSyncServiceSingleton = (): StateSyncService => {
  stateSyncServiceInstance ??= new StateSyncService()
  return stateSyncServiceInstance
}
