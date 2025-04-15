/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  TouchableWithoutFeedback
} from '@gorhom/bottom-sheet'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dispatch, SetStateAction, useCallback, useId, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View, ScrollView, Text, ActivityIndicator } from 'react-native'
import { z } from 'zod'

import FormAddressContent from './FormAddressContent'
import LoadingIcon from '../loading/LoadingIcon'

import { myTheme } from '@/constants'
import { useToast } from '@/contexts/ToastContext'
import { getAddressByIdApi, getMyAddressesApi, updateAddressApi } from '@/hooks/api/address'
import useHandleServerError from '@/hooks/useHandleServerError'
import { getCreateAddressSchema } from '@/schema/address.schema'
import { IAddress } from '@/types/address'
import { AddressEnum } from '@/types/enum'

interface UpdateAddressDialogProps {
  setIsModalVisible: Dispatch<SetStateAction<boolean>>
  bottomSheetModalRef: React.RefObject<BottomSheetModal>
  address: IAddress
  toggleModalVisible: () => void
}
const UpdateAddressDialog = ({
  address,
  setIsModalVisible,
  bottomSheetModalRef,
  toggleModalVisible
}: UpdateAddressDialogProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const id = useId()
  const { showToast } = useToast()
  const handleServerError = useHandleServerError()
  const queryClient = useQueryClient()
  const CreateAddressSchema = getCreateAddressSchema()
  const snapPoints = useMemo(() => ['60%', '100%'], [])
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.9}
        onPress={() => bottomSheetModalRef.current?.close()}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  )

  const defaultValues = {
    fullName: address?.fullName ?? '',
    phone: address?.phone ?? '',
    detailAddress: address?.detailAddress ?? '',
    ward: address?.ward ?? '',
    district: address?.district ?? '',
    province: address?.province ?? '',
    fullAddress: address?.fullAddress ?? '',
    type: address?.type ?? AddressEnum?.HOME,
    notes: address?.notes ?? '',
    isDefault: address?.isDefault ?? false
  }
  console.log(defaultValues)

  // const form = useForm<z.infer<typeof CreateAddressSchema>>({
  //   resolver: zodResolver(CreateAddressSchema),
  //   defaultValues,
  // });
  const {
    control,
    handleSubmit,
    resetField,
    reset,
    watch,
    formState: { errors }
  } = useForm<z.infer<typeof CreateAddressSchema>>({
    resolver: zodResolver(CreateAddressSchema),
    defaultValues
  })
  const handleReset = () => {
    setOpen(false)
  }
  const { mutateAsync: updateAddressFn } = useMutation({
    mutationKey: [updateAddressApi.mutationKey],
    mutationFn: updateAddressApi.fn,
    onSuccess: () => {
      showToast(`${t('address.updateSuccess')}`, 'success', 4000)
      queryClient.invalidateQueries({
        queryKey: [getAddressByIdApi.queryKey, address?.id as string]
      })
      queryClient.invalidateQueries({
        queryKey: [getMyAddressesApi.queryKey]
      })
      handleReset()
      toggleModalVisible()
    }
  })
  async function onSubmit(values: z.infer<typeof CreateAddressSchema>) {
    try {
      console.log('testAllure', values)
      setIsLoading(true)
      const transformedValues = {
        ...values,
        id: address?.id ?? '',
        fullAddress: `${values.detailAddress}, ${values.ward}, ${values.district}, ${values.province}`
      }

      console.log(transformedValues)
      await updateAddressFn(transformedValues)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      handleServerError({
        error
      })
    }
  }
  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index)
  }, [])
  const handleModalDismiss = () => {
    bottomSheetModalRef.current?.close()
    setIsModalVisible(false)
  }

  return (
    <View>
      {isLoading && <ActivityIndicator color={myTheme.primary} size='small' />}

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
          <Text style={styles.title}>{t('address.updateAddress')}</Text>
          {/* Form Address */}
          <ScrollView style={styles.listContainer}>
            <FormAddressContent
              control={control}
              errors={errors}
              watch={watch}
              resetField={resetField}
              initialAddress={defaultValues}
            />
          </ScrollView>

          <View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={() => {
                  toggleModalVisible()
                  reset(defaultValues)
                }}
              >
                <Text style={styles.buttonOutlineText}>{t('dialog.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                {isLoading ? (
                  <LoadingIcon color='primaryBackground' />
                ) : (
                  <Text style={styles.buttonText}>{t('dialog.ok')} </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  )
}

export default UpdateAddressDialog

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
    backgroundColor: myTheme.primary,
    borderColor: myTheme.primary
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: myTheme.primary
  },
  buttonText: {
    color: myTheme.white,
    fontWeight: 'bold'
  },
  buttonOutlineText: {
    color: myTheme.primary,
    fontWeight: 'bold'
  }
})
