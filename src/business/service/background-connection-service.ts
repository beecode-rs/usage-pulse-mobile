import { Platform } from 'react-native'
import BackgroundService from 'react-native-background-actions'

import { constant } from '@/util/constant'

export class BackgroundConnectionService {
  async start(): Promise<void> {
    if (Platform.OS !== 'android' || BackgroundService.isRunning()) {
      return
    }
    const { taskDesc, taskIconName, taskIconType, taskName, taskTitle } = constant.backgroundConnection
    try {
      await BackgroundService.start(this._keepAliveTask, {
        foregroundServiceType: ['connectedDevice'],
        taskDesc,
        taskIcon: { name: taskIconName, type: taskIconType },
        taskName,
        taskTitle,
      })
    } catch {
      return
    }
  }

  async stop(): Promise<void> {
    if (!BackgroundService.isRunning()) {
      return
    }
    try {
      await BackgroundService.stop()
    } catch {
      return
    }
  }

  protected _keepAliveTask(): Promise<void> {
    return new Promise<void>(() => {
      return undefined
    })
  }
}
