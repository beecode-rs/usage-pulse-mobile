import { z } from 'zod'

const githubReleaseAssetSchema = z.object({
  browser_download_url: z.string(),
  name: z.string(),
})

export const githubLatestReleaseResponseSchema = z.object({
  assets: z.array(githubReleaseAssetSchema),
  html_url: z.string(),
  tag_name: z.string(),
})

export type GithubLatestReleaseResponse = z.infer<typeof githubLatestReleaseResponseSchema>
export type GithubReleaseAsset = z.infer<typeof githubReleaseAssetSchema>
