import { SessionStatusMapper } from '@/business/enum/session-status-mapper-enum'
import { type SessionInfo } from '@/business/model/session-model'
import { timeUntilUtil } from '@/util/time-until-util'

export type SessionSummaryCounts = {
  busy: number
  idle: number
  remote: number
  total: number
  unknown: number
  waiting: number
}

export const sessionPresentationUtil = {
  resolveLastActivityLabel: (params: { lastActivityAt?: number; nowMs: number }): string => {
    const { lastActivityAt, nowMs } = params
    if (lastActivityAt === undefined) {
      return ''
    }
    const timeAgo = timeUntilUtil.resolveTimeUntil({ nowMs: lastActivityAt, resetAt: nowMs })
    if (timeAgo === '') {
      return ''
    }
    if (timeAgo === 'now') {
      return 'active now'
    }
    return `active ${timeAgo} ago`
  },

  resolveModelLabel: (params: { model: string }): string => {
    const { model } = params
    return model.replace(/-\d{8}$/, '')
  },

  resolveProjectLabel: (params: { cwd: string }): string => {
    const { cwd } = params
    const segments = cwd.split('/').filter((segment) => {
      return segment !== ''
    })
    const lastSegment = segments.at(-1)
    if (lastSegment === undefined) {
      return cwd
    }
    return lastSegment
  },

  resolveSessionTitle: (params: { session: SessionInfo }): string => {
    const { session } = params
    if (session.name !== '') {
      return session.name
    }
    if (session.transcript !== undefined && session.transcript.aiTitle !== '') {
      return session.transcript.aiTitle
    }
    if (session.cwd !== '') {
      return sessionPresentationUtil.resolveProjectLabel({ cwd: session.cwd })
    }
    return 'Unnamed session'
  },

  resolveSessionTitleLabel: (params: { session: SessionInfo }): string => {
    const { session } = params
    const title = sessionPresentationUtil.resolveSessionTitle({ session })
    const { name, suffix } = sessionPresentationUtil.resolveSessionTitleParts({ title })
    if (suffix === undefined) {
      return name
    }
    return `${name} (${suffix})`
  },

  resolveSessionTitleParts: (params: { title: string }): { name: string; suffix: string | undefined } => {
    const { title } = params
    const titleMatch = /^(.+)-(.+)$/.exec(title)
    const name = titleMatch?.[1]
    const suffix = titleMatch?.[2]
    if (name === undefined || suffix === undefined) {
      return { name: title, suffix: undefined }
    }
    return { name, suffix }
  },

  resolveSessionsWord: (params: { total: number }): string => {
    const { total } = params
    if (total === 1) {
      return 'session'
    }
    return 'sessions'
  },

  resolveSummaryCounts: (params: { sessions: SessionInfo[] }): SessionSummaryCounts => {
    const { sessions } = params
    return {
      busy: sessions.filter((session) => {
        return session.status === SessionStatusMapper.BUSY
      }).length,
      idle: sessions.filter((session) => {
        return session.status === SessionStatusMapper.IDLE
      }).length,
      remote: sessions.filter((session) => {
        return session.hostId !== undefined
      }).length,
      total: sessions.length,
      unknown: sessions.filter((session) => {
        return session.status === SessionStatusMapper.UNKNOWN
      }).length,
      waiting: sessions.filter((session) => {
        return session.status === SessionStatusMapper.WAITING
      }).length,
    }
  },

  resolveSummaryLine: (params: { counts: SessionSummaryCounts }): string => {
    const { counts } = params
    const summaryParts = [
      `${String(counts.total)} ${sessionPresentationUtil.resolveSessionsWord({ total: counts.total })}`,
      `${String(counts.busy)} working`,
      `${String(counts.waiting)} waiting`,
      `${String(counts.idle)} idle`,
    ]
    if (counts.unknown > 0) {
      summaryParts.push(`${String(counts.unknown)} unknown`)
    }
    if (counts.remote > 0) {
      summaryParts.push(`${String(counts.remote)} remote`)
    }
    return summaryParts.join(' · ')
  },
}
