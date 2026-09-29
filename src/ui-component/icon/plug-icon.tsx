import { type ReactElement } from 'react'
import Svg, { Path } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 16

export const PlugIcon = (props: { color: string; size?: number }): ReactElement => {
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
      <Path d="M12 22v-5" />
      <Path d="M9 8V2" />
      <Path d="M15 8V2" />
      <Path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
    </Svg>
  )
}
