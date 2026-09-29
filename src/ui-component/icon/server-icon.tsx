import { type ReactElement } from 'react'
import Svg, { Line, Rect } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 15

export const ServerIcon = (props: { color: string; size?: number }): ReactElement => {
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
      <Rect height="8" rx="2" ry="2" width="20" x="2" y="2" />
      <Rect height="8" rx="2" ry="2" width="20" x="2" y="14" />
      <Line x1="6" x2="6.01" y1="6" y2="6" />
      <Line x1="6" x2="6.01" y1="18" y2="18" />
    </Svg>
  )
}
