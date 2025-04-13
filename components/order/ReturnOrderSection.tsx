import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { ReturnOrderDialog } from './ReturnOrderDialog'
import AlertMessage from '../alert/AlertMessage'

import { myTheme } from '@/constants'

const ReturnOrderSection = ({
  orderId,
  pendingCustomerShippingReturnTime
}: {
  orderId: string
  pendingCustomerShippingReturnTime: number
}) => {
  const { t } = useTranslation()
  const [openDialog, setOpenDialog] = useState(false)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const toggleModalVisibility = () => {
    if (openDialog) {
      bottomSheetModalRef.current?.close() // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present() // Open modal if it's not visible
    }
    setOpenDialog(!openDialog) // Toggle the state
  }
  return (
    <View>
      <AlertMessage
        title={t('order.returnRequestApprovedTitle')}
        message={t('order.returnRequestApprovedMessage', {
          count: pendingCustomerShippingReturnTime
        })}
        isShowIcon={false}
        color='success'
        buttonText='upload'
        onPress={() => setOpenDialog(true)}
        style={{ backgroundColor: myTheme.green[600] }}
      />
      <ReturnOrderDialog
        orderId={orderId}
        bottomSheetModalRef={bottomSheetModalRef}
        setIsModalVisible={setOpenDialog}
        toggleModalVisibility={toggleModalVisibility}
      />
    </View>
  )
}

export default ReturnOrderSection
