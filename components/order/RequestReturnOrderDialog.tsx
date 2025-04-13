import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
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
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native'
import { Picker, PickerValue, TextField } from 'react-native-ui-lib'
import { z } from 'zod'

import AlertMessage from '../alert/AlertMessage'
import MyText from '../common/MyText'
import UploadMediaFiles from '../file-input/UploadMediaFiles'
import { VideoThumbnail } from '../file-input/VideoThumbnail'

import { myTheme } from '@/constants'
import { useToast } from '@/contexts/ToastContext'
import { uploadFilesApi } from '@/hooks/api/file'
import {
  getCancelAndReturnRequestApi,
  getOrderByIdApi,
  getStatusTrackingByIdApi,
  requestReturnOrderApi
} from '@/hooks/api/order'
import useHandleServerError from '@/hooks/useHandleServerError'
import { getRequestReturnOrderSchema } from '@/schema/order.schema'
import { hexToRgba } from '@/utils/color'

interface RequestReturnOrderDialogProps {
  orderId: string
  setIsTrigger: Dispatch<SetStateAction<boolean>>
  setIsModalVisible: Dispatch<SetStateAction<boolean>>
  toggleModalVisibility: () => void
  bottomSheetModalRef: React.RefObject<BottomSheetModal>
}

export const RequestReturnOrderDialog: React.FC<RequestReturnOrderDialogProps> = ({
  orderId,
  setIsTrigger,
  setIsModalVisible,
  toggleModalVisibility,
  bottomSheetModalRef
}) => {
  const MAX_IMAGES = 4
  const MAX_VIDEOS = 1
  // const MAX_FILES = MAX_IMAGES + MAX_VIDEOS
  const MAX_SIZE_NUMBER = 10
  const MAX_SIZE = MAX_SIZE_NUMBER * 1024 * 1024
  const REQUEST_RETURN_ORDER_PROCESS_DATE = 2

  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { showToast } = useToast()
  const handleServerError = useHandleServerError()
  const queryClient = useQueryClient()

  const ReturnOrderSchema = getRequestReturnOrderSchema()
  const [isOtherReason, setIsOtherReason] = useState<boolean>(false)

  // bottom sheet for classification
  const snapPoints = useMemo(() => ['50%', '60%', '100%'], [])
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

  const reasons: { value: string }[] = useMemo(
    () => [
      { value: t('order.returnOrderReason.wrongItem') },
      { value: t('order.returnOrderReason.damage') },
      { value: t('order.returnOrderReason.missingItem') },
      { value: t('order.returnOrderReason.expired') },
      { value: t('order.returnOrderReason.allergy') },
      { value: t('order.returnOrderReason.notAsDescribed') },
      { value: t('order.returnOrderReason.duplicate') },
      { value: t('order.returnOrderReason.other') }
    ],
    [t]
  )

  const defaultValues = {
    reason: '',
    otherReason: '',
    mediaFiles: [],
    videos: [],
    images: []
  }
  const {
    control,
    handleSubmit,

    reset
  } = useForm<z.infer<typeof ReturnOrderSchema>>({
    resolver: zodResolver(ReturnOrderSchema),
    defaultValues
  })
  const handleReset = () => {
    reset()
    setIsOtherReason(false)
    handleModalDismiss()
  }

  const { mutateAsync: requestReturnOrderFn } = useMutation({
    mutationKey: [requestReturnOrderApi.mutationKey],
    mutationFn: requestReturnOrderApi.fn,
    onSuccess: async () => {
      showToast(
        t('order.returnOrderDialog.successDescription', {
          count: REQUEST_RETURN_ORDER_PROCESS_DATE
        }),
        'success',
        4000
      )
      setIsTrigger((prev) => !prev)
      handleReset()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [getOrderByIdApi.queryKey] }),
        queryClient.invalidateQueries({
          queryKey: [getStatusTrackingByIdApi.queryKey]
        }),
        queryClient.invalidateQueries({
          queryKey: [getCancelAndReturnRequestApi.queryKey]
        })
      ])
    }
  })

  const { mutateAsync: uploadFilesFn } = useMutation({
    mutationKey: [uploadFilesApi.mutationKey],
    mutationFn: uploadFilesApi.fn
  })

  const convertFileToUrl = async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    const uploadedFilesResponse = await uploadFilesFn(formData)

    return uploadedFilesResponse.data
  }

  const onSubmit = async (values: z.infer<typeof ReturnOrderSchema>) => {
    try {
      setIsLoading(true)
      console.log(isLoading)
      const imgUrls = values.images ? await convertFileToUrl(values.images) : []
      const videoUrls = values.videos ? await convertFileToUrl(values.videos) : []
      const payload = isOtherReason ? { reason: values.otherReason } : { reason: values.reason }

      await requestReturnOrderFn({
        orderId,
        ...payload,
        mediaFiles: [...imgUrls, ...videoUrls]
      })
      setIsLoading(false)
      console.log(isLoading)
    } catch (error) {
      setIsLoading(false)
      console.log(isLoading)
      handleServerError({
        error
      })
    }
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
        <Text style={styles.heading}>{t('order.returnOrderDialog.title')}</Text>

        <ScrollView>
          <AlertMessage
            style={styles.textJustify}
            message={t('order.returnOrderDialog.description')}
            textSize='medium'
          />
          <View style={styles.formField}>
            <View style={styles.fieldRow}>
              <View style={styles.labelContainer}>
                <MyText text={t('order.cancelOrderReason.reason')} styleProps={styles.labelText} required />
              </View>
              <View style={styles.inputContainer}>
                <Controller
                  control={control}
                  name='reason'
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <View>
                      <Picker
                        value={value ?? ''}
                        placeholder={t('order.cancelOrderReason.selectAReason')}
                        onChange={(value: PickerValue) => {
                          onChange(value)
                          setIsOtherReason(value === t('order.returnOrderReason.other'))
                        }}
                      >
                        {reasons.map((reason, index) => (
                          <Picker.Item key={index} value={reason.value} label={reason.value} />
                        ))}
                      </Picker>
                      {error && <MyText text={error?.message || ''} styleProps={styles.errorText} />}
                    </View>
                  )}
                />
              </View>
            </View>
          </View>

          {isOtherReason && (
            <View style={styles.formField}>
              <View style={styles.fieldRow}>
                <View style={styles.labelContainer}>
                  <MyText text={t('order.cancelOrderReason.otherReason')} styleProps={styles.labelText} required />
                </View>
                <View style={styles.inputContainer}>
                  <Controller
                    control={control}
                    name='otherReason'
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <View>
                        <TextField
                          multiline
                          numberOfLines={4}
                          style={styles.textArea}
                          placeholder={t('order.cancelOrderReason.enterReason')}
                          value={value ?? ''}
                          onChangeText={onChange}
                        />
                        {error && <MyText text={error?.message || ''} styleProps={styles.errorText} />}
                      </View>
                    )}
                  />
                </View>
              </View>
            </View>
          )}

          {/* media */}
          <View style={styles.mediaSection}>
            <MyText text={t('feedback.mediaFiles')} styleProps={styles.sectionTitle} required />
            <MyText text={t('order.returnOrderDialog.mediaFilesNotes')} styleProps={styles.descriptionText} />
            <MyText
              text={t('feedback.mediaFilesHint', {
                videoCount: MAX_VIDEOS,
                imageCount: MAX_IMAGES,
                size: MAX_SIZE_NUMBER,
                format: 'mp4/wmv/mov/avi/mkv/flv/jpg/jpeg/png'.toLocaleUpperCase()
              })}
              styleProps={styles.descriptionText}
            />
          </View>

          <View style={styles.mediaUploadSection}>
            <Controller
              control={control}
              name='videos'
              render={({ field, fieldState: { error } }) => (
                <View style={styles.uploadField}>
                  <MyText text={t('feedback.uploadVideos')} styleProps={styles.uploadLabel} required />
                  <UploadMediaFiles
                    field={field}
                    vertical={false}
                    isAcceptImage={false}
                    isAcceptVideo
                    maxImages={MAX_IMAGES}
                    maxVideos={MAX_VIDEOS}
                    dropZoneConfigOptions={{
                      maxFiles: MAX_VIDEOS,
                      maxSize: MAX_SIZE
                    }}
                    renderFileItemUI={(file) => (
                      <View key={file.name} style={styles.fileItem}>
                        {file.type.includes('image') ? (
                          <Image
                            source={{ uri: URL.createObjectURL(file) }}
                            style={styles.filePreview}
                            onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                          />
                        ) : file.type.includes('video') ? (
                          <VideoThumbnail file={file} />
                        ) : (
                          <View style={styles.fileIconContainer}>
                            <Feather name='file' size={48} color={myTheme.mutedForeground} />
                          </View>
                        )}
                      </View>
                    )}
                    renderInputUI={(_isDragActive, files, maxFiles) => (
                      <View style={styles.uploadContainer}>
                        <Feather name='video' size={32} color={myTheme.primary} />
                        <Text style={styles.uploadCount}>
                          {files.length}/{maxFiles} {t('media.videosFile')}
                        </Text>
                      </View>
                    )}
                  />
                  {error && <MyText text={error?.message || ''} styleProps={styles.errorText} />}
                </View>
              )}
            />

            <Controller
              control={control}
              name='images'
              render={({ field, fieldState: { error } }) => (
                <View style={styles.uploadField}>
                  <MyText text={t('feedback.uploadImages')} styleProps={styles.uploadLabel} required />
                  <UploadMediaFiles
                    field={field}
                    vertical={false}
                    isAcceptImage
                    isAcceptVideo={false}
                    maxImages={MAX_IMAGES}
                    maxVideos={MAX_VIDEOS}
                    dropZoneConfigOptions={{
                      maxFiles: MAX_IMAGES,
                      maxSize: MAX_SIZE
                    }}
                    renderFileItemUI={(file) => (
                      <View key={file.name} style={styles.fileItem}>
                        {file.type.includes('image') ? (
                          <Image
                            source={{ uri: URL.createObjectURL(file) }}
                            style={styles.filePreview}
                            onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                          />
                        ) : file.type.includes('video') ? (
                          <VideoThumbnail file={file} />
                        ) : (
                          <View style={styles.fileIconContainer}>
                            <Feather name='file' size={48} color={myTheme.mutedForeground} />
                          </View>
                        )}
                      </View>
                    )}
                    renderInputUI={(_isDragActive, files, maxFiles) => (
                      <View style={styles.uploadContainer}>
                        <MaterialCommunityIcons name='file-image-plus' size={32} color={myTheme.primary} />
                        <Text style={styles.uploadCount}>
                          {files.length}/{maxFiles} {t('media.imagesFile')}
                        </Text>
                      </View>
                    )}
                  />
                  {error && <MyText text={error?.message || ''} styleProps={styles.errorText} />}
                </View>
              )}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsModalVisible(false)
                handleReset()
              }}
            >
              <Text style={styles.cancelButtonText}>{t('button.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.loadingButton]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>{t('button.submit')}</Text>
              {isLoading && <ActivityIndicator color={myTheme.primary} style={styles.loadingIndicator} />}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 1
  },
  contentContainer: {
    flex: 1,
    padding: 16
  },
  heading: {
    fontSize: 18,
    fontFamily: 'semibold',
    color: myTheme.primary,
    marginBottom: 12,
    textAlign: 'center'
  },
  textJustify: {
    textAlign: 'justify'
  },
  formField: {
    marginVertical: 12
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  labelContainer: {
    width: '20%',
    justifyContent: 'center'
  },
  labelText: {
    color: myTheme.primary,
    fontSize: 14,
    fontFamily: 'medium'
  },
  inputContainer: {
    flex: 1,
    marginLeft: 8
  },
  textArea: {
    borderWidth: 1,
    borderColor: hexToRgba(myTheme.primary, 0.4),
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    minHeight: 100,
    fontFamily: 'regular'
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4
  },
  mediaSection: {
    marginVertical: 12
  },
  sectionTitle: {
    fontSize: 16,
    color: myTheme.primary,
    fontFamily: 'medium',
    marginBottom: 4
  },
  descriptionText: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    marginBottom: 4,
    textAlign: 'justify'
  },
  mediaUploadSection: {
    marginVertical: 8
  },
  uploadField: {
    marginVertical: 8
  },
  uploadLabel: {
    fontSize: 14,
    color: myTheme.primary,
    fontFamily: 'medium',
    marginBottom: 8
  },
  fileItem: {
    width: 128,
    height: 128,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: myTheme.gray[300],
    overflow: 'hidden'
  },
  filePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 8
  },
  fileIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadContainer: {
    width: 128,
    height: 128,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: myTheme.primary,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadCount: {
    fontSize: 12,
    color: myTheme.mutedForeground,
    marginTop: 8,
    textAlign: 'center'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    marginBottom: 16,
    gap: 12
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6
  },
  cancelButtonText: {
    color: myTheme.primary,
    fontFamily: 'medium'
  },
  submitButton: {
    backgroundColor: myTheme.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  loadingButton: {
    opacity: 0.7
  },
  submitButtonText: {
    color: 'white',
    fontFamily: 'medium'
  },
  loadingIndicator: {
    marginLeft: 8
  },
  checkbox: {
    alignSelf: 'center',
    borderRadius: 6
  }
})
