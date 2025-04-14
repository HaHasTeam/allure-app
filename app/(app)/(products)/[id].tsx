/* eslint-disable react-hooks/exhaustive-deps */
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  TouchableWithoutFeedback
} from '@gorhom/bottom-sheet'
import React, { useCallback, useMemo } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'

import MyText from '@/components/common/MyText'
import { myTheme } from '@/constants'

interface ProductDetailScreenProps {
  initProductId?: string
  isInGroupBuying?: boolean
  bottomSheetModalRef?: React.RefObject<any>
  setIsModalVisible?: (visible: boolean) => void
}
const ProductDetailScreen = ({
  initProductId,
  isInGroupBuying = false,
  bottomSheetModalRef,
  setIsModalVisible
}: ProductDetailScreenProps) => {
  const snapPoints = useMemo(() => ['50%', '60%', '100%'], [])
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.9}
        onPress={() => bottomSheetModalRef?.current?.close()}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  )

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index)
  }, [])
  const handleModalDismiss = () => {
    bottomSheetModalRef?.current?.close()
    setIsModalVisible?.(false)
  }
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      onDismiss={handleModalDismiss}
      backdropComponent={renderBackdrop}
    >
      <TouchableWithoutFeedback onPress={handleModalDismiss}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <BottomSheetView style={styles.contentContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: '#FFF' }}
          keyboardVerticalOffset={100}
        >
          <MyText text='Update' />
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheetModal>
  )
}

export default ProductDetailScreen

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 25
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 1
  },
  listContainer: {
    flex: 1,
    marginVertical: 10
  },
  flatListContent: {
    paddingBottom: 20
  },
  addressItemContainer: {
    width: '100%',
    marginBottom: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: myTheme.primary
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: myTheme.primary
  },
  buttonText: {
    color: myTheme.white,
    fontWeight: 'bold'
  }
})
