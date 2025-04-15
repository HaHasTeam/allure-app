import { Header } from '@react-navigation/elements'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import Result from '@/components/result/Result'
import { myTheme } from '@/constants'
import { ResultEnum } from '@/types/enum'

// interface ResultProps {
//   status: ResultEnum.SUCCESS | ResultEnum.FAILURE;
//   orderId: string;
// }
const ResultComponent = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { status } = useLocalSearchParams()
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          header: () => (
            <Header
              title={t('cart.result')}
              headerTitleStyle={{
                color: myTheme.primary,
                fontWeight: 'bold'
              }}
            />
          )
        }}
      />
      <View style={styles.contentContainer}>
        <Result
          status={status as ResultEnum}
          title={status === ResultEnum.SUCCESS ? t('order.success') : t('order.failure')}
          description={status === ResultEnum.SUCCESS ? t('order.successDescription') : t('order.failureDescription')}
          leftButtonAction={
            status === ResultEnum.SUCCESS
              ? () => router.replace(`/(app)/(profile)/orders/orderhistory`)
              : () => router.replace('/')
          }
          rightButtonAction={
            status === ResultEnum.SUCCESS
              ? () => router.replace('/')
              : () => router.replace(`/(app)/(profile)/orders/orderhistory`)
          }
          leftButtonText={status === ResultEnum.SUCCESS ? t('order.viewOrder') : t('order.continueShopping')}
          rightButtonText={status === ResultEnum.SUCCESS ? t('order.continueShopping') : t('order.tryAgain')}
        />
      </View>
    </View>
  )
}

export default ResultComponent

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myTheme.background
  },
  contentContainer: {
    flex: 1
  }
})
