import { type ReactElement, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { constant } from '@/util/constant'
import { sessionFinishedPulseUtil } from '@/util/session-finished-pulse-util'

export const SessionFinishedPulse = (props: {
  finishedAtMs?: number
  nowMs: number
  pulseMs: number
}): ReactElement | undefined => {
  const { finishedAtMs, nowMs, pulseMs } = props
  const theme = useTheme()
  const styles = createStyles({ theme })
  const waveProgress = useSharedValue(0)
  const decayProgress = useSharedValue(1)
  const isPulsing = sessionFinishedPulseUtil.isPulsing({ finishedAtMs, nowMs, pulseMs })

  useEffect(() => {
    if (!isPulsing) {
      return
    }
    const finishedAt = finishedAtMs ?? Date.now()
    const remainingFraction = Math.min(Math.max((pulseMs - (Date.now() - finishedAt)) / pulseMs, 0), 1)
    const halfWaveDurationMs = constant.sessionPulse.waveDurationMs / 2
    const waveEasing = Easing.inOut(Easing.ease)
    waveProgress.value = 0
    decayProgress.value = remainingFraction
    waveProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: halfWaveDurationMs, easing: waveEasing }),
        withTiming(0, { duration: halfWaveDurationMs, easing: waveEasing }),
      ),
      -1,
    )
    decayProgress.value = withTiming(0, { duration: remainingFraction * pulseMs, easing: Easing.linear })

    return () => {
      cancelAnimation(decayProgress)
      cancelAnimation(waveProgress)
    }
  }, [decayProgress, finishedAtMs, isPulsing, pulseMs, waveProgress])

  const overlayStyle = useAnimatedStyle(() => {
    return { opacity: waveProgress.value * decayProgress.value }
  })

  if (!isPulsing) {
    return undefined
  }

  return <Animated.View pointerEvents="none" style={[styles.overlay, overlayStyle]} />
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFill,
      borderColor: theme.text,
      borderRadius: 12,
      borderLeftWidth: 3,
      borderWidth: 1,
    },
  })
}
