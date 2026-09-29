import { ProviderIdMapper } from '@/business/enum/provider-id-mapper-enum'
import { SoundNameMapper } from '@/business/enum/sound-name-mapper-enum'
import { SettingsTabMapper } from '@/business/enum/settings-tab-mapper-enum'
import { ThemeModeMapper } from '@/business/enum/theme-mode-mapper-enum'

export const constant = {
  about: {
    beecodeUrl: 'https://beecode.rs',
    providerCatalog: [
      {
        description: 'Usage limits from your Claude coding plan',
        id: ProviderIdMapper.CLAUDE,
        name: 'Claude',
      },
      {
        description: 'Usage limits from your GLM coding plan',
        id: ProviderIdMapper.ZAI,
        name: 'z.ai',
      },
    ],
  },
  apiClient: {
    timeoutMs: 5000,
    trailingSlashRegex: /\/+$/,
    urlSchemeRegex: /^https?:\/\//,
  },
  backgroundConnection: {
    taskDesc: 'Watching your sessions for finished and waiting updates',
    taskIconName: 'ic_launcher',
    taskIconType: 'mipmap',
    taskName: 'usage-pulse-background-connection',
    taskTitle: 'Usage Pulse is connected',
  },
  connectionConfig: {
    storageKey: 'usage-pulse-mobile.connection-config',
  },
  connectionForm: {
    defaultPort: 8787,
    maxPort: 65535,
    minPort: 1024,
    portDigitsRegex: /^\d+$/,
  },
  notification: {
    androidChannelId: 'usage-pulse-alerts',
    sessionIdentifierPrefix: 'session-',
    waitingAccentColor: '#a78bfa',
    androidChannelName: 'Usage Pulse alerts',
  },
  notificationSound: {
    androidChannelIdPrefix: 'usage-pulse-session-sound-',
    androidChannelNamePrefix: 'Session alerts · ',
    defaultConfig: {
      sessionFinishedSoundId: SoundNameMapper.SUCCESS,
      waitingSoundId: SoundNameMapper.CHIME,
    },
    fileExtension: '.wav',
    dropdownItemHeight: 44,
    optionCatalog: [
      { label: 'System default', soundId: SoundNameMapper.SYSTEM_DEFAULT },
      { label: 'None', soundId: SoundNameMapper.NONE },
      { label: 'Beep', soundId: SoundNameMapper.BEEP },
      { label: 'Chime', soundId: SoundNameMapper.CHIME },
      { label: 'Ding', soundId: SoundNameMapper.DING },
      { label: 'Fanfare', soundId: SoundNameMapper.FANFARE },
      { label: 'Ping', soundId: SoundNameMapper.PING },
      { label: 'Success', soundId: SoundNameMapper.SUCCESS },
    ],
    storageKey: 'usage-pulse-mobile.notification-sound-config',
    systemDefaultAndroidUri: 'content://settings/system/notification_sound',
  },
  sessionPulse: {
    finishedDefaultMs: 30_000,
    waveDurationMs: 1_200,
  },
  settings: {
    tabCatalog: [
      { id: SettingsTabMapper.CONNECTION, label: 'Connection' },
      { id: SettingsTabMapper.SYSTEM, label: 'System' },
    ],
  },
  themeConfig: {
    defaultMode: ThemeModeMapper.AUTO,
    storageKey: 'usage-pulse-mobile.theme-mode',
  },
  usageMeter: {
    fiveHourWindowMs: 5 * 60 * 60 * 1000,
    paceOnPaceBandPercent: 5,
    paceStepMaxCount: 5,
    paceStepPercent: 20,
    quotaWindowLabels: ['MCP quota', 'Weekly'],
    sessionPaneLabelText: '5h',
    staleLabelText: 'Stale',
  },
  usageSeverityThresholds: {
    fillingUpPercent: 70,
    highUsagePercent: 85,
    limitReachedPercent: 95,
  },
  wsClient: {
    maxReconnectDelayMs: 30000,
    reconnectBaseDelayMs: 1000,
    watchdogTimeoutMs: 75000,
  },
  zaiPeak: {
    minuteOfDay: {
      end: 18 * 60,
      start: 14 * 60,
    },
    utcOffsetMinutes: 8 * 60,
    weekday: {
      first: 1,
      last: 5,
    },
  },
}
