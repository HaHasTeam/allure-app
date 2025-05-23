import { FontAwesome5 } from '@expo/vector-icons'
import Feather from '@expo/vector-icons/Feather'
import { Header } from '@react-navigation/elements'
import { useQueryClient } from '@tanstack/react-query'
import { Tabs } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageBackground, StyleSheet } from 'react-native'
import { Avatar, View } from 'react-native-ui-lib'

import { myDeviceWidth, myFontWeight, myTheme, width } from '../../../constants/index'

import MyText from '@/components/common/MyText'
import ShopHeader from '@/components/header/ShopHeader'
import useUser from '@/hooks/api/useUser'
import { TUserPa } from '@/types/user'
import { getActiveLiveStreamApi } from '@/hooks/api/livestream'

export default function TabLayout() {
  const { t } = useTranslation()
  const { getProfile } = useUser()
  const queryClient = useQueryClient()
  const [user, setUser] = useState<TUserPa>({
    email: '',
    id: '',
    username: '',
    avatar: '',
    phone: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    role: '',
    status: '',
    isEmailVerify: false,
    password: ''
  })
  const style = StyleSheet.create({
    iconContainer: {
      padding: 5,
      borderRadius: 15
    }
  })

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: myTheme.primary,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 65,
          backgroundColor: '#FFF'
        },
        tabBarIconStyle: {
          margin: 5
        },
        tabBarItemStyle: {
          borderRadius: 15
        },
        tabBarHideOnKeyboard: true
      }}
    >
      <Tabs.Screen
        name='index'
        listeners={{
          focus: async () => {
            const data = await getProfile()
            if (data && typeof data !== 'string') setUser(data)
          }
        }}
        options={{
          title: 'Home',
          header: () => (
            <ShopHeader
              cartItemCount={3} // Replace with your actual cart count
              notificationCount={5} // Replace with your actual notification count
            />
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={[style.iconContainer, focused && { backgroundColor: myTheme.lighter }]}>
              <Feather size={width <= myDeviceWidth.sm ? 21 : 25} name='home' color={color} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name='explore'
        options={{
          headerShown: false,
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={[style.iconContainer, focused && { backgroundColor: myTheme.lighter }]}>
              <Feather size={width <= myDeviceWidth.sm ? 21 : 25} name='search' color={color} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name='live'
        listeners={{
          focus: async () => {
            await queryClient.invalidateQueries({ queryKey: [getActiveLiveStreamApi.queryKey] })
          }
        }}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={[style.iconContainer, focused && { backgroundColor: myTheme.lighter }]}>
              <FontAwesome5 size={width <= myDeviceWidth.sm ? 21 : 25} name='video' color={color} solid />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name='cart'
        options={{
          header: () => (
            <Header
              title={t('cart.title')}
              headerTitleStyle={{
                color: myTheme.primary,
                fontFamily: myFontWeight.bold,
                fontWeight: 'bold'
              }}
            />
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={[style.iconContainer, focused && { backgroundColor: myTheme.lighter }]}>
              <Feather size={width <= myDeviceWidth.sm ? 21 : 25} name='shopping-cart' color={color} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name='profile'
        listeners={{
          focus: async () => {
            const data = await getProfile()
            if (data && typeof data !== 'string') setUser(data)
          }
        }}
        options={{
          title: 'Profile',
          header: () => (
            <ImageBackground
              source={require('@/assets/images/profile-background.jpg')}
              resizeMode='cover'
              borderBottomLeftRadius={40}
              borderBottomRightRadius={40}
              style={{
                flexDirection: 'column',
                paddingBottom: 24,
                marginTop: -35
              }}
            >
              <Header
                title='Trang cá nhân'
                headerStyle={{
                  borderBottomLeftRadius: 40,
                  borderBottomRightRadius: 40,
                  backgroundColor: 'transparent',
                  height: 100
                }}
                headerTitleAlign='left'
                headerTitleStyle={{
                  fontFamily: myFontWeight.bold,
                  color: '#FFF',
                  paddingTop: 25
                }}
              />
              <Avatar
                size={80}
                containerStyle={{
                  alignSelf: 'center'
                }}
                source={
                  user.avatar
                    ? { uri: user.avatar.replace('http://', 'https://') }
                    : require('@/assets/images/no_avatar.png')
                }
              />
              <MyText
                styleProps={{
                  alignSelf: 'center',
                  fontSize: 16,
                  fontFamily: myFontWeight.bold,
                  color: '#FFF'
                }}
                text={user.email || ''}
              />
              {/* <MyText
                styleProps={{
                  alignSelf: "center",
                  color: "#FFF",
                }}
                text={user.email}
              /> */}
            </ImageBackground>
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={[style.iconContainer, focused && { backgroundColor: myTheme.lighter }]}>
              <Feather size={width <= myDeviceWidth.sm ? 21 : 25} name='user' color={color} />
            </View>
          )
        }}
      />
    </Tabs>
  )
}
