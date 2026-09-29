import { SessionStatusMapper } from '@/business/enum/session-status-mapper-enum'
import { type SessionInfo } from '@/business/model/session-model'

export const sessionFinishedPulseUtil = {
  isPulsing: (params: { finishedAtMs?: number; nowMs: number; pulseMs: number }): boolean => {
    const { finishedAtMs, nowMs, pulseMs } = params
    if (finishedAtMs === undefined || pulseMs <= 0) {
      return false
    }

    return nowMs - finishedAtMs < pulseMs
  },

  resolveFinishedAtBySessionId: (params: {
    currentSessions: SessionInfo[]
    finishedAtBySessionId: Record<string, number>
    nowMs: number
    previousSessions?: SessionInfo[]
  }): Record<string, number> => {
    const { currentSessions, finishedAtBySessionId, nowMs, previousSessions } = params
    const idleSessionIds = new Set(
      currentSessions
        .filter((session) => {
          return session.status === SessionStatusMapper.IDLE
        })
        .map((session) => {
          return session.sessionId
        }),
    )
    const previousStatusBySessionId = new Map(
      (previousSessions ?? []).map((session): [string, SessionStatusMapper] => {
        return [session.sessionId, session.status]
      }),
    )
    const keptEntries = Object.entries(finishedAtBySessionId).filter(([sessionId]) => {
      return idleSessionIds.has(sessionId)
    })
    const finishedEntries = currentSessions
      .filter((session) => {
        return (
          session.status === SessionStatusMapper.IDLE &&
          previousStatusBySessionId.get(session.sessionId) === SessionStatusMapper.BUSY
        )
      })
      .map((session): [string, number] => {
        return [session.sessionId, nowMs]
      })

    return Object.fromEntries([...keptEntries, ...finishedEntries])
  },
}
