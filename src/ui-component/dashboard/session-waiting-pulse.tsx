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

export const SessionWaitingPulse = (props: { isWaiting: boolean }): ReactElement | undefined => {
  const { isWaiting } = props
  const theme = useTheme()
  const styles = createStyles({ theme })
  const waveProgress = useSharedValue(0)

  useEffect(() => {
    if (!isWaiting) {
      return
    }
    const halfWaveDurationMs = constant.sessionPulse.waveDurationMs / 2
    const waveEasing = Easing.inOut(Easing.ease)
    waveProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: halfWaveDurationMs, easing: waveEasing }),
        withTiming(0, { duration: halfWaveDurationMs, easing: waveEasing }),
      ),
      -1,
    )

    return () => {
      cancelAnimation(waveProgress)
    }
  }, [isWaiting, waveProgress])

  const overlayStyle = useAnimatedStyle(() => {
    return { opacity: waveProgress.value }
  })

  if (!isWaiting) {
    return undefined
  }

  return <Animated.View pointerEvents="none" style={[styles.overlay, overlayStyle]} />
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFill,
      borderColor: theme.sessionWaiting,
      borderRadius: 12,
      borderLeftWidth: 3,
      borderWidth: 1,
    },
  })
}
