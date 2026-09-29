import { type ReactElement } from 'react'
import Svg, { Path } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 16

export const PlayIcon = (props: { color: string; size?: number }): ReactElement => {
  const { color, size = DEFAULT_ICON_SIZE } = props

  return (
    <Svg fill={color} height={size} viewBox="0 0 24 24" width={size}>
      <Path d="M8 5v14l11-7z" />
    </Svg>
  )
}
