import { type ConnectionConfig } from '@/business/model/connection-config-model'
import { constant } from '@/util/constant'

export const connectionFormUtil = {
  resolveConfigOrErrorMessage: (params: {
    host: string
    port: string
    token: string
  }): { config: ConnectionConfig; errorMessage: undefined } | { config: undefined; errorMessage: string } => {
    const { host, port, token } = params
    const missingFieldLabels = connectionFormUtil.resolveMissingFieldLabels({ host, token })
    if (missingFieldLabels.length > 0) {
      return { config: undefined, errorMessage: `Missing: ${missingFieldLabels.join(', ')}` }
    }
    const portResolution = connectionFormUtil.resolvePortResolution({ port })
    if (portResolution.errorMessage !== undefined) {
      return { config: undefined, errorMessage: portResolution.errorMessage }
    }
    return { config: { host, port: portResolution.portNumber, token }, errorMessage: undefined }
  },

  resolveMissingFieldLabels: (params: { host: string; token: string }): string[] => {
    const { host, token } = params
    return [
      { hasValue: host.trim() !== '', label: 'Host' },
      { hasValue: token.trim() !== '', label: 'Token' },
    ]
      .filter((field) => {
        return !field.hasValue
      })
      .map((field) => {
        return field.label
      })
  },

  resolvePortErrorMessage: (params: { port: string }): string | undefined => {
    const { port } = params
    return connectionFormUtil.resolvePortResolution({ port }).errorMessage
  },

  resolvePortNumber: (params: { port: string }): number | undefined => {
    const { port } = params
    return connectionFormUtil.resolvePortResolution({ port }).portNumber
  },

  resolvePortRangeErrorMessage: (): string => {
    return `Port must be a number between ${String(constant.connectionForm.minPort)} and ${String(
      constant.connectionForm.maxPort,
    )}`
  },

  resolvePortResolution: (params: {
    port: string
  }): { errorMessage: string; portNumber: undefined } | { errorMessage: undefined; portNumber: number } => {
    const { port } = params
    if (port === '') {
      return { errorMessage: undefined, portNumber: constant.connectionForm.defaultPort }
    }
    if (!constant.connectionForm.portDigitsRegex.test(port)) {
      return { errorMessage: connectionFormUtil.resolvePortRangeErrorMessage(), portNumber: undefined }
    }
    const portNumber = Number.parseInt(port, 10)
    if (portNumber < constant.connectionForm.minPort || portNumber > constant.connectionForm.maxPort) {
      return { errorMessage: connectionFormUtil.resolvePortRangeErrorMessage(), portNumber: undefined }
    }
    return { errorMessage: undefined, portNumber }
  },
}
