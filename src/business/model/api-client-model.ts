import { ApiClientErrorMapper } from '@/business/enum/api-client-error-mapper-enum'

export type ApiClientResult<T> = { data: T; success: true } | { error: ApiClientErrorMapper; success: false }
