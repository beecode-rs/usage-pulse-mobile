import { type ReactElement } from 'react'
import Svg, { Polyline } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 16

export const ChevronDownIcon = (props: { color: string; size?: number }): ReactElement => {
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
      <Polyline points="6 9 12 15 18 9" />
    </Svg>
  )
}
