import { type ReactElement } from 'react'

import { useTheme } from '@/business/hook/use-theme'
import { LocalIcon } from '@/ui-component/icon/local-icon'
import { ServerIcon } from '@/ui-component/icon/server-icon'

export const SessionOriginIcon = (props: { isRemote: boolean }): ReactElement => {
  const { isRemote } = props
  const theme = useTheme()

  if (isRemote) {
    return <ServerIcon color={theme.accent} />
  }

  return <LocalIcon color={theme.muted} />
}
