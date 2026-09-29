import { type WsConnectionStatus } from '@/business/enum/ws-connection-status-enum'
import { type SessionSnapshot } from '@/business/model/session-model'
import { type UsageSnapshot } from '@/business/model/usage-model'

export type AppStateModel = {
  connectionStatus: WsConnectionStatus
  lastHeartbeatAt?: number
  sessions?: SessionSnapshot
  usage?: UsageSnapshot
}
