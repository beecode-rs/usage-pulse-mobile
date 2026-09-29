import type { ProviderIdMapper } from '@/business/enum/provider-id-mapper-enum'
import type { UsageActivityStatus } from '@/business/enum/usage-activity-status-enum'

export type UsageWindow = {
  label: string
  resetAt?: number
  totalAmount?: number
  usedAmount?: number
  usedPercent: number
  windowMs?: number
}

export type ProviderSnapshot = {
  errorMessage?: string
  fetchedAt?: number
  nextRefreshAt?: number
  providerId: ProviderIdMapper
  refreshIntervalMs?: number
  status: UsageActivityStatus
  trackerId: string
  trackerName: string
  usage?: UsageWindow[]
}

export type UsageSnapshot = {
  providers: ProviderSnapshot[]
}
