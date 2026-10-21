export type ServerEntry = {
  host: string
  id: string
  name: string
  port: number
  token: string
}

export type ServerListPayload = {
  activeServerId?: string | undefined
  servers: ServerEntry[]
}
