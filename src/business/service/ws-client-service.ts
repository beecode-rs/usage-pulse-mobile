import { WsConnectionStatus } from '@/business/enum/ws-connection-status-enum'
import { type MobileWsMessage } from '@/business/model/mobile-api-model'
import { type WsMessageListener, type WsStatusListener } from '@/business/model/ws-client-model'
import { mobileWsMessageSchema } from '@/business/schema/mobile-api-schema'
import { constant } from '@/util/constant'

export const resolveNextReconnectDelayMs = (params: { attemptCount: number }): number => {
  const { attemptCount } = params

  return Math.min(constant.wsClient.reconnectBaseDelayMs * 2 ** attemptCount, constant.wsClient.maxReconnectDelayMs)
}

export class WsClientService {
  protected _isReconnectStopped = true
  protected _messageListeners: WsMessageListener[] = []
  protected _reconnectAttemptCount = 0
  protected _reconnectTimeout: ReturnType<typeof setTimeout> | undefined
  protected _socket: WebSocket | undefined
  protected _status = WsConnectionStatus.IDLE
  protected _statusListeners: WsStatusListener[] = []
  protected _url = ''
  protected _watchdogTimeout: ReturnType<typeof setTimeout> | undefined

  addMessageListener(params: { listener: WsMessageListener }): void {
    const { listener } = params
    this._messageListeners = [...this._messageListeners, listener]
  }

  connect(params: { url: string }): void {
    const { url } = params
    this._url = url
    this._isReconnectStopped = false
    this._clearReconnectTimeout()
    this._closeSocket()
    this._openSocket()
  }

  disconnect(): void {
    this._isReconnectStopped = true
    this._clearReconnectTimeout()
    this._closeSocket()
    this._setStatus({ status: WsConnectionStatus.IDLE })
  }

  getStatus(): WsConnectionStatus {
    return this._status
  }

  onStatusChange(params: { listener: WsStatusListener }): { unsubscribe: () => void } {
    const { listener } = params
    this._statusListeners = [...this._statusListeners, listener]

    return {
      unsubscribe: () => {
        this._statusListeners = this._statusListeners.filter((existing) => existing !== listener)
      },
    }
  }

  removeMessageListener(params: { listener: WsMessageListener }): void {
    const { listener } = params
    this._messageListeners = this._messageListeners.filter((existing) => existing !== listener)
  }

  protected _clearReconnectTimeout(): void {
    if (this._reconnectTimeout === undefined) {
      return
    }
    clearTimeout(this._reconnectTimeout)
    this._reconnectTimeout = undefined
  }

  protected _clearWatchdog(): void {
    if (this._watchdogTimeout === undefined) {
      return
    }
    clearTimeout(this._watchdogTimeout)
    this._watchdogTimeout = undefined
  }

  protected _closeSocket(): void {
    const socket = this._socket
    if (socket === undefined) {
      return
    }
    this._socket = undefined
    this._clearWatchdog()
    socket.close()
  }

  protected _notifyParsedMessage(params: { rawData: unknown }): void {
    const { rawData } = params
    const parsedJson = this._parseJson({ rawData })
    if (parsedJson === undefined) {
      return
    }
    const parsedMessage = mobileWsMessageSchema.safeParse(parsedJson)
    if (!parsedMessage.success) {
      return
    }
    this._messageListeners.forEach((listener) => {
      listener(parsedMessage.data)
    })
  }

  protected _openSocket(): void {
    this._setStatus({ status: WsConnectionStatus.CONNECTING })
    const socket = new WebSocket(this._url)
    this._socket = socket

    socket.onclose = () => {
      if (this._socket !== socket) {
        return
      }
      this._socket = undefined
      this._clearWatchdog()
      this._setStatus({ status: WsConnectionStatus.CLOSED })
      this._scheduleReconnect()
    }

    socket.onerror = () => {
      if (this._socket !== socket) {
        return
      }
      this._setStatus({ status: WsConnectionStatus.CLOSED })
      this._scheduleReconnect()
    }

    socket.onmessage = (event) => {
      if (this._socket !== socket) {
        return
      }
      this._resetWatchdog()
      this._notifyParsedMessage({ rawData: event.data })
    }

    socket.onopen = () => {
      if (this._socket !== socket) {
        return
      }
      this._reconnectAttemptCount = 0
      this._setStatus({ status: WsConnectionStatus.OPEN })
      this._resetWatchdog()
    }
  }

  protected _parseJson(params: { rawData: unknown }): unknown {
    const { rawData } = params
    if (typeof rawData !== 'string') {
      return undefined
    }
    try {
      return JSON.parse(rawData) as unknown
    } catch {
      return undefined
    }
  }

  protected _resetWatchdog(): void {
    this._clearWatchdog()
    this._watchdogTimeout = setTimeout(() => {
      this._socket?.close()
    }, constant.wsClient.watchdogTimeoutMs)
  }

  protected _scheduleReconnect(): void {
    if (this._isReconnectStopped || this._reconnectTimeout !== undefined) {
      return
    }
    const delayMs = resolveNextReconnectDelayMs({ attemptCount: this._reconnectAttemptCount })
    this._reconnectAttemptCount = this._reconnectAttemptCount + 1
    this._reconnectTimeout = setTimeout(() => {
      this._reconnectTimeout = undefined
      this._openSocket()
    }, delayMs)
  }

  protected _setStatus(params: { status: WsConnectionStatus }): void {
    const { status } = params
    this._status = status
    this._statusListeners.forEach((listener) => {
      listener(status)
    })
  }
}
