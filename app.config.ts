import { type ExpoConfig } from 'expo/config'

import appJson from './app.json'

const isDevVariant = process.env.APP_VARIANT === 'dev' || process.env.APP_VARIANT === 'development'

const resolveName = (): string => {
  if (isDevVariant) {
    return 'Usage Pulse Mobile (dev)'
  }
  return appJson.expo.name
}

const config: ExpoConfig = {
  ...(appJson.expo as ExpoConfig),
  name: resolveName(),
}

export default config
