import { vi } from 'vitest'

import { type ConnectionConfig } from '@/business/model/connection-config-model'
import { ApiClientService } from '@/business/service/api-client-service'
import { constant } from '@/util/constant'

const fetchMock = vi.fn()

vi.stubGlobal('fetch', fetchMock)

export const apiClientServiceContractHarness = {
  fetchHealthWhenInvalidResponse: async (params: { config: ConnectionConfig }) => {
    const { config } = params
    fetchMock.mockImplementation(() => {
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    })

    return await new ApiClientService().fetchHealth({ config })
  },

  fetchHealthWhenOk: async (params: { config: ConnectionConfig }) => {
    const { config } = params
    fetchMock.mockImplementation(() => {
      return Promise.resolve(new Response(JSON.stringify({ appVersion: '1.2.3', ok: true }), { status: 200 }))
    })

    return await new ApiClientService().fetchHealth({ config })
  },

  fetchHealthWhenUnauthorized: async (params: { config: ConnectionConfig }) => {
    const { config } = params
    fetchMock.mockImplementation(() => {
      return Promise.resolve(new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 }))
    })

    return await new ApiClientService().fetchHealth({ config })
  },

  fetchStateWhenOk: async (params: { config: ConnectionConfig }) => {
    const { config } = params
    fetchMock.mockImplementation(() => {
      return Promise.resolve(
        new Response(JSON.stringify({ sessions: null, usage: { providers: [] } }), { status: 200 }),
      )
    })

    return await new ApiClientService().fetchState({ config })
  },

  fetchWhenNetworkError: async (params: { config: ConnectionConfig }) => {
    const { config } = params
    fetchMock.mockRejectedValue(new TypeError('Network request failed'))

    return await new ApiClientService().fetchHealth({ config })
  },

  fetchWhenTimedOut: async (params: { config: ConnectionConfig }) => {
    const { config } = params
    vi.useFakeTimers()
    fetchMock.mockImplementation((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'))
        })
      })
    })

    try {
      const resultPromise = new ApiClientService().fetchHealth({ config })
      await vi.advanceTimersByTimeAsync(constant.apiClient.timeoutMs)

      return await resultPromise
    } finally {
      vi.useRealTimers()
    }
  },

  resolveApiBaseUrl: (params: { host: string; port: number }) => {
    const { host, port } = params

    return new ApiClientService().resolveApiBaseUrl({ host, port })
  },

  resolveWsUrl: (params: { host: string; port: number; token: string }) => {
    const { host, port, token } = params

    return new ApiClientService().resolveWsUrl({ host, port, token })
  },
}
