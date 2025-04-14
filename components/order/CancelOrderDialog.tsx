import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import useHandleServerError from "@/hooks/useHandleServerError";

import AlertMessage from "../alert/AlertMessage";
import { getCancelOrderSchema } from "@/schema/order.schema";
import {
  cancelOrderApi,
  cancelParentOrderApi,
  getCancelAndReturnRequestApi,
  getParentOrderByIdApi,
} from "@/hooks/api/order";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  TouchableWithoutFeedback
} from '@gorhom/bottom-sheet'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Picker, PickerValue } from 'react-native-ui-lib'
import { z } from 'zod'

import AlertMessage from '../alert/AlertMessage'
import LoadingIcon from '../loading/LoadingIcon'

import { myTheme } from '@/constants'
import { useToast } from '@/contexts/ToastContext'
import { cancelOrderApi, getCancelAndReturnRequestApi } from '@/hooks/api/order'
import useHandleServerError from '@/hooks/useHandleServerError'
import { getCancelOrderSchema } from '@/schema/order.schema'

interface CancelOrderDialogProps {
  orderId: string;
  onOpenChange: (open: boolean) => void;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
  toggleModalVisibility: () => void;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  setIsTrigger: Dispatch<SetStateAction<boolean>>;
  isParent?: boolean;
}

export default function CancelOrderDialog({
  orderId,
  onOpenChange,
  setIsModalVisible,
  toggleModalVisibility,
  bottomSheetModalRef,
  setIsTrigger,
  isParent = false,
}: CancelOrderDialogProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const handleServerError = useHandleServerError()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isOtherReason, setIsOtherReason] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const CancelOrderSchema = getCancelOrderSchema()

  const reasons: { value: string }[] = useMemo(
    () => [
      { value: t('order.cancelOrderReason.changeOfMind') },
      { value: t('order.cancelOrderReason.foundCheaper') },
      { value: t('order.cancelOrderReason.voucherChange') },
      { value: t('order.cancelOrderReason.productChange') },
      { value: t('order.cancelOrderReason.paymentDifficulty') },
      { value: t('order.cancelOrderReason.addressChange') },
      { value: t('order.cancelOrderReason.deliveryIssue') },
      { value: t('order.cancelOrderReason.productIssue') },
      { value: t('order.cancelOrderReason.other') }
    ],
    [t]
  )
  const defaultOrderValues = {
    reason: '',
    otherReason: ''
  }
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<z.infer<typeof CancelOrderSchema>>({
    resolver: zodResolver(CancelOrderSchema),
    defaultValues: defaultOrderValues
  })
  const handleReset = () => {
    reset()
    handleModalDismiss()
    setIsOtherReason(false)
  }

  const { mutateAsync: cancelOrderFn } = useMutation({
    mutationKey: [cancelOrderApi.mutationKey],
    mutationFn: cancelOrderApi.fn,
    onSuccess: () => {
      showToast(t('order.cancelSuccess'), 'success', 4000)
      setIsTrigger((prev) => !prev)
      queryClient.invalidateQueries({
        queryKey: [getCancelAndReturnRequestApi.queryKey],
      });
      handleReset();
    },
  });
  const { mutateAsync: cancelParentOrderFn } = useMutation({
    mutationKey: [cancelParentOrderApi.mutationKey],
    mutationFn: cancelParentOrderApi.fn,
    onSuccess: () => {
      showToast(t("order.cancelSuccess"), "success", 4000);
      setIsTrigger((prev) => !prev);
      queryClient.invalidateQueries({
        queryKey: [getCancelAndReturnRequestApi.queryKey],
      });
      queryClient.invalidateQueries({
        queryKey: [getParentOrderByIdApi.queryKey],
      });
      handleReset();
    },
  });

  async function onSubmit(values: z.infer<typeof CancelOrderSchema>) {
    try {
      setIsLoading(true);
      const payload = isOtherReason
        ? { reason: values.otherReason }
        : { reason: values.reason };
      if (isParent) {
        await cancelParentOrderFn({ orderId, ...payload });
      } else {
        await cancelOrderFn({ orderId, ...payload });
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false)
      handleServerError({
        error
      })
    }
  }

  // bottom sheet for classification
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index)
  }, [])
  const handleModalDismiss = () => {
    bottomSheetModalRef.current?.close()
    setIsModalVisible(false)
  }

  const renderPickerValue = (value: PickerValue) => {
    return <Text style={styles.pickerText}>{value ? value : t('order.cancelOrderReason.selectAReason')}</Text>
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
        <Text style={styles.title}>{t(`order.cancelOrder`)}</Text>

        <AlertMessage
          style={styles.textJustify}
          message={t('order.cancelOrderDescription', { brand: '' })}
          textSize='medium'
        />

        <View style={styles.formField}>
          <Controller
            control={control}
            name='reason'
            render={({ field: { onChange, value } }) => (
              <View style={styles.selectContainer}>
                <View style={styles.labelContainer}>
                  <Text style={styles.textRed}>* </Text>
                  <Text style={styles.label}>{t('order.cancelOrderReason.reason')}</Text>
                </View>
                <Picker
                  value={value}
                  placeholder={t('order.cancelOrderReason.selectAReason')}
                  onChange={(newValue) => {
                    onChange(newValue)
                    setIsOtherReason(newValue === t('order.cancelOrderReason.other'))
                  }}
                  style={styles.picker}
                  containerStyle={styles.pickerContainer}
                  topBarProps={{ title: t('picker.reasons') }}
                  renderInput={() => renderPickerValue(value)}
                >
                  {reasons.map((reason, index) => (
                    <Picker.Item key={index} value={reason.value} label={reason.value} />
                  ))}
                </Picker>
                {errors.reason && <Text style={styles.error}>{errors.reason.message}</Text>}
              </View>
            )}
          />
        </View>
        {isOtherReason && (
          <View style={styles.formField}>
            <Controller
              control={control}
              name='otherReason'
              render={({ field: { onChange, value } }) => (
                <View style={styles.textAreaContainer}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.textRed}>* </Text>
                    <Text style={styles.label}>{t('order.cancelOrderReason.otherReason')}</Text>
                  </View>
                  <TextInput
                    style={styles.textArea}
                    onChangeText={onChange}
                    value={value}
                    placeholder={t('order.cancelOrderReason.enterReason')}
                    placeholderTextColor='grey'
                    multiline
                    numberOfLines={4}
                  />
                  {errors.otherReason && <Text style={styles.error}>{errors.otherReason.message}</Text>}
                </View>
              )}
            />
          </View>
        )}

        <View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonOutline}
              onPress={() => {
                onOpenChange(false)
                handleReset()
              }}
            >
              <Text style={styles.buttonOutlineText}>{t(`button.cancel`)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
              <Text style={styles.buttonText}>
                {isLoading ? <LoadingIcon color='white' size='small' /> : t(`button.ok`)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  pickerText: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 12
  },
  heading: {
    fontSize: 18
  },
  textJustify: {
    textAlign: 'justify'
  },
  overlay: {
    flex: 1
  },
  contentContainer: {
    padding: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  alert: {
    textAlign: 'justify'
  },
  formField: {
    marginTop: 12
  },
  selectContainer: {
    flexDirection: 'column'
  },
  textAreaContainer: {
    flexDirection: 'column'
  },
  textRed: {
    color: myTheme.destructive,
    fontWeight: 'bold'
  },
  labelContainer: {
    flexDirection: 'row'
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: 600
  },
  pickerContainer: {
    paddingVertical: 10
  },
  picker: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    borderRadius: 7,
    padding: 12
  },
  textArea: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    borderRadius: 7,
    padding: 12,
    height: 100,
    textAlignVertical: 'top'
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16
  },
  buttonOutline: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: myTheme.primary,
    borderRadius: 7
  },
  buttonPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: myTheme.primary,
    borderRadius: 7
  },
  buttonOutlineText: {
    color: myTheme.primary,
    textAlign: 'center',
    fontWeight: 600
  },
  buttonText: {
    color: myTheme.white,
    textAlign: 'center',
    fontWeight: 600
  }
})
