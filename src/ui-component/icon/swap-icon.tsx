import { type ReactElement } from 'react'
import Svg, { Line, Polyline } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 13

export const SwapIcon = (props: { color: string; size?: number }): ReactElement => {
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
      <Line x1="3" x2="21" y1="5" y2="5" />
      <Polyline points="17 1 21 5 17 9" />
      <Line x1="21" x2="3" y1="19" y2="19" />
      <Polyline points="7 23 3 19 7 15" />
    </Svg>
  )
}
