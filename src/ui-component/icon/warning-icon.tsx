import { type ReactElement } from 'react'
import Svg, { Line, Path } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 13

export const WarningIcon = (props: { color: string; size?: number }): ReactElement => {
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
      <Path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <Line x1={12} x2={12} y1={9} y2={13} />
      <Line x1={12} x2={12.01} y1={17} y2={17} />
    </Svg>
  )
}
