import { type ProviderSnapshot } from '@/business/model/usage-model'

export class UsageStalenessUtil {
  isSnapshotStale(params: { nowMs: number; providerSnapshot: ProviderSnapshot; refreshIntervalMs?: number }): boolean {
    const { nowMs, providerSnapshot, refreshIntervalMs } = params

    if (refreshIntervalMs === undefined || providerSnapshot.fetchedAt === undefined) {
      return false
    }

    return nowMs - providerSnapshot.fetchedAt > refreshIntervalMs
  }
}
