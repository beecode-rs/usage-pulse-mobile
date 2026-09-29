import { vi } from 'vitest'

import { WsClientService, resolveNextReconnectDelayMs } from '@/business/service/ws-client-service'
import { constant } from '@/util/constant'

class FakeWebSocket {
  static created: FakeWebSocket[] = []
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  onmessage: ((event: { data: unknown }) => void) | null = null
  onopen: (() => void) | null = null
  readonly createdAt: number
  readonly url: string
  isClosed = false

  constructor(url: string) {
    this.url = url
    this.createdAt = Date.now()
    FakeWebSocket.created.push(this)
  }

  close(): void {
    if (this.isClosed) {
      return
    }
    this.isClosed = true
    this.onclose?.()
  }
}

vi.stubGlobal('WebSocket', FakeWebSocket)

const resetFakeSockets = (): void => {
  FakeWebSocket.created = []
}

const lastSocket = (): FakeWebSocket => {
  const socket = FakeWebSocket.created[FakeWebSocket.created.length - 1]
  if (socket === undefined) {
    throw new Error('no fake socket was created')
  }

  return socket
}

const closeLastSocket = (): void => {
  lastSocket().close()
}

const emitMessageOnLastSocket = (params: { data: unknown }): void => {
  const { data } = params
  lastSocket().onmessage?.({ data })
}

const openLastSocket = (): void => {
  lastSocket().onopen?.()
}

const advancePastAnyReconnectDelay = async (): Promise<void> => {
  await vi.advanceTimersByTimeAsync(constant.wsClient.maxReconnectDelayMs + 1000)
}

export const wsClientServiceContractHarness = {
  deliversValidMessagesAndIgnoresInvalid: (params: { url: string }) => {
    const { url } = params
    vi.useFakeTimers({ toFake: ['Date', 'clearTimeout', 'setTimeout'] })
    try {
      resetFakeSockets()
      const service = new WsClientService()
      const receivedTypes: string[] = []
      service.addMessageListener({
        listener: (message) => {
          receivedTypes.push(message.type)
        },
      })
      service.connect({ url })
      openLastSocket()
      emitMessageOnLastSocket({ data: JSON.stringify({ at: 123, type: 'heartbeat' }) })
      emitMessageOnLastSocket({ data: JSON.stringify({ session: {}, type: 'session-finished' }) })
      emitMessageOnLastSocket({ data: 'not-json' })
      service.disconnect()

      return { receivedTypes }
    } finally {
      vi.useRealTimers()
    }
  },

  disconnectCancelsPendingReconnect: async (params: { url: string }) => {
    const { url } = params
    vi.useFakeTimers({ toFake: ['Date', 'clearTimeout', 'setTimeout'] })
    try {
      resetFakeSockets()
      const service = new WsClientService()
      const statuses: string[] = []
      service.onStatusChange({
        listener: (status) => {
          statuses.push(status)
        },
      })
      service.connect({ url })
      openLastSocket()
      closeLastSocket()
      service.disconnect()
      await advancePastAnyReconnectDelay()

      return { socketCount: FakeWebSocket.created.length, statuses }
    } finally {
      vi.useRealTimers()
    }
  },

  reconnectBackoffSequenceAndResetOnOpen: async (params: { url: string }) => {
    const { url } = params
    vi.useFakeTimers({ toFake: ['Date', 'clearTimeout', 'setTimeout'] })
    try {
      resetFakeSockets()
      const service = new WsClientService()
      service.connect({ url })
      const delays: number[] = []
      const recordFailureDelay = async (): Promise<void> => {
        const closedAt = Date.now()
        closeLastSocket()
        await advancePastAnyReconnectDelay()
        delays.push(lastSocket().createdAt - closedAt)
      }
      await recordFailureDelay()
      await recordFailureDelay()
      await recordFailureDelay()
      await recordFailureDelay()
      await recordFailureDelay()
      await recordFailureDelay()
      openLastSocket()
      const resetClosedAt = Date.now()
      closeLastSocket()
      await advancePastAnyReconnectDelay()

      return {
        delayAfterReset: lastSocket().createdAt - resetClosedAt,
        delays,
      }
    } finally {
      vi.useRealTimers()
    }
  },

  resolveNextReconnectDelayMs: (params: { attemptCount: number }) => {
    const { attemptCount } = params

    return resolveNextReconnectDelayMs({ attemptCount })
  },

  watchdogClosesSilentConnection: async (params: { url: string }) => {
    const { url } = params
    vi.useFakeTimers({ toFake: ['Date', 'clearTimeout', 'setTimeout'] })
    try {
      resetFakeSockets()
      const service = new WsClientService()
      service.connect({ url })
      openLastSocket()
      await vi.advanceTimersByTimeAsync(constant.wsClient.watchdogTimeoutMs - 10000)
      emitMessageOnLastSocket({ data: JSON.stringify({ at: Date.now(), type: 'heartbeat' }) })
      await vi.advanceTimersByTimeAsync(constant.wsClient.watchdogTimeoutMs - 10000)
      const closedBeforeSilenceWindow = lastSocket().isClosed
      await vi.advanceTimersByTimeAsync(constant.wsClient.watchdogTimeoutMs)

      return {
        closedBeforeSilenceWindow,
        firstSocketClosedAfterWindow: FakeWebSocket.created[0]?.isClosed ?? false,
        socketCount: FakeWebSocket.created.length,
      }
    } finally {
      vi.useRealTimers()
    }
  },
}
