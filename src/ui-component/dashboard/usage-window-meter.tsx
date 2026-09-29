import { type ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/business/hook/use-theme'
import { type UsageWindow } from '@/business/model/usage-model'
import { type ThemePalette } from '@/business/model/theme-model'
import { constant } from '@/util/constant'
import { timeUntilUtil } from '@/util/time-until-util'
import { UsagePaceUtil } from '@/util/usage-pace-util'
import { usageMeterUtil } from '@/util/usage-meter-util'
import { usageSeverityUtil } from '@/util/usage-severity-util'
import { UsageBar } from '@/ui-component/dashboard/usage-bar'

type UsageWindowMeterProps = {
  nowMs: number
  usageWindow: UsageWindow
}

const resolveUsageValueText = (params: { totalAmount?: number; usedAmount?: number; usedPercent: number }): string => {
  const { totalAmount, usedAmount, usedPercent } = params
  const percentText = `${String(Math.round(usedPercent))}%`
  if (usedAmount === undefined || totalAmount === undefined) {
    return percentText
  }
  return `${percentText} · ${String(usedAmount)} / ${String(totalAmount)}`
}

const resolveResetValueText = (params: { nowMs: number; resetAt?: number }): string => {
  const { nowMs, resetAt } = params
  if (resetAt === undefined) {
    return 'no active window'
  }
  return timeUntilUtil.resolveTimeUntil({ nowMs, resetAt })
}

export const UsageWindowMeter = (props: UsageWindowMeterProps): ReactElement => {
  const { nowMs, usageWindow } = props
  const theme = useTheme()
  const styles = createStyles({ theme })
  const windowMs = usageWindow.windowMs ?? constant.usageMeter.fiveHourWindowMs
  const paceFillColor = new UsagePaceUtil().resolvePaceColor({
    nowMs,
    resetAt: usageWindow.resetAt,
    theme,
    usedPercent: usageWindow.usedPercent,
    windowMs,
  })
  const fillColor =
    paceFillColor ?? usageSeverityUtil.resolveSeverityColor({ theme, usedPercent: usageWindow.usedPercent })
  const resetBarPercent = usageMeterUtil.resolveResetBarPercent({ nowMs, resetAt: usageWindow.resetAt, windowMs })

  return (
    <View style={styles.meter}>
      <Text style={styles.meterTitle}>{usageWindow.label}</Text>
      <UsageBar
        accessibilityLabel={`${usageWindow.label} usage meter`}
        fillColor={fillColor}
        label="Usage"
        percent={usageWindow.usedPercent}
        valueText={resolveUsageValueText({
          totalAmount: usageWindow.totalAmount,
          usedAmount: usageWindow.usedAmount,
          usedPercent: usageWindow.usedPercent,
        })}
      />
      <UsageBar
        accessibilityLabel={`${usageWindow.label} reset meter`}
        fillColor={fillColor}
        isRightAnchored
        label="Reset"
        percent={resetBarPercent}
        valueText={resolveResetValueText({ nowMs, resetAt: usageWindow.resetAt })}
      />
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    meter: {
      gap: 6,
    },
    meterTitle: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '500',
    },
  })
}
