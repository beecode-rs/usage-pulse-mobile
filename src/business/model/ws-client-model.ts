import { type WsConnectionStatus } from '@/business/enum/ws-connection-status-enum'
import { type MobileWsMessage } from '@/business/model/mobile-api-model'

export type WsMessageListener = (message: MobileWsMessage) => void
export type WsStatusListener = (status: WsConnectionStatus) => void
