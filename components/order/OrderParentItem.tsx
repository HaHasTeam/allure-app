import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { getMasterConfigApi } from '@/hooks/api/master-config'
import { IOrder } from '@/types/order'
import { calculatePaymentCountdown } from '@/utils/order'

interface OrderParentItemProps {
  order: IOrder
  setIsTrigger: Dispatch<SetStateAction<boolean>>
}
const OrderParentItem = ({ order, setIsTrigger }: OrderParentItemProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const [openCancelParentOrderDialog, setOpenCancelParentOrderDialog] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const { data: masterConfig } = useQuery({
    queryKey: [getMasterConfigApi.queryKey],
    queryFn: getMasterConfigApi.fn
  })

  useEffect(() => {
    if (masterConfig && order) {
      setTimeLeft(calculatePaymentCountdown(order, masterConfig.data))
      const timer = setInterval(() => {
        setTimeLeft(calculatePaymentCountdown(order, masterConfig.data))
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [order, masterConfig])

  return (
    <View>
      <Text>OrderParentItem</Text>
    </View>
  )
}

export default OrderParentItem

const styles = StyleSheet.create({})
