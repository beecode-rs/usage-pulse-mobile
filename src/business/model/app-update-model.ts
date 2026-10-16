import { UpdateCheckErrorMapper } from '@/business/enum/update-check-error-mapper-enum'

export type AppUpdate = {
  downloadUrl: string
  version: string
}

export type AppUpdateError =
  | { kind: UpdateCheckErrorMapper.HTTP_ERROR; status: number }
  | { kind: UpdateCheckErrorMapper.INVALID_RESPONSE; reason: string }
  | { kind: UpdateCheckErrorMapper.NETWORK; message: string }
  | { kind: UpdateCheckErrorMapper.RATE_LIMITED; resetAt: number }
  | { kind: UpdateCheckErrorMapper.TIMEOUT; message: string }
  | { kind: UpdateCheckErrorMapper.UNKNOWN; message: string }
