export const versionCompareUtil = {
  isNewer: (params: { candidate: string; current: string }): boolean => {
    const { candidate, current } = params
    const candidateParts = candidate.split('.').map((part) => {
      return Number.parseInt(part, 10)
    })
    const currentParts = current.split('.').map((part) => {
      return Number.parseInt(part, 10)
    })
    const differenceIndex = candidateParts.findIndex((part, index) => {
      return part !== (currentParts[index] ?? 0)
    })
    if (differenceIndex === -1) {
      return false
    }

    return candidateParts[differenceIndex] > (currentParts[differenceIndex] ?? 0)
  },
}
