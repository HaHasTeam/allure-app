import { StyleSheet, Text, View } from 'react-native'

export const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <Text style={styles.value}>{String(value).padStart(2, '0')}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  card: {
    width: '25%',
    minWidth: 48, // Approximation for `xs:w-12`
    maxWidth: 56, // Approximation for `sm:w-14`
    backgroundColor: '#fff', // Adjust based on theme
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, // For Android shadow
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5
  },
  cardContent: {
    alignItems: 'center'
  },
  value: {
    fontSize: 16, // Approximation for `sm:text-lg`
    fontWeight: 'bold'
  },
  label: {
    fontSize: 10, // Approximation for `sm:text-[10px]`
    color: '#666' // Equivalent to `text-muted-foreground`
  }
})
