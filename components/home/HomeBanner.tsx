import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { Carousel, Spacings } from 'react-native-ui-lib'

import ImageWithFallback from '../image/ImageWithFallBack'

import { getMasterConfigApi } from '@/hooks/api/master-config'
import { TServerFile } from '@/types/file'

const HomeBanner = () => {
  const { data: masterConfig } = useQuery({
    queryKey: [getMasterConfigApi.queryKey],
    queryFn: getMasterConfigApi.fn
  })
  console.log('masterConfig?.data[0]', masterConfig?.data[0])

  return (
    <View style={styles.container}>
      <Carousel
        autoplay
        pageWidth={styles.carousel.width - Spacings.s5 * 2}
        itemSpacings={8}
        containerMarginHorizontal={0}
        initialPage={2}
        containerStyle={styles.carouselContainer}
        pageControlPosition={Carousel.pageControlPositions.UNDER}
      >
        {masterConfig?.data[0]?.banners.map((banner: TServerFile, index: number) => (
          <View key={banner.id} style={styles.page}>
            <ImageWithFallback
              source={{ uri: banner.fileUrl ?? '' }}
              style={styles.image}
              // resizeMode="cover"
            />
          </View>
        ))}
      </Carousel>
    </View>
  )
}

export default HomeBanner

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
  },
  carousel: {
    width: Dimensions.get('window').width
  },
  carouselContainer: {
    position: 'relative',
    height: 210
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
    flex: 1
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
    borderRadius: 4,
    flex: 1,
    overflow: 'hidden'
  }
})
