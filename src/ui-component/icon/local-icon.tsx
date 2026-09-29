import { type ReactElement } from 'react'
import Svg, { Line, Rect } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 15

export const LocalIcon = (props: { color: string; size?: number }): ReactElement => {
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
      <Rect height="14" rx="2" ry="2" width="20" x="2" y="3" />
      <Line x1="8" x2="16" y1="21" y2="21" />
      <Line x1="12" x2="12" y1="17" y2="21" />
    </Svg>
  )
}
