import { UsageSeverityLevel } from '@/business/enum/usage-severity-level-enum'
import { type ThemePalette } from '@/business/model/theme-model'
import { constant } from '@/util/constant'

export const usageSeverityUtil = {
  resolveSeverityColor: (params: { theme: ThemePalette; usedPercent: number }): string => {
    const { theme, usedPercent } = params
    switch (usageSeverityUtil.resolveSeverityLevel({ usedPercent })) {
      case UsageSeverityLevel.FILLING_UP: {
        return theme.warning
      }
      case UsageSeverityLevel.HIGH_USAGE: {
        return theme.serious
      }
      case UsageSeverityLevel.LIMIT_REACHED: {
        return theme.critical
      }
      case UsageSeverityLevel.NONE: {
        return theme.accent
      }
      default: {
        throw new Error('unsupported usage severity level')
      }
    }
  },

  resolveSeverityLevel: (params: { usedPercent: number }): UsageSeverityLevel => {
    const { usedPercent } = params
    if (usedPercent >= constant.usageSeverityThresholds.limitReachedPercent) {
      return UsageSeverityLevel.LIMIT_REACHED
    }
    if (usedPercent >= constant.usageSeverityThresholds.highUsagePercent) {
      return UsageSeverityLevel.HIGH_USAGE
    }
    if (usedPercent >= constant.usageSeverityThresholds.fillingUpPercent) {
      return UsageSeverityLevel.FILLING_UP
    }
    return UsageSeverityLevel.NONE
  },
}
