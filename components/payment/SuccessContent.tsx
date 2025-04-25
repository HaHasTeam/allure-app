import { Feather } from '@expo/vector-icons'
import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { Colors } from 'react-native-ui-lib'

const SuccessContent = () => {
  // Create animated value for pulse effect
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Create pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start()
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <Animated.View style={[styles.pulseCircleLarge, { transform: [{ scale: pulseAnim }] }]} />
        <View style={styles.decorCircleSmall1} />
        <View style={styles.decorCircleSmall2} />

        <View style={styles.checkCircle}>
          <Feather name='check' size={48} color='#10b981' />
        </View>
      </View>

      <Text style={styles.title}>Success!</Text>

      <Text style={styles.message}>
        Your transaction has been successfully processed. Refresh wallet balance to see the changes.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingVertical: 40
  },
  animationContainer: {
    position: 'relative',
    height: 96,
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32
  },
  pulseCircleLarge: {
    position: 'absolute',
    top: -32,
    left: -32,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Light green with opacity
    borderRadius: 64
  },
  decorCircleSmall1: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 16,
    height: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.2)', // Light green with opacity
    borderRadius: 8
  },
  decorCircleSmall2: {
    position: 'absolute',
    bottom: -16,
    left: 48,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.2)', // Light green with opacity
    borderRadius: 12
  },
  checkCircle: {
    position: 'relative',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Light green with opacity
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.textColor,
    marginBottom: 16,
    zIndex: 20
  },
  message: {
    textAlign: 'center',
    color: Colors.grey40,
    maxWidth: 300,
    lineHeight: 22
  }
})

export default SuccessContent
