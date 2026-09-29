import { vi } from 'vitest'

import { SoundNameMapper } from '@/business/enum/sound-name-mapper-enum'
import { NotificationService } from '@/business/service/notification-service'

const tray = vi.hoisted(() => {
  return {
    contentById: new Map<string, { body: string; data?: Record<string, unknown>; title: string }>(),
    channelById: new Map<string, { name: string; sound?: string | null }>(),
    counter: 0,
    isPermissionGranted: true,
    platformOs: 'ios',
    triggerChannelIds: [] as (string | null)[],
  }
})

vi.mock('expo-notifications', () => {
  return {
    AndroidImportance: { HIGH: 5 },
    getPermissionsAsync: () => {
      return Promise.resolve({ granted: tray.isPermissionGranted })
    },
    requestPermissionsAsync: () => {
      return Promise.resolve({ granted: tray.isPermissionGranted })
    },
    scheduleNotificationAsync: (params: {
      content: { body: string; data?: Record<string, unknown>; title: string }
      identifier?: string
      trigger: { channelId: string } | null
    }) => {
      tray.triggerChannelIds.push(params.trigger?.channelId ?? null)
      tray.counter += 1
      const identifier = params.identifier ?? `notification-${String(tray.counter)}`
      tray.contentById.delete(identifier)
      tray.contentById.set(identifier, params.content)
      return Promise.resolve(identifier)
    },
    setNotificationChannelAsync: (channelId: string, channel: { name: string; sound?: string | null }) => {
      tray.channelById.set(channelId, channel)
      return Promise.resolve()
    },
    setNotificationHandler: () => {
      return undefined
    },
  }
})

vi.mock('react-native', () => {
  return {
    Platform: {
      get OS() {
        return tray.platformOs
      },
    },
  }
})

export const notificationServiceContractHarness = {
  presentOnAndroidRoutesSoundToItsChannel: async () => {
    tray.contentById.clear()
    tray.channelById.clear()
    tray.triggerChannelIds = []
    tray.counter = 0
    tray.isPermissionGranted = true
    tray.platformOs = 'android'
    const service = new NotificationService()
    await service.presentNotification({
      body: 'finished',
      sessionId: 'session-1',
      soundId: SoundNameMapper.SUCCESS,
      title: '✅ Finished',
    })
    await service.presentNotification({
      body: 'waiting',
      sessionId: 'session-2',
      soundId: SoundNameMapper.CHIME,
      title: '🙋 Needs you',
    })
    await service.presentNotification({
      body: 'silent',
      sessionId: 'session-3',
      soundId: SoundNameMapper.NONE,
      title: '✅ Finished',
    })
    await service.presentNotification({
      body: 'again',
      sessionId: 'session-4',
      soundId: SoundNameMapper.SUCCESS,
      title: '✅ Finished',
    })
    await service.presentNotification({
      body: 'system',
      sessionId: 'session-5',
      soundId: SoundNameMapper.SYSTEM_DEFAULT,
      title: '🙋 Needs you',
    })
    await service.presentNotification({ body: 'Claude · 5-hour window 90%', title: 'High usage' })
    tray.platformOs = 'ios'
    return {
      channels: [...tray.channelById.entries()].map(([id, channel]) => {
        return { id, name: channel.name, sound: channel.sound }
      }),
      triggerChannelIds: tray.triggerChannelIds,
    }
  },

  presentAfterServiceRecreated: async () => {
    tray.contentById.clear()
    tray.counter = 0
    tray.isPermissionGranted = true
    await new NotificationService().presentNotification({
      body: 'finished-first',
      sessionId: 'session-1',
      title: '✅ Finished',
    })
    await new NotificationService().presentNotification({
      body: 'finished-second',
      sessionId: 'session-1',
      title: '✅ Finished',
    })
    return {
      bodies: [...tray.contentById.values()].map((content) => {
        return content.body
      }),
    }
  },

  presentForDifferentSessions: async () => {
    tray.contentById.clear()
    tray.counter = 0
    tray.isPermissionGranted = true
    const service = new NotificationService()
    await service.presentNotification({ body: 'finished-first', sessionId: 'session-1', title: '✅ Finished' })
    await service.presentNotification({ body: 'finished-second', sessionId: 'session-2', title: '✅ Finished' })
    return {
      bodies: [...tray.contentById.values()].map((content) => {
        return content.body
      }),
    }
  },

  presentForSameSessionTwice: async () => {
    tray.contentById.clear()
    tray.counter = 0
    tray.isPermissionGranted = true
    const service = new NotificationService()
    await service.presentNotification({ body: 'finished-first', sessionId: 'session-1', title: '✅ Finished' })
    await service.presentNotification({ body: 'finished-second', sessionId: 'session-1', title: '✅ Finished' })
    return {
      bodies: [...tray.contentById.values()].map((content) => {
        return content.body
      }),
    }
  },

  presentWhenPermissionDenied: async () => {
    tray.contentById.clear()
    tray.counter = 0
    tray.isPermissionGranted = false
    await new NotificationService().presentNotification({
      body: 'finished-first',
      sessionId: 'session-1',
      title: '✅ Finished',
    })
    return {
      bodies: [...tray.contentById.values()].map((content) => {
        return content.body
      }),
    }
  },

  presentWithoutSessionIdTwice: async () => {
    tray.contentById.clear()
    tray.counter = 0
    tray.isPermissionGranted = true
    const service = new NotificationService()
    await service.presentNotification({ body: 'Claude · 5-hour window 90%', title: 'High usage' })
    await service.presentNotification({ body: 'Claude · 5-hour window 95%', title: 'High usage' })
    return {
      bodies: [...tray.contentById.values()].map((content) => {
        return content.body
      }),
    }
  },

  presentWaitingAfterFinishedForSameSession: async () => {
    tray.contentById.clear()
    tray.counter = 0
    tray.isPermissionGranted = true
    const service = new NotificationService()
    await service.presentNotification({
      body: 'fix-login (bug)\n/home/milos/code/usage-pulse',
      sessionId: 'session-1',
      title: '✅ Finished',
    })
    await service.presentNotification({
      body: 'fix-login (bug)\n/home/milos/code/usage-pulse',
      sessionId: 'session-1',
      title: '⏳ Waiting',
    })
    return {
      bodies: [...tray.contentById.values()].map((content) => {
        return content.body
      }),
    }
  },

  presentFinishedAfterWaitingForSameSession: async () => {
    tray.contentById.clear()
    tray.counter = 0
    tray.isPermissionGranted = true
    const service = new NotificationService()
    await service.presentNotification({
      body: 'fix-login (bug)\n/home/milos/code/usage-pulse',
      sessionId: 'session-1',
      title: '⏳ Waiting',
    })
    await service.presentNotification({
      body: 'fix-login (bug)\n/home/milos/code/usage-pulse',
      sessionId: 'session-1',
      title: '✅ Finished',
    })
    return {
      titles: [...tray.contentById.values()].map((content) => {
        return content.title
      }),
    }
  },
}
