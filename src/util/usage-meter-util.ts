import { constant } from '@/util/constant'

export const usageMeterUtil = {
  isQuotaWindow(params: { label: string }): boolean {
    const { label } = params
    return constant.usageMeter.quotaWindowLabels.includes(label)
  },

  resolveResetBarPercent(params: { nowMs: number; resetAt?: number; windowMs: number }): number {
    const { nowMs, resetAt, windowMs } = params

    if (resetAt === undefined) {
      return 0
    }

    const remainingFraction = Math.max(0, resetAt - nowMs) / windowMs

    return Math.min(Math.max(remainingFraction, 0), 1) * 100
  },
}
