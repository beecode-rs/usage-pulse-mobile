import { type ReactElement } from 'react'
import Svg, { Line, Polyline } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 15

export const OpenCodeIcon = (props: { color: string; size?: number }): ReactElement => {
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
      <Polyline points="8,6 3,12 8,18" />
      <Polyline points="16,6 21,12 16,18" />
      <Line x1="13.5" x2="10.5" y1="5" y2="19" />
    </Svg>
  )
}
