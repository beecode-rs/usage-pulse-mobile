import Constants from 'expo-constants'
import { type ReactElement } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/business/hook/use-theme'
import { type ThemePalette } from '@/business/model/theme-model'
import { BeecodeCredit } from '@/ui-component/about/beecode-credit'
import { constant } from '@/util/constant'

type AboutScreenProps = {
  onBackPress: () => void
}

const resolveAppVersion = (): string => {
  return Constants.expoConfig?.version ?? ''
}

export const AboutScreen = (props: AboutScreenProps): ReactElement => {
  const { onBackPress } = props
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const styles = createStyles({ theme })
  const appVersion = resolveAppVersion()

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable hitSlop={8} onPress={onBackPress} style={styles.backWrapper}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Image resizeMode="cover" source={require('@/assets/images/icon.png')} style={styles.appIcon} />
        <Text style={styles.appName}>Usage Pulse Mobile</Text>
        <Text style={styles.taglineText}>
          Live view of your Claude and z.ai coding-plan usage, straight from the Usage Pulse desktop app.
        </Text>
        {appVersion !== '' && <Text style={styles.versionText}>Version {appVersion}</Text>}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What it does</Text>
          <Text style={styles.sectionText}>
            Usage Pulse Mobile connects to the desktop app server on your local network and follows plan quotas, usage
            pace and running sessions in real time.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported providers</Text>
          <View style={styles.providerList}>
            {constant.about.providerCatalog.map((catalogEntry) => {
              return (
                <View key={catalogEntry.id} style={styles.provider}>
                  <Text style={styles.providerName}>{catalogEntry.name}</Text>
                  <Text style={styles.providerDescription}>{catalogEntry.description}</Text>
                </View>
              )
            })}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <Text style={styles.sectionText}>
            Access tokens stay in the desktop app. This mobile client talks only to your own desktop server over the
            local network, with no intermediary servers.
          </Text>
        </View>
        <View style={styles.section}>
          <BeecodeCredit />
        </View>
      </ScrollView>
    </View>
  )
}

const createStyles = (params: { theme: ThemePalette }) => {
  const { theme } = params
  return StyleSheet.create({
    appIcon: {
      borderColor: theme.hairline,
      borderRadius: 14,
      borderWidth: 1,
      height: 64,
      marginBottom: 12,
      width: 64,
    },
    appName: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '600',
    },
    backText: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: '600',
    },
    backWrapper: {
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    content: {
      gap: 10,
      padding: 16,
    },
    header: {
      alignItems: 'center',
      backgroundColor: theme.background,
      borderBottomColor: theme.hairline,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 10,
      paddingHorizontal: 16,
    },
    headerSpacer: {
      width: 38,
    },
    headerTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
    provider: {
      gap: 2,
    },
    providerDescription: {
      color: theme.muted,
      fontSize: 13,
    },
    providerList: {
      gap: 12,
    },
    providerName: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    screen: {
      backgroundColor: theme.background,
      flex: 1,
    },
    section: {
      borderTopColor: theme.hairline,
      borderTopWidth: 1,
      gap: 8,
      paddingTop: 16,
    },
    sectionText: {
      color: theme.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    taglineText: {
      color: theme.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    versionText: {
      color: theme.muted,
      fontSize: 13,
    },
  })
}
