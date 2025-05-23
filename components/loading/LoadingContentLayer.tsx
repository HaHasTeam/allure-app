import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Animated, StyleSheet, ActivityIndicator, Text } from 'react-native'

import { myFontWeight, myTheme } from '@/constants'
import { hexToRgba } from '@/utils/color'

type Props = {
  label?: string
  style?: object
}

const LoadingContentLayer: React.FC<Props> = ({ label, style }) => {
  const { t } = useTranslation()
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start()
  }, [fadeAnim])

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size='large' color={myTheme.primary} />
      <Text style={{ marginTop: 10, fontFamily: myFontWeight.regular }}>{label ? label : t('loading') + '...'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: hexToRgba(myTheme.primary, 0.1),
    zIndex: 10,
    flex: 1
  }
})

export default LoadingContentLayer
