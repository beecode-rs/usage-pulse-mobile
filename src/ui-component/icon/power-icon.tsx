import { type ReactElement } from 'react'
import Svg, { Line, Path } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 16

export const PowerIcon = (props: { color: string; size?: number }): ReactElement => {
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
      <Path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <Line x1="12" x2="12" y1="2" y2="12" />
    </Svg>
  )
}
