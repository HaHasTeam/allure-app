import AsyncStorage from "@react-native-async-storage/async-storage";
import { Header, HeaderBackButton } from "@react-navigation/elements";
import { Redirect, Stack, useGlobalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Appearance, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useSession } from "@/contexts/AuthContext";
import { myFontWeight } from "@/constants";

function AppLayout() {
  const { accessToken } = useSession();
  const router = useRouter();
  const { title } = useGlobalSearchParams<{ title: string }>();

  return (
    <GestureHandlerRootView>
      <StatusBar
        translucent={false}
        backgroundColor={
          Appearance.getColorScheme() === "dark" ? "black" : "transparent"
        }
      />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(profile)/editprofile"
          options={{
            header: () => (
              <Header
                headerLeft={() => (
                  <HeaderBackButton
                    label="Quay lại"
                    labelStyle={{
                      fontFamily: myFontWeight.regular,
                    }}
                    onPress={() => router.back()}
                  />
                )}
                title="Cập nhật tài khoản"
                headerTitleStyle={{
                  fontFamily: myFontWeight.bold,
                }}
              />
            ),
          }}
        />

        <Stack.Screen
          name="(profile)/updatepassword"
          options={{
            header: () => (
              <Header
                headerLeft={() => (
                  <HeaderBackButton
                    label="Quay lại"
                    labelStyle={{
                      fontFamily: myFontWeight.regular,
                    }}
                    onPress={() => router.back()}
                  />
                )}
                title="Cập nhật Mật Khẩu"
                headerTitleStyle={{
                  fontFamily: myFontWeight.bold,
                }}
              />
            ),
          }}
        />

        <Stack.Screen
          name="(profile)/contact"
          options={{
            header: () => (
              <Header
                headerLeft={() => (
                  <HeaderBackButton
                    label="Quay lại"
                    labelStyle={{
                      fontFamily: myFontWeight.regular,
                    }}
                    onPress={() => router.back()}
                  />
                )}
                title="Liên hệ"
                headerTitleStyle={{
                  fontFamily: myFontWeight.bold,
                }}
              />
            ),
          }}
        />
        <Stack.Screen
          name="(home)/notifications"
          options={{
            header: () => (
              <Header
                headerLeft={() => (
                  <HeaderBackButton
                    label="Quay lại"
                    labelStyle={{
                      fontFamily: myFontWeight.regular,
                    }}
                    onPress={() => router.back()}
                  />
                )}
                title="Thông báo"
                headerTitleStyle={{
                  fontFamily: myFontWeight.bold,
                }}
              />
            ),
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default AppLayout;
