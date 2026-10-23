import { type ReactElement } from 'react'
import Svg, { Line } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 15

export const ClaudeCodeIcon = (props: { color: string; size?: number }): ReactElement => {
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
      <Line x1="12" x2="12" y1="3" y2="21" />
      <Line x1="3" x2="21" y1="12" y2="12" />
      <Line x1="5.6" x2="18.4" y1="5.6" y2="18.4" />
      <Line x1="18.4" x2="5.6" y1="5.6" y2="18.4" />
    </Svg>
  )
}
