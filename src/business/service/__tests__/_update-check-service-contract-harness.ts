import { vi } from 'vitest'

import { type AppUpdate, type AppUpdateError } from '@/business/model/app-update-model'
import { UpdateCheckService } from '@/business/service/update-check-service'
import { constant } from '@/util/constant'

const fetchMock = vi.fn()

vi.stubGlobal('fetch', fetchMock)

vi.mock('expo-constants', () => {
  return {
    default: {
      expoConfig: { version: '0.2.0' },
    },
  }
})

const releasePayload = {
  assets: [
    {
      browser_download_url:
        'https://github.com/beecode-rs/usage-pulse-mobile/releases/download/v0.3.0/UsagePulse-v0.3.0-android.apk',
      name: 'UsagePulse-v0.3.0-android.apk',
    },
    {
      browser_download_url:
        'https://github.com/beecode-rs/usage-pulse-mobile/releases/download/v0.3.0/UsagePulse-v0.3.0-ios-unsigned.ipa',
      name: 'UsagePulse-v0.3.0-ios-unsigned.ipa',
    },
  ],
  html_url: 'https://github.com/beecode-rs/usage-pulse-mobile/releases/tag/v0.3.0',
  tag_name: 'v0.3.0',
}

const releasePayloadWithoutApkAsset = {
  assets: [
    {
      browser_download_url:
        'https://github.com/beecode-rs/usage-pulse-mobile/releases/download/v0.3.0/UsagePulse-v0.3.0-ios-unsigned.ipa',
      name: 'UsagePulse-v0.3.0-ios-unsigned.ipa',
    },
  ],
  html_url: 'https://github.com/beecode-rs/usage-pulse-mobile/releases/tag/v0.3.0',
  tag_name: 'v0.3.0',
}

const checkForUpdateResult = async (params: {
  currentVersion: string
}): Promise<AppUpdate | AppUpdateError | undefined> => {
  const updateCheckService = new UpdateCheckService()
  try {
    return await updateCheckService.checkForNewVersion({ currentVersion: params.currentVersion })
  } catch (error) {
    return updateCheckService.resolveUpdateError({ error })
  }
}

export const updateCheckServiceContractHarness = {
  checkForNewVersionWhenCurrentVersionMatches: async (params: { currentVersion: string }) => {
    const { currentVersion } = params
    fetchMock.mockImplementation(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            assets: releasePayload.assets,
            html_url: releasePayload.html_url,
            tag_name: 'v0.2.0',
          }),
          { status: 200 },
        ),
      )
    })

    return await new UpdateCheckService().checkForNewVersion({ currentVersion })
  },

  checkForNewVersionWhenFetchRejects: async (params: { currentVersion: string }) => {
    const { currentVersion } = params
    fetchMock.mockRejectedValue(new TypeError('Network request failed'))

    return await checkForUpdateResult({ currentVersion })
  },

  checkForNewVersionWhenInvalidResponse: async (params: { currentVersion: string }) => {
    const { currentVersion } = params
    fetchMock.mockImplementation(() => {
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    })

    return await checkForUpdateResult({ currentVersion })
  },

  checkForNewVersionWhenNewerReleaseWithApkAsset: async (params: { currentVersion: string }) => {
    const { currentVersion } = params
    fetchMock.mockImplementation(() => {
      return Promise.resolve(new Response(JSON.stringify(releasePayload), { status: 200 }))
    })

    return await new UpdateCheckService().checkForNewVersion({ currentVersion })
  },

  checkForNewVersionWhenNewerReleaseWithoutApkAsset: async (params: { currentVersion: string }) => {
    const { currentVersion } = params
    fetchMock.mockImplementation(() => {
      return Promise.resolve(new Response(JSON.stringify(releasePayloadWithoutApkAsset), { status: 200 }))
    })

    return await new UpdateCheckService().checkForNewVersion({ currentVersion })
  },

  checkForNewVersionWhenOlderRelease: async (params: { currentVersion: string }) => {
    const { currentVersion } = params
    fetchMock.mockImplementation(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            assets: releasePayload.assets,
            html_url: releasePayload.html_url,
            tag_name: 'v0.1.0',
          }),
          { status: 200 },
        ),
      )
    })

    return await new UpdateCheckService().checkForNewVersion({ currentVersion })
  },

  checkForNewVersionWhenRateLimited: async (params: { currentVersion: string }) => {
    const { currentVersion } = params
    fetchMock.mockImplementation(() => {
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'API rate limit exceeded for 192.0.2.1.' }), {
          headers: {
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': '1790000000',
          },
          status: 403,
        }),
      )
    })

    return await checkForUpdateResult({ currentVersion })
  },

  checkForNewVersionWhenStatusNotOk: async (params: { currentVersion: string }) => {
    const { currentVersion } = params
    fetchMock.mockImplementation(() => {
      return Promise.resolve(new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 }))
    })

    return await checkForUpdateResult({ currentVersion })
  },

  checkForNewVersionWhenTimedOut: async (params: { currentVersion: string }) => {
    const { currentVersion } = params
    vi.useFakeTimers()
    fetchMock.mockImplementation((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'))
        })
      })
    })

    try {
      const resultPromise = checkForUpdateResult({ currentVersion })
      await vi.advanceTimersByTimeAsync(constant.updateCheck.timeoutMs)

      return await resultPromise
    } finally {
      vi.useRealTimers()
    }
  },

  checkForNewVersionRequest: async (params: { currentVersion: string }) => {
    const { currentVersion } = params
    fetchMock.mockImplementation(() => {
      return Promise.resolve(new Response(JSON.stringify(releasePayload), { status: 200 }))
    })

    const result = await new UpdateCheckService().checkForNewVersion({ currentVersion })
    const firstCall = fetchMock.mock.calls[0]
    const headers = firstCall?.[1]?.headers as Record<string, string> | undefined

    return {
      headersAccept: headers?.accept,
      result,
      url: firstCall?.[0],
    }
  },

  resolveCurrentVersion: () => {
    return new UpdateCheckService().resolveCurrentVersion()
  },

  resolveUpdateError: (params: { error: unknown }) => {
    const { error } = params

    return new UpdateCheckService().resolveUpdateError({ error })
  },
}
