import Constants from 'expo-constants'
import { type z } from 'zod'

import { UpdateCheckErrorMapper } from '@/business/enum/update-check-error-mapper-enum'
import { type AppUpdate, type AppUpdateError } from '@/business/model/app-update-model'
import {
  githubLatestReleaseResponseSchema,
  type GithubLatestReleaseResponse,
  type GithubReleaseAsset,
} from '@/business/schema/github-release-schema'
import { constant } from '@/util/constant'
import { versionCompareUtil } from '@/util/version-compare-util'

export class UpdateCheckService {
  async checkForNewVersion(params: { currentVersion: string }): Promise<AppUpdate | undefined> {
    const { currentVersion } = params
    const release = await this._fetchLatestRelease()

    return this._resolveUpdateFromRelease({ currentVersion, release })
  }

  resolveCurrentVersion(): string {
    return Constants.expoConfig?.version ?? ''
  }

  resolveUpdateError(params: { error: unknown }): AppUpdateError {
    const { error } = params
    if (this._isUpdateError(error)) {
      return error
    }
    if (error instanceof Error) {
      return this._resolveUpdateErrorFromError({ error })
    }

    return { kind: UpdateCheckErrorMapper.UNKNOWN, message: String(error) }
  }

  protected async _fetchLatestRelease(): Promise<GithubLatestReleaseResponse> {
    const abortController = new AbortController()
    const abortTimeout = setTimeout(() => {
      abortController.abort()
    }, constant.updateCheck.timeoutMs)

    try {
      const response = await fetch(constant.updateCheck.latestReleaseUrl, {
        headers: { accept: 'application/vnd.github+json' },
        signal: abortController.signal,
      })

      return await this._resolveReleaseFromResponse({ response })
    } catch (error) {
      throw this.resolveUpdateError({ error })
    } finally {
      clearTimeout(abortTimeout)
    }
  }

  protected _isUpdateError(error: unknown): error is AppUpdateError {
    if (typeof error !== 'object' || error === null || !('kind' in error)) {
      return false
    }

    return Object.values(UpdateCheckErrorMapper).includes((error as AppUpdateError).kind)
  }

  protected async _resolveReleaseFromResponse(params: { response: Response }): Promise<GithubLatestReleaseResponse> {
    const { response } = params
    const rateLimitResetAt = this._resolveRateLimitResetAt({ response })
    if (rateLimitResetAt !== undefined) {
      const rateLimitError: AppUpdateError = {
        kind: UpdateCheckErrorMapper.RATE_LIMITED,
        resetAt: rateLimitResetAt,
      }
      throw rateLimitError
    }
    if (!response.ok) {
      const httpError: AppUpdateError = { kind: UpdateCheckErrorMapper.HTTP_ERROR, status: response.status }
      throw httpError
    }

    const parsed = githubLatestReleaseResponseSchema.safeParse(await response.json())
    if (!parsed.success) {
      const invalidResponseError: AppUpdateError = {
        kind: UpdateCheckErrorMapper.INVALID_RESPONSE,
        reason: this._resolveSchemaErrorReason({ error: parsed.error }),
      }
      throw invalidResponseError
    }

    return parsed.data
  }

  protected _resolveApkDownloadUrl(params: { assets: GithubReleaseAsset[] }): string | undefined {
    const { assets } = params
    const apkAsset = assets.find((asset) => {
      return constant.updateCheck.apkAssetNameRegex.test(asset.name)
    })

    return apkAsset?.browser_download_url
  }

  protected _resolveRateLimitResetAt(params: { response: Response }): number | undefined {
    const { response } = params
    const remainingHeader = response.headers.get(constant.updateCheck.rateLimitRemainingHeader)
    const resetHeader = response.headers.get(constant.updateCheck.rateLimitResetHeader)
    if (remainingHeader !== '0' || resetHeader === null) {
      return undefined
    }
    const resetEpochSeconds = Number(resetHeader)
    if (Number.isNaN(resetEpochSeconds)) {
      return undefined
    }

    return resetEpochSeconds * 1000
  }

  protected _resolveSchemaErrorReason(params: { error: z.ZodError }): string {
    const { error } = params
    const firstIssue = error.issues[0]
    if (firstIssue === undefined) {
      return 'unknown schema error'
    }
    const issuePath = firstIssue.path.join('.')
    if (issuePath === '') {
      return firstIssue.message
    }

    return `${issuePath}: ${firstIssue.message}`
  }

  protected _resolveTagVersion(params: { tag: string }): string {
    const { tag } = params

    return tag.replace(constant.updateCheck.versionTagPrefixRegex, '')
  }

  protected _resolveUpdateErrorFromError(params: { error: Error }): AppUpdateError {
    const { message, name } = params.error
    switch (name) {
      case 'AbortError': {
        return { kind: UpdateCheckErrorMapper.TIMEOUT, message }
      }
      case 'SyntaxError': {
        return { kind: UpdateCheckErrorMapper.INVALID_RESPONSE, reason: message }
      }
      case 'TypeError': {
        return { kind: UpdateCheckErrorMapper.NETWORK, message }
      }
      default: {
        return { kind: UpdateCheckErrorMapper.UNKNOWN, message }
      }
    }
  }

  protected _resolveUpdateFromRelease(params: {
    currentVersion: string
    release: GithubLatestReleaseResponse
  }): AppUpdate | undefined {
    const { currentVersion, release } = params
    const version = this._resolveTagVersion({ tag: release.tag_name })
    if (!versionCompareUtil.isNewer({ candidate: version, current: currentVersion })) {
      return undefined
    }

    return {
      downloadUrl: this._resolveApkDownloadUrl({ assets: release.assets }) ?? release.html_url,
      version,
    }
  }
}
