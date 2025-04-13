import { Link, RelativePathString } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableOpacity, Image, StyleSheet, ImageProps } from 'react-native'

import { myTheme } from '@/constants'

const GroupBuyingImg = require('@/assets/images/group-buying.jpg')
const PreOrdersImg = require('@/assets/images/pre-orders.jpg')
interface OfferCardProps {
  title: string
  imgSrc: ImageProps
  linkTo: string
  buttonText: string
}

const OfferCard = ({ title, imgSrc, linkTo, buttonText }: OfferCardProps) => (
  <Link href={linkTo as RelativePathString} asChild>
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{title}</Text>
        <Image source={imgSrc} style={styles.image} resizeMode='contain' />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Link>
)

const BeautyOffers = () => {
  const { t } = useTranslation()
  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('home.exclusiveBeautyOffersTitle')}</Text>
      <View style={styles.cardContainer}>
        <OfferCard
          title={t('home.preOderCardTitle')}
          imgSrc={PreOrdersImg}
          linkTo='/products/pre-orders'
          buttonText={t('button.preOderAction')}
        />
        <OfferCard
          title={t('home.groupBuyingDealsCardTitle')}
          imgSrc={GroupBuyingImg}
          linkTo='/products/group-buying'
          buttonText={t('button.groupBuyingAction')}
        />
      </View>
    </View>
  )
}

export default BeautyOffers

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 6,
    paddingBottom: 16
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: myTheme.primary
  },
  cardContainer: {
    gap: 12
  },
  card: {
    backgroundColor: myTheme.white,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  cardContent: {
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  image: {
    width: '100%',
    height: 160
  },
  button: {
    backgroundColor: myTheme.primary,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
    width: '100%'
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  }
})
