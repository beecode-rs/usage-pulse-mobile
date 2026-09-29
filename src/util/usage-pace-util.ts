import { type ThemePalette } from '@/business/model/theme-model'
import { constant } from '@/util/constant'

export class UsagePaceUtil {
  resolvePaceColor(params: {
    nowMs: number
    resetAt?: number
    theme: ThemePalette
    usedPercent: number
    windowMs: number
  }): string | undefined {
    const diffPercent = this._resolveDiffPercent(params)

    if (diffPercent === undefined) {
      return undefined
    }

    return this._resolvePaceColorForDiff({ diffPercent, theme: params.theme })
  }

  protected _resolveDiffPercent(params: {
    nowMs: number
    resetAt?: number
    usedPercent: number
    windowMs: number
  }): number | undefined {
    const { nowMs, resetAt, usedPercent, windowMs } = params

    if (resetAt === undefined) {
      return undefined
    }

    const elapsedPercent = this._resolveElapsedPercent({ nowMs, resetAt, windowMs })

    return usedPercent - elapsedPercent
  }

  protected _resolveElapsedPercent(params: { nowMs: number; resetAt: number; windowMs: number }): number {
    const { nowMs, resetAt, windowMs } = params
    const remainingMs = Math.max(0, resetAt - nowMs)
    const elapsedFraction = 1 - remainingMs / windowMs

    return Math.min(Math.max(elapsedFraction, 0), 1) * 100
  }

  protected _resolvePaceColorForDiff(params: { diffPercent: number; theme: ThemePalette }): string {
    const { diffPercent, theme } = params

    if (Math.abs(diffPercent) <= constant.usageMeter.paceOnPaceBandPercent) {
      return theme.accent
    }

    const stepCount = this._resolvePaceStepCount({ diffPercent })

    if (diffPercent > 0) {
      return this._resolvePaceStepColor({ paceDirection: 'red', stepCount, theme })
    }

    return this._resolvePaceStepColor({ paceDirection: 'green', stepCount, theme })
  }

  protected _resolvePaceStepColor(params: {
    paceDirection: 'green' | 'red'
    stepCount: number
    theme: ThemePalette
  }): string {
    const { paceDirection, stepCount, theme } = params

    if (paceDirection === 'green') {
      return theme.paceGreen[stepCount - 1]
    }

    return theme.paceRed[stepCount - 1]
  }

  protected _resolvePaceStepCount(params: { diffPercent: number }): number {
    const { diffPercent } = params
    const driftBeyondBandPercent = Math.abs(diffPercent) - constant.usageMeter.paceOnPaceBandPercent

    return Math.min(
      Math.ceil(driftBeyondBandPercent / constant.usageMeter.paceStepPercent),
      constant.usageMeter.paceStepMaxCount,
    )
  }
}
