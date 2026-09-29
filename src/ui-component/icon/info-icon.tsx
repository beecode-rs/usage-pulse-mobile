import { type ReactElement } from 'react'
import Svg, { Circle, Line } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 16

export const InfoIcon = (props: { color: string; size?: number }): ReactElement => {
  const { color, size = DEFAULT_ICON_SIZE } = props

  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
    >
      <Circle cx="12" cy="12" r="10" />
      <Line x1="12" x2="12" y1="16" y2="12" />
      <Line x1="12" x2="12.01" y1="8" y2="8" />
    </Svg>
  )
}
