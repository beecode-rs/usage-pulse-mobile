import { type ReactElement } from 'react'
import Svg, { Polygon } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 13

export const PeakIcon = (props: { color: string; size?: number }): ReactElement => {
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
      <Polygon points="13 2 3 14 12 14 11 22 21 10 12 13" />
    </Svg>
  )
}
