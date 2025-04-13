import { StyleSheet, Text, View } from 'react-native'

import { TimeUnit } from './UnitTime'

import { useCountdown } from '@/hooks/useCountDown'

interface CountdownProps {
  targetDate: string
  language?: 'en' | 'vi'
}

const labels = {
  en: {
    days: 'days',
    hours: 'hrs',
    minutes: 'min',
    seconds: 'sec'
  },
  vi: {
    days: 'ngày',
    hours: 'giờ',
    minutes: 'phút',
    seconds: 'giây'
  }
}

export function Countdown({ targetDate, language = 'en' }: CountdownProps) {
  const timeLeft = useCountdown(targetDate)

  return (
    <View style={styles.container}>
      <TimeUnit value={timeLeft.days} label={labels[language].days} />
      <Text style={styles.separator}>:</Text>
      <TimeUnit value={timeLeft.hours} label={labels[language].hours} />
      <Text style={styles.separator}>:</Text>
      <TimeUnit value={timeLeft.minutes} label={labels[language].minutes} />
      <Text style={styles.separator}>:</Text>
      <TimeUnit value={timeLeft.seconds} label={labels[language].seconds} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%'
  },
  separator: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 4
  }
})
