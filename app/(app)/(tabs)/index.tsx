import '@/i18n/i18n'

import React from 'react'
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import BeautyOffers from '@/components/home/BeautyOffers'
import FlashSale from '@/components/home/FlashSale'
import HomeBanner from '@/components/home/HomeBanner'
import PreOrderProductSections from '@/components/home/PreOrderProductSection'
import RecommendProduct from '@/components/home/RecommendProduct'

export default function HomeScreen() {
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: '#FFF' }}
          keyboardVerticalOffset={100}
        >
          <FlatList
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={
              <>
                <HomeBanner />
                <BeautyOffers />
                <FlashSale />
                <PreOrderProductSections />
                <RecommendProduct />
              </>
            }
            keyExtractor={(item, index) => index.toString()}
          />
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </>
  )
}
