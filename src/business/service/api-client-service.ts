import { type z } from 'zod'

import { ApiClientErrorMapper } from '@/business/enum/api-client-error-mapper-enum'
import { type ApiClientResult } from '@/business/model/api-client-model'
import { type ConnectionConfig } from '@/business/model/connection-config-model'
import { type MobileHealthResponse, type MobileStateResponse } from '@/business/model/mobile-api-model'
import { mobileHealthResponseSchema, mobileStateResponseSchema } from '@/business/schema/mobile-api-schema'
import { constant } from '@/util/constant'

export class ApiClientService {
  async fetchHealth(params: { config: ConnectionConfig }): Promise<ApiClientResult<MobileHealthResponse>> {
    const { config } = params

    return this._fetchParsedByPath({ config, path: '/api/health', schema: mobileHealthResponseSchema })
  }

  async fetchState(params: { config: ConnectionConfig }): Promise<ApiClientResult<MobileStateResponse>> {
    const { config } = params

    return this._fetchParsedByPath({ config, path: '/api/state', schema: mobileStateResponseSchema })
  }

  resolveApiBaseUrl(params: { host: string; port: number }): string {
    const { host, port } = params
    const normalizedHost = this._normalizeHost(host)

    return `http://${normalizedHost}:${port}`
  }

  resolveWsUrl(params: { host: string; port: number; token: string }): string {
    const { host, port, token } = params
    const normalizedHost = this._normalizeHost(host)

    return `ws://${normalizedHost}:${port}/ws?token=${encodeURIComponent(token)}`
  }

  protected async _fetchParsedByPath<T>(params: {
    config: ConnectionConfig
    path: string
    schema: z.ZodType<T>
  }): Promise<ApiClientResult<T>> {
    const { config, path, schema } = params
    const baseUrl = this.resolveApiBaseUrl({ host: config.host, port: config.port })
    const abortController = new AbortController()
    const abortTimeout = setTimeout(() => {
      abortController.abort()
    }, constant.apiClient.timeoutMs)

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: { Authorization: `Bearer ${config.token}` },
        signal: abortController.signal,
      })

      if (response.status === 401) {
        return { error: ApiClientErrorMapper.UNAUTHORIZED, success: false }
      }

      return await this._parseResponseBySchema({ response, schema })
    } catch (error) {
      return { error: this._resolveFetchErrorKind(error), success: false }
    } finally {
      clearTimeout(abortTimeout)
    }
  }

  protected _normalizeHost(host: string): string {
    const hostWithoutScheme = host.replace(constant.apiClient.urlSchemeRegex, '')
    const hostWithoutTrailingSlash = hostWithoutScheme.replace(constant.apiClient.trailingSlashRegex, '')

    return hostWithoutTrailingSlash
  }

  protected async _parseResponseBySchema<T>(params: {
    response: Response
    schema: z.ZodType<T>
  }): Promise<ApiClientResult<T>> {
    const { response, schema } = params
    const parsed = schema.safeParse(await response.json())

    if (parsed.success) {
      return { data: parsed.data, success: true }
    }

    return { error: ApiClientErrorMapper.INVALID_RESPONSE, success: false }
  }

  protected _resolveFetchErrorKind(error: unknown): ApiClientErrorMapper {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return ApiClientErrorMapper.TIMEOUT
      }

      if (error.name === 'SyntaxError') {
        return ApiClientErrorMapper.INVALID_RESPONSE
      }
    }

    return ApiClientErrorMapper.NETWORK
  }
}
