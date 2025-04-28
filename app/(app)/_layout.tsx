import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Header, HeaderBackButton } from '@react-navigation/elements'
import { Redirect, Stack, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Appearance, StatusBar, ActivityIndicator, View, Text } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { myFontWeight, myTheme } from '@/constants'
import { useSession } from '@/contexts/AuthContext'
function AppLayout() {
  const { accessToken } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      // Add a small delay to prevent flash of loading screen
      await new Promise((resolve) => setTimeout(resolve, 100))
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color={myTheme.primary} />
        <Text style={{ marginTop: 10, fontFamily: myFontWeight.regular }}>Đang tải...</Text>
      </View>
    )
  }

  // If not authenticated, redirect to welcome/login screen
  if (!accessToken) {
    return <Redirect href='/welcome' />
  }
  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <StatusBar
          translucent={false}
          backgroundColor={Appearance.getColorScheme() === 'dark' ? 'black' : 'transparent'}
        />
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />

          <Stack.Screen
            name='(profile)/editprofile'
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
                  title='Cập nhật tài khoản'
                  headerTitleStyle={{
                    fontFamily: myFontWeight.bold
                  }}
                />
              )
            }}
          />

          <Stack.Screen
            name='(profile)/updatepassword'
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
                  title='Cập nhật Mật Khẩu'
                  headerTitleStyle={{
                    fontFamily: myFontWeight.bold
                  }}
                />
              )
            }}
          />
          <Stack.Screen
            name='(products)/product-detail/[productId]'
            options={{
              headerShown: false
            }}
          />

          <Stack.Screen
            name='(profile)/contact'
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
                  title='Liên hệ'
                  headerTitleStyle={{
                    fontFamily: myFontWeight.bold
                  }}
                />
              )
            }}
          />

          <Stack.Screen
            name='(language)/languageswitcher'
            options={{
              headerShown: false
            }}
          />

          <Stack.Screen
            name='(home)/notifications'
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
                  title='Thông báo'
                  headerTitleStyle={{
                    fontFamily: myFontWeight.bold
                  }}
                />
              )
            }}
          />
          <Stack.Screen
            name='(livestream)/viewer-stream'
            options={{
              headerShown: false
            }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}

export default AppLayout
