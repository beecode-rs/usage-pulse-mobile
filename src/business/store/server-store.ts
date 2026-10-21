import { create } from 'zustand'

import { type ConnectionConfig } from '@/business/model/connection-config-model'
import { type ServerEntry, type ServerListPayload } from '@/business/model/server-model'
import { connectionConfigService } from '@/business/service/connection-config-service'
import { serverListService } from '@/business/service/server-list-service'

type ServerStore = {
  activeServerId: string | undefined
  addAndSelectServer: (params: { server: ServerEntry }) => Promise<void>
  hasHydrated: boolean
  hydrate: () => Promise<ServerListPayload | undefined>
  removeServer: (params: { serverId: string }) => Promise<void>
  selectServer: (params: { server: ServerEntry }) => Promise<void>
  servers: ServerEntry[]
  updateServer: (params: { server: ServerEntry }) => Promise<void>
}

export const useServerStore = create<ServerStore>()((set, get) => ({
  activeServerId: undefined,

  addAndSelectServer: (params: { server: ServerEntry }): Promise<void> => {
    const { server } = params
    const nextServers = [
      ...get().servers.filter((existing) => {
        return existing.host !== server.host || existing.port !== server.port
      }),
      server,
    ]
    set({ activeServerId: server.id, servers: nextServers })
    void serverListService.savePayload({ payload: { activeServerId: server.id, servers: nextServers } }).catch(() => {
      return undefined
    })
    const config: ConnectionConfig = { host: server.host, port: server.port, token: server.token }
    return connectionConfigService.saveConfig({ config })
  },

  hasHydrated: false,

  hydrate: (): Promise<ServerListPayload | undefined> => {
    if (get().hasHydrated) {
      const { activeServerId, servers } = get()
      return Promise.resolve({ activeServerId, servers })
    }
    return serverListService
      .loadPayload()
      .then((payload) => {
        set({ hasHydrated: true })
        if (payload === undefined) {
          const { activeServerId, servers } = get()
          return { activeServerId, servers }
        }
        set({ activeServerId: payload.activeServerId, servers: payload.servers })
        return payload
      })
      .catch(() => {
        set({ hasHydrated: true })
        const { activeServerId, servers } = get()
        return { activeServerId, servers }
      })
  },

  removeServer: (params: { serverId: string }): Promise<void> => {
    const { serverId } = params
    const nextServers = get().servers.filter((existing) => {
      return existing.id !== serverId
    })
    const isActive = get().activeServerId === serverId
    if (isActive) {
      set({ activeServerId: undefined, servers: nextServers })
    } else {
      set({ servers: nextServers })
    }
    const payload: ServerListPayload = { activeServerId: get().activeServerId, servers: nextServers }
    if (!isActive) {
      return serverListService.savePayload({ payload })
    }
    void serverListService.savePayload({ payload }).catch(() => {
      return undefined
    })
    return connectionConfigService.removeConfig()
  },

  selectServer: (params: { server: ServerEntry }): Promise<void> => {
    const { server } = params
    set({ activeServerId: server.id })
    void serverListService.savePayload({ payload: { activeServerId: server.id, servers: get().servers } }).catch(() => {
      return undefined
    })
    const config: ConnectionConfig = { host: server.host, port: server.port, token: server.token }
    return connectionConfigService.saveConfig({ config })
  },

  servers: [],

  updateServer: (params: { server: ServerEntry }): Promise<void> => {
    const { server } = params
    const nextServers = get().servers.map((existing) => {
      if (existing.id === server.id) {
        return server
      }
      return existing
    })
    set({ servers: nextServers })
    const payload: ServerListPayload = { activeServerId: get().activeServerId, servers: nextServers }
    if (get().activeServerId !== server.id) {
      return serverListService.savePayload({ payload })
    }
    void serverListService.savePayload({ payload }).catch(() => {
      return undefined
    })
    const config: ConnectionConfig = { host: server.host, port: server.port, token: server.token }
    return connectionConfigService.saveConfig({ config })
  },
}))
