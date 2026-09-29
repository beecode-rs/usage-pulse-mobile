import { AndroidConfig, type ConfigPlugin, withAndroidManifest } from 'expo/config-plugins'

type AndroidManifestService = NonNullable<AndroidConfig.Manifest.ManifestApplication['service']>[number]

const backgroundConnectionServiceName = 'com.asterinet.react.bgactions.RNBackgroundActionsTask'

const backgroundConnectionPermissions = [
  'android.permission.CHANGE_NETWORK_STATE',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE',
]

const resolveBackgroundConnectionService = (): AndroidManifestService => {
  return {
    $: {
      'android:exported': 'false',
      'android:foregroundServiceType': 'connectedDevice',
      'android:name': backgroundConnectionServiceName,
    },
  }
}

const resolveServicesWithBackgroundConnection = (params: {
  services: AndroidManifestService[]
}): AndroidManifestService[] => {
  const { services } = params
  const otherServices = services.filter((service) => {
    return service.$['android:name'] !== backgroundConnectionServiceName
  })
  return [...otherServices, resolveBackgroundConnectionService()]
}

const withBackgroundConnectionService: ConfigPlugin = (config) => {
  const configWithPermissions = AndroidConfig.Permissions.withPermissions(config, backgroundConnectionPermissions)
  return withAndroidManifest(configWithPermissions, (manifestConfig) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(manifestConfig.modResults)
    mainApplication.service = resolveServicesWithBackgroundConnection({ services: mainApplication.service ?? [] })
    return manifestConfig
  })
}

export default withBackgroundConnectionService
