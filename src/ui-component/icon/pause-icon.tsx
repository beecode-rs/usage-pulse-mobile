import { type ReactElement } from 'react'
import Svg, { Rect } from 'react-native-svg'

const DEFAULT_ICON_SIZE = 16

export const PauseIcon = (props: { color: string; size?: number }): ReactElement => {
  const { color, size = DEFAULT_ICON_SIZE } = props

  return (
    <Svg fill={color} height={size} viewBox="0 0 24 24" width={size}>
      <Rect height={14} rx={1.5} width={4} x={6.5} y={5} />
      <Rect height={14} rx={1.5} width={4} x={13.5} y={5} />
    </Svg>
  )
}
