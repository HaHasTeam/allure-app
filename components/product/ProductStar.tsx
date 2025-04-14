import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Rating } from 'react-native-ratings'

interface ProductStarProps {
  rating: number
  ratingAmount: number
}

const ProductStar = ({ rating, ratingAmount }: ProductStarProps) => {
  return (
    <View>
      <View style={styles.container}>
        <Rating showRating={false} fractions={2} startingValue={rating} imageSize={12} readonly />
        {/* <Rating ratingCount={rating} imageSize={12} readonly /> */}
        <MaterialIcons name='keyboard-arrow-down' size={11} color='black' />
        <Text style={styles.text}>({ratingAmount})</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '100%'
  },
  text: {
    fontSize: 14,
    color: 'black'
  }
})

export default ProductStar
