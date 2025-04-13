import { Entypo } from '@expo/vector-icons'
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  TouchableWithoutFeedback
} from '@gorhom/bottom-sheet'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import Empty from '../empty'
import ImageWithFallback from '../image/ImageWithFallBack'

import { myTheme } from '@/constants'
import { useToast } from '@/contexts/ToastContext'
import { createCartItemApi, deleteCartItemApi, getCartByIdApi, getMyCartApi } from '@/hooks/api/cart'
import useHandleServerError from '@/hooks/useHandleServerError'
import { IClassification, IClassificationKey, IClassificationSelection } from '@/types/classification'
import { StatusEnum } from '@/types/enum'
import { checkCurrentProductClassificationActive } from '@/utils/product'

interface ClassificationChosenProps {
  classifications: IClassification[]
  productClassification: IClassification | null
  cartItemId: string
  cartItemQuantity?: number
  preventAction?: boolean
}

const ClassificationChosen = ({
  classifications,
  productClassification,
  cartItemId,
  cartItemQuantity,
  preventAction
}: ClassificationChosenProps) => {
  const { t } = useTranslation()
  const [currentSelectClassification, setCurrentSelectClassification] = useState<IClassification | null>(
    productClassification
  )
  const [chosenClassification, setChosenClassification] = useState<IClassification | null>(productClassification)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedValues, setSelectedValues] = useState<IClassificationSelection>({
    color: productClassification?.color || null,
    size: productClassification?.size || null,
    other: productClassification?.other || null
  })

  // const isProductClassificationActive = checkCurrentProductClassificationActive(productClassification, classifications)
  const titleShown =
    [
      chosenClassification?.color && `${chosenClassification.color}`,
      chosenClassification?.size && `${chosenClassification.size}`,
      chosenClassification?.other && `${chosenClassification.other}`
    ]
      .filter(Boolean)
      .join(', ') || t('productDetail.selectClassification')
  const { showToast } = useToast()
  const handleServerError = useHandleServerError()
  const queryClient = useQueryClient()

  // bottom sheet for classification
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['40%', '60%', '100%'], [])
  const toggleModalVisibility = () => {
    if (isModalVisible) {
      bottomSheetModalRef.current?.close() // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present() // Open modal if it's not visible
    }
    setIsModalVisible(!isModalVisible) // Toggle the state
  }
  const renderBackdrop = React.useCallback(
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

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index)
  }, [])
  const handleModalDismiss = () => {
    bottomSheetModalRef.current?.close()

    setIsModalVisible(false)
  }

  const { mutateAsync: deleteCartItemFn } = useMutation({
    mutationKey: [deleteCartItemApi.mutationKey, cartItemId as string],
    mutationFn: deleteCartItemApi.fn,
    onSuccess: () => {
      showToast(t('cart.updateClassificationSuccess'), 'success', 4000)
      queryClient.invalidateQueries({
        queryKey: [getMyCartApi.queryKey]
      })
      queryClient.invalidateQueries({
        queryKey: [getCartByIdApi.queryKey, cartItemId as string]
      })
    }
  })

  const { mutateAsync: createCartItemFn } = useMutation({
    mutationKey: [createCartItemApi.mutationKey],
    mutationFn: createCartItemApi.fn,
    onSuccess: () => {
      handleDeleteCartItem()
    }
  })
  const handleClassificationUpdate = useCallback(
    async (updateClassification: IClassification | null) => {
      if (isProcessing) return
      setIsProcessing(true)

      try {
        await createCartItemFn({
          quantity: cartItemQuantity ?? 1,
          classification: updateClassification?.title ?? '',
          productClassification: updateClassification?.id ?? ''
        })
      } catch (error) {
        handleServerError({ error })
      } finally {
        setChosenClassification(currentSelectClassification)
        setIsProcessing(false)
      }
    },
    [cartItemQuantity, createCartItemFn, currentSelectClassification, handleServerError, isProcessing]
  )

  const handleDeleteCartItem = async () => {
    try {
      await deleteCartItemFn(cartItemId)
    } catch (error) {
      handleServerError({ error })
    }
  }
  // const handleSelect = (option: IClassification) => {
  //   setCurrentSelectClassification(option)
  // }

  const getAvailableOptions = (key: IClassificationKey, selections: IClassificationSelection) => {
    return [
      ...new Set(
        classifications
          ?.filter((classification) => {
            return Object.entries(selections).every(
              ([k, v]) => !v || k === key || classification[k as IClassificationKey] === v
            )
          })
          .map((classification) => classification[key])
      )
    ]
  }

  const allOptions = useMemo(() => {
    const getAllOptions = (key: IClassificationKey): string[] => {
      return [
        ...new Set(
          classifications
            ?.map((classification) => classification[key])
            .filter((value): value is string => value !== null)
        )
      ]
    }
    return {
      color: getAllOptions('color'),
      size: getAllOptions('size'),
      other: getAllOptions('other')
    }
  }, [classifications])
  const getFirstAttributeKey = useCallback(() => {
    const keys: IClassificationKey[] = ['color', 'size', 'other']
    for (const key of keys) {
      if (allOptions[key]?.length > 0) {
        return key
      }
    }
    return null
  }, [allOptions])

  const availableOptions = {
    color: getAvailableOptions('color', selectedValues),
    size: getAvailableOptions('size', selectedValues),
    other: getAvailableOptions('other', selectedValues)
  }

  const firstAttributeKey = getFirstAttributeKey()

  const handleSelection = (key: IClassificationKey, value: string) => {
    setSelectedValues((prev) => {
      const updatedValues = {
        ...prev,
        [key]: prev[key] === value ? null : value
      }

      const classificationKeys = Object.keys(allOptions).filter((k) => allOptions[k as IClassificationKey].length > 0)

      const isComplete = classificationKeys.every((k) => updatedValues[k as IClassificationKey] !== null)

      console.log(isComplete)
      if (isComplete) {
        const matchingClassification = classifications?.find((classification) =>
          Object.entries(updatedValues).every(([k, v]) => !v || classification[k as IClassificationKey] === v)
        )

        if (matchingClassification) {
          setCurrentSelectClassification(matchingClassification)
        }
      } else {
        setCurrentSelectClassification(null)
      }

      return updatedValues
    })
  }
  const handleSave = () => {
    if (
      currentSelectClassification?.id !== productClassification?.id ||
      currentSelectClassification?.title !== productClassification?.title
    ) {
      handleClassificationUpdate(currentSelectClassification)
    }
  }

  const handleCancel = () => {
    setCurrentSelectClassification(chosenClassification)
    setSelectedValues({
      color: chosenClassification?.color || null,
      size: chosenClassification?.size || null,
      other: chosenClassification?.other || null
    })
  }

  const renderOptions = (key: IClassificationKey, options: string[]) => {
    if (!options.length) return null

    const showImage = key === firstAttributeKey
    return (
      <View style={styles.classificationContainer}>
        <Text style={styles.attribute}>{t(`productDetail.${key.charAt(0).toUpperCase() + key.slice(1)}`)}</Text>
        <View style={styles.optionContainer}>
          {options.map((option) => {
            const matchingClassifications = classifications.filter((c) => c[key] === option)

            const isPartOfCurrentClassification = currentSelectClassification
              ? currentSelectClassification[key] === option
              : false

            const isSelectedValue = selectedValues[key] === option

            const matchingClassification = matchingClassifications.find((c) =>
              Object.entries(selectedValues)
                .filter(([k]) => k !== key)
                .every(([k, v]) => !v || c[k as IClassificationKey] === v)
            )

            const isActive = matchingClassification
              ? checkCurrentProductClassificationActive(matchingClassification, classifications)
              : false
            return (
              <TouchableOpacity
                onPress={() => handleSelection(key, option)}
                key={option}
                style={[
                  styles.button,
                  isSelectedValue ? styles.selectedClassification : styles.nonSelectClassification,
                  isPartOfCurrentClassification ? styles.selectedClassification : styles.nonSelectClassification
                ]}
                disabled={!availableOptions[key].includes(option) || !isActive}
              >
                {showImage &&
                  matchingClassification?.images?.filter((img) => img.status === StatusEnum.ACTIVE)?.[0]?.fileUrl && (
                    <View style={styles.imageContainer}>
                      <ImageWithFallback
                        alt={option}
                        source={{
                          uri:
                            matchingClassification.images?.filter((img) => img.status === StatusEnum.ACTIVE)?.[0]
                              .fileUrl ?? ''
                        }}
                        style={styles.image}
                        resizeMode='cover'
                      />
                    </View>
                  )}
                <Text
                  style={[
                    isSelectedValue ? styles.selectedClassificationText : styles.nonSelectedClassificationText,
                    isPartOfCurrentClassification
                      ? styles.selectedClassificationText
                      : styles.nonSelectedClassificationText
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    )
  }
  return isProcessing ? (
    <ActivityIndicator size='small' color={myTheme.primary} />
  ) : (
    <View style={styles.fullWidth}>
      <View style={styles.fullWidth}>
        <View style={[styles.fullWidth, styles.commonFlex]}>
          {/* <Text style={styles.mutedText}>
            {t("productDetail.classification")}
          </Text> */}
          <TouchableOpacity
            disabled={preventAction}
            style={styles.titleContainer}
            onPress={() => toggleModalVisibility()}
          >
            <Text style={styles.title} numberOfLines={2}>
              {titleShown}
            </Text>
            <Entypo name='chevron-small-down' size={20} color={myTheme.primary} />
          </TouchableOpacity>
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
              <Text style={styles.classificationLabel}>{t('productDetail.classification')}</Text>
              <View style={styles.classificationsSheetContainer}>
                {classifications && classifications?.length > 0 ? (
                  <>
                    {allOptions.color.length > 0 && renderOptions('color', allOptions.color)}
                    {allOptions.size.length > 0 && renderOptions('size', allOptions.size)}
                    {allOptions.other.length > 0 && renderOptions('other', allOptions.other)}
                  </>
                ) : (
                  <Empty title={t('empty.classification.title')} description={t('empty.classification.description')} />
                )}
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonCancel} onPress={handleCancel}>
                  <Text style={styles.buttonCancelText}>{t('button.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSave} onPress={handleSave}>
                  <Text style={styles.buttonSaveText}>{t('button.save')}</Text>
                </TouchableOpacity>
              </View>
            </BottomSheetView>
          </BottomSheetModal>
        </View>
      </View>
    </View>
  )
}

export default ClassificationChosen

const styles = StyleSheet.create({
  buttonCancel: {
    width: 70,
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: myTheme.primary,
    color: myTheme.primary
  },
  buttonSaveText: { color: myTheme.white },
  buttonCancelText: { color: myTheme.primary },
  selectedClassificationText: {
    color: myTheme.accentForeground,
    fontWeight: 500
  },
  nonSelectedClassificationText: {
    color: myTheme.accentForeground,
    fontWeight: 500
  },
  buttonSave: {
    width: 70,
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    color: myTheme.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: myTheme.primary,
    backgroundColor: myTheme.primary
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    padding: 4,
    borderTopWidth: 1,
    borderTopColor: myTheme.gray[300]
  },
  classificationLabel: {
    fontWeight: 'bold',
    color: myTheme.primary
  },
  title: {
    fontSize: 12,
    color: myTheme.primary,
    fontWeight: 'bold'
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    fontSize: 12,
    color: myTheme.primary,
    fontWeight: 'bold'
  },
  classificationsSheetContainer: {
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  mutedText: { color: myTheme.mutedForeground },
  fullWidth: { width: '100%' },
  commonFlex: { flexDirection: 'row', gap: 2, alignItems: 'center' },
  optionContainer: { flexDirection: 'row', width: '80%', gap: 6 },
  classificationContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    gap: 3
  },
  attribute: { color: myTheme.gray[600], width: '20%' },
  image: { width: '100%', height: '100%', borderRadius: 4 },
  button: {
    padding: 6,
    fontSize: 14,
    borderRadius: 6,
    alignItems: 'center'
  },
  nonSelectClassification: {
    backgroundColor: myTheme.white,
    color: myTheme.accent,
    borderWidth: 1,
    borderColor: myTheme.accent
  },
  selectedClassification: {
    backgroundColor: myTheme.accent,
    color: myTheme.white
  },
  imageContainer: { borderRadius: 4, width: 30, height: 30 },
  pressable: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 50,
    borderWidth: 1,
    overflow: 'visible',
    marginRight: 15,
    zIndex: 10
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
  }
})
