import { type ReactElement } from 'react'
import Svg, { Polyline } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 16

export const CheckIcon = (props: { color: string; size?: number }): ReactElement => {
  const { color, size = DEFAULT_ICON_SIZE } = props

  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      width={size}
    >
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  )
}
