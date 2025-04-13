import { Stack } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import LanguageSwitcher from '@/components/LanguageSwitcher'

const LanguageSwitcherScreen = () => {
  const { t } = useTranslation()
  return (
    <View>
      <Stack.Screen options={{ title: t('language.title') }} />
      <LanguageSwitcher />
    </View>
  )
}

export default LanguageSwitcherScreen
