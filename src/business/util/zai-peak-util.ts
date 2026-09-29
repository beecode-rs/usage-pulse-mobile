import { ProviderIdMapper } from '@/business/enum/provider-id-mapper-enum'
import { constant } from '@/util/constant'

type ZaiPeakInfo = {
  isPeakHour: boolean
  peakWindowText: string
}

export class ZaiPeakUtil {
  resolvePeakInfo(params: { nowMs: number; providerId: ProviderIdMapper }): ZaiPeakInfo | undefined {
    const { nowMs, providerId } = params
    if (providerId !== ProviderIdMapper.ZAI) {
      return undefined
    }

    const wallClock = this._resolveUtc8WallClock({ nowMs })
    const isWeekday =
      wallClock.weekday >= constant.zaiPeak.weekday.first && wallClock.weekday <= constant.zaiPeak.weekday.last
    const isWithinPeakHours =
      wallClock.minuteOfDay >= constant.zaiPeak.minuteOfDay.start &&
      wallClock.minuteOfDay < constant.zaiPeak.minuteOfDay.end
    const { peakEndMs, peakStartMs } = this._resolvePeakBounds({ nowMs })

    return {
      isPeakHour: isWeekday && isWithinPeakHours,
      peakWindowText: `${this._formatHourMinute(peakStartMs)}–${this._formatHourMinute(peakEndMs)}`,
    }
  }

  resolvePeakRemainingPercent(params: { nowMs: number; providerId: ProviderIdMapper }): number | undefined {
    const { nowMs, providerId } = params
    if (providerId !== ProviderIdMapper.ZAI) {
      return undefined
    }

    const { peakEndMs, peakStartMs } = this._resolvePeakBounds({ nowMs })

    return this._resolveWindowRemainingPercent({ nowMs, peakEndMs, peakStartMs })
  }

  resolvePeakRemainingText(params: { nowMs: number; providerId: ProviderIdMapper }): string | undefined {
    const { nowMs, providerId } = params
    if (providerId !== ProviderIdMapper.ZAI) {
      return undefined
    }

    const { peakEndMs } = this._resolvePeakBounds({ nowMs })

    return this._formatDuration(peakEndMs - nowMs)
  }

  protected _resolvePeakBounds(params: { nowMs: number }): { peakEndMs: number; peakStartMs: number } {
    const { nowMs } = params
    const wallClock = this._resolveUtc8WallClock({ nowMs })

    return {
      peakEndMs: wallClock.dayStartMs + constant.zaiPeak.minuteOfDay.end * 60_000,
      peakStartMs: wallClock.dayStartMs + constant.zaiPeak.minuteOfDay.start * 60_000,
    }
  }

  protected _resolveUtc8WallClock(params: { nowMs: number }): {
    dayStartMs: number
    minuteOfDay: number
    weekday: number
  } {
    const { nowMs } = params
    const shiftedDate = new Date(nowMs + constant.zaiPeak.utcOffsetMinutes * 60_000)
    const utc8DayStartMs = Date.UTC(shiftedDate.getUTCFullYear(), shiftedDate.getUTCMonth(), shiftedDate.getUTCDate())

    return {
      dayStartMs: utc8DayStartMs - constant.zaiPeak.utcOffsetMinutes * 60_000,
      minuteOfDay: shiftedDate.getUTCHours() * 60 + shiftedDate.getUTCMinutes(),
      weekday: shiftedDate.getUTCDay(),
    }
  }

  protected _resolveWindowRemainingPercent(params: { nowMs: number; peakEndMs: number; peakStartMs: number }): number {
    const { nowMs, peakEndMs, peakStartMs } = params
    const windowMs = peakEndMs - peakStartMs
    const remainingFraction = (peakEndMs - nowMs) / windowMs

    return Math.min(Math.max(remainingFraction, 0), 1) * 100
  }

  protected _formatDuration(durationMs: number): string {
    const totalMinutes = Math.max(0, Math.floor(durationMs / 60_000))
    const days = Math.floor(totalMinutes / 1440)
    const hours = Math.floor((totalMinutes % 1440) / 60)
    const minutes = totalMinutes % 60

    if (days > 0) {
      return `${String(days)}d ${String(hours)}h`
    }

    if (hours === 0) {
      if (minutes === 0) {
        return 'under 1m'
      }

      return `${String(minutes)}m`
    }

    return `${String(hours)}h ${String(minutes)}m`
  }

  protected _formatHourMinute(timestampMs: number): string {
    const date = new Date(timestampMs)
    const hoursText = String(date.getHours()).padStart(2, '0')
    const minutesText = String(date.getMinutes()).padStart(2, '0')

    return `${hoursText}:${minutesText}`
  }
}
