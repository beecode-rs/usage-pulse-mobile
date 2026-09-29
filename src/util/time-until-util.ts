export const timeUntilUtil = {
  resolveTimeUntil: (params: { nowMs: number; resetAt?: number }): string => {
    const { nowMs, resetAt } = params
    if (resetAt === undefined) {
      return ''
    }
    const remainingMs = resetAt - nowMs
    if (remainingMs <= 0) {
      return 'now'
    }
    const totalMinutes = Math.floor(remainingMs / 60_000)
    const days = Math.floor(totalMinutes / 1440)
    const hours = Math.floor((totalMinutes % 1440) / 60)
    const minutes = totalMinutes % 60
    if (days > 0) {
      return `${String(days)}d ${String(hours)}h`
    }
    if (hours === 0) {
      if (minutes === 0) {
        return 'under 1m'
      }
      return `${String(minutes)}m`
    }
    return `${String(hours)}h ${String(minutes)}m`
  },
}
