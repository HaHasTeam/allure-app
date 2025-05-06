import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { Header, HeaderBackButton } from '@react-navigation/elements'
import * as Sentry from '@sentry/react-native'
import { Stack, useRouter } from 'expo-router'
import { Appearance, Platform, StatusBar, StyleSheet } from 'react-native'
import { View } from 'react-native-ui-lib'

import { myFontWeight } from '@/constants'
import { SessionProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import QueryProvider from '@/provider/QueryProvider'
// import { SessionProvider } from "@/contexts/AuthContext";
// import QueryProvider from "@/provider/QueryProvider";
// import { myFontWeight } from "@/contracts/constants";
// import { firebaseCloudMessaging } from "@/utils/firebase";

Sentry.init({
  dsn: 'https://ddf8cf26516f110dc974cd51e850ccd3@o4507213250166784.ingest.us.sentry.io/4507213253115904',

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
  // We recommend adjusting this value in production.
  // Learn more at
  // https://docs.sentry.io/platforms/react-native/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,
  // profilesSampleRate is relative to tracesSampleRate.
  // Here, we'll capture profiles for 100% of transactions.
  profilesSampleRate: 1.0
  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
})
// SplashScreen.preventAutoHideAsync();
export default Sentry.wrap(function Root() {
  const router = useRouter()

  const styles = StyleSheet.create({
    container: {
      flex: 1
    }
  })

  // setBackgroundMessageHandler(firebaseCloudMessaging, async (remoteMessage) => {
  //   console.log("Message handled in the background!", remoteMessage);
  // });

  return (
    <ActionSheetProvider>
      <View useSafeArea={Platform.OS === 'ios' || Platform.OS === 'android'} style={styles.container}>
        <StatusBar
          translucent={false}
          backgroundColor={Appearance.getColorScheme() === 'dark' ? 'black' : 'transparent'}
        />

        <QueryProvider>
          <SessionProvider>
            <ToastProvider>
              <Stack>
                <Stack.Screen
                  name='(app)'
                  options={{
                    headerShown: false
                  }}
                />
                <Stack.Screen
                  name='welcome'
                  options={{
                    title: '',
                    headerShown: false
                  }}
                />
                <Stack.Screen
                  name='login'
                  options={{
                    header: () => (
                      <Header
                        headerLeft={() => (
                          <HeaderBackButton
                            label='Quay lại'
                            labelStyle={{
                              fontFamily: myFontWeight.regular
                            }}
                            onPress={() => router.back()}
                          />
                        )}
                        title='Đăng nhập'
                        headerTitleStyle={{
                          fontFamily: myFontWeight.bold
                        }}
                      />
                    )
                  }}
                />
                <Stack.Screen
                  name='register'
                  options={{
                    header: () => (
                      <Header
                        title='Tạo tài khoản'
                        headerLeft={() => (
                          <HeaderBackButton
                            label='Quay lại'
                            labelStyle={{
                              fontFamily: myFontWeight.regular
                            }}
                            onPress={() => router.back()}
                          />
                        )}
                        headerTitleStyle={{
                          fontFamily: myFontWeight.bold
                        }}
                      />
                    )
                  }}
                />
                <Stack.Screen
                  name='verify'
                  options={{
                    header: () => (
                      <Header
                        title='Xác minh tài khoản'
                        headerTitleStyle={{
                          fontFamily: myFontWeight.bold
                        }}
                      />
                    )
                  }}
                />
              </Stack>
            </ToastProvider>
          </SessionProvider>
        </QueryProvider>
      </View>
    </ActionSheetProvider>
  )
})
