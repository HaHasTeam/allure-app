/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable radix */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'

import MyText from '../common/MyText'
import ImageWithFallback from '../image/ImageWithFallBack'
import LoadingIcon from '../loading/LoadingIcon'
import ProductTag from '../product/ProductTag'

import { myTheme } from '@/constants'
import { useToast } from '@/contexts/ToastContext'
import { createCartItemApi, getMyCartApi } from '@/hooks/api/cart'
import useHandleServerError from '@/hooks/useHandleServerError'
import { IBrand } from '@/types/brand'
import { IClassification } from '@/types/classification'
import { ClassificationTypeEnum, OrderEnum, ShippingStatusEnum } from '@/types/enum'
import { IResponseFeedback } from '@/types/feedback'
import { IMasterConfig } from '@/types/master-config'
import { IStatusTracking } from '@/types/status-tracking'

interface ProductOrderDetailLandscapeProps {
  productImage: string
  productId: string
  productName: string
  eventType: string
  unitPriceAfterDiscount: number
  unitPriceBeforeDiscount: number
  subTotal: number
  productQuantity: number
  productClassification: IClassification | null
  status: ShippingStatusEnum
  feedback: IResponseFeedback | null
  orderDetailId: string
  brand: IBrand | null
  accountName: string
  accountAvatar: string
  statusTracking?: IStatusTracking[]
  masterConfig?: IMasterConfig[]
}
const ProductOrderDetailLandscape = ({
  productImage,
  productId,
  productName,
  eventType,
  productQuantity,
  unitPriceAfterDiscount,
  unitPriceBeforeDiscount,
  subTotal,
  productClassification,
  status,
  feedback,
  orderDetailId,
  brand,
  accountName,
  accountAvatar,
  statusTracking,
  masterConfig
}: ProductOrderDetailLandscapeProps) => {
  const { t } = useTranslation()
  const [isProcessing, setIsProcessing] = useState(false)
  const [openWriteFeedbackDialog, setOpenWriteFeedbackDialog] = useState(false)
  const [openViewFbDialog, setOpenViewFbDialog] = useState(false)
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const handleServerError = useHandleServerError()

  const { mutateAsync: createCartItemFn } = useMutation({
    mutationKey: [createCartItemApi.mutationKey],
    mutationFn: createCartItemApi.fn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getMyCartApi.queryKey]
      })
      showToast(t('cart.addToCartSuccess'), 'success', 4000)
    }
  })

  const handleCreateCartItem = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      if (productClassification) {
        await createCartItemFn({
          classification: productClassification?.title,
          productClassification: productClassification?.id,
          quantity: 1
        })
      }
    } catch (error) {
      handleServerError({ error })
    } finally {
      setIsProcessing(false)
    }
  }
  const showReviewButton = useMemo(() => {
    const isWithinReviewPeriod = () => {
      const deliveredStatusTrack = statusTracking?.find((track) => track.status === ShippingStatusEnum.DELIVERED)

      if (!deliveredStatusTrack?.createdAt) return false

      const deliveredDate = new Date(deliveredStatusTrack.createdAt)
      const currentDate = new Date()
      const allowedTimeInMs =
        masterConfig && masterConfig[0].feedbackTimeExpired ? parseInt(masterConfig[0].feedbackTimeExpired) : null

      return allowedTimeInMs ? currentDate.getTime() - deliveredDate.getTime() <= allowedTimeInMs : true
    }

    return status === ShippingStatusEnum.COMPLETED && !feedback && isWithinReviewPeriod()
  }, [feedback, masterConfig, status, statusTracking])
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Link href={`/(app)/products/${productId}`} asChild>
            <TouchableOpacity>
              <View style={styles.imageWrapper}>
                <ImageWithFallback
                  resizeMode='cover'
                  source={{ uri: productImage }}
                  alt={productName}
                  style={styles.image}
                />
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.productInfoContainer}>
            <View style={styles.nameContainer}>
              <Link href={`/(app)/products/${productId}`} asChild>
                <TouchableOpacity>
                  <MyText text={productName} styleProps={styles.productName} numberOfLines={2} />
                </TouchableOpacity>
              </Link>
              <View>
                {eventType && eventType !== '' && eventType !== OrderEnum.NORMAL && (
                  <ProductTag tag={eventType} size='small' />
                )}
              </View>
              <View style={styles.desktopButtonsContainer}>
                {status === ShippingStatusEnum.COMPLETED && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => handleCreateCartItem()}
                  >
                    {isProcessing ? (
                      <LoadingIcon color='primaryBackground' />
                    ) : (
                      <MyText text={t('order.buyAgain')} styleProps={styles.buttonText} />
                    )}
                  </TouchableOpacity>
                )}

                {showReviewButton && (
                  <TouchableOpacity
                    onPress={() => setOpenWriteFeedbackDialog(true)}
                    style={[styles.actionButton, styles.primaryButton]}
                  >
                    <MyText text={t('order.writeFeedback')} styleProps={styles.buttonText} />
                  </TouchableOpacity>
                )}

                {feedback && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => setOpenViewFbDialog(true)}
                  >
                    <MyText text={t('order.viewFeedback')} styleProps={styles.buttonText} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.classificationContainer}>
            {productClassification?.type === ClassificationTypeEnum?.CUSTOM && (
              <View style={styles.classificationWrapper}>
                <MyText text={`${t('productDetail.classification')}:`} styleProps={styles.classificationLabel} />
                <MyText
                  text={[
                    productClassification?.color && `${productClassification.color}`,
                    productClassification?.size && `${productClassification.size}`,
                    productClassification?.other && `${productClassification.other}`
                  ]
                    .filter(Boolean)
                    .join(', ')}
                  styleProps={styles.classificationValue}
                  numberOfLines={2}
                />
              </View>
            )}
          </View>

          {unitPriceBeforeDiscount - unitPriceAfterDiscount > 0 ? (
            <View style={styles.priceContainer}>
              <MyText
                text={t('productCard.price', {
                  price: unitPriceBeforeDiscount
                })}
                styleProps={styles.oldPrice}
              />
              <MyText
                text={t('productCard.currentPrice', {
                  price: unitPriceAfterDiscount
                })}
                styleProps={styles.discountedPrice}
              />
            </View>
          ) : (
            <View style={styles.priceContainer}>
              <MyText
                text={t('productCard.price', {
                  price: unitPriceBeforeDiscount
                })}
                styleProps={styles.regularPrice}
              />
            </View>
          )}

          <View style={styles.mobileButtonsContainer}>
            {status === ShippingStatusEnum.COMPLETED && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => handleCreateCartItem()}
              >
                <MyText text={t('order.buyAgain')} styleProps={styles.buttonText} />
              </TouchableOpacity>
            )}

            {showReviewButton && (
              <TouchableOpacity
                onPress={() => setOpenWriteFeedbackDialog(true)}
                style={[styles.actionButton, styles.primaryButton]}
              >
                <MyText text={t('order.writeFeedback')} styleProps={styles.buttonText} />
              </TouchableOpacity>
            )}

            {feedback && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => setOpenViewFbDialog(true)}
              >
                <MyText text={t('order.viewFeedback')} styleProps={styles.buttonText} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.quantityContainer}>
          <MyText text={`${productQuantity}`} styleProps={styles.quantityText} />
        </View>

        <View style={styles.subtotalContainer}>
          <MyText text={t('productCard.currentPrice', { price: subTotal })} styleProps={styles.subtotalText} />
        </View>
      </View>

      {/* {openWriteFeedbackDialog && (
        <WriteFeedbackDialog
          isOpen={openWriteFeedbackDialog}
          onClose={() => setOpenWriteFeedbackDialog(false)}
          orderDetailId={orderDetailId}
        />
      )}
      
      {feedback && (
        <ViewFeedbackDialog
          productQuantity={productQuantity}
          productClassification={productClassification}
          isOpen={openViewFbDialog}
          onClose={() => setOpenViewFbDialog(false)}
          feedback={feedback}
          brand={brand || null}
          accountAvatar={accountAvatar}
          accountName={accountName}
          orderDetailId={orderDetailId}
        />
      )} */}
    </View>
  )
}

const { width } = Dimensions.get('window')
const isSmallDevice = width < 375

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: myTheme.gray[200]
  },
  contentContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: isSmallDevice ? 8 : 16
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '16%'
  },
  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 6
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 6
  },
  detailsContainer: {
    flexDirection: 'column',
    width: '54%',
    gap: 8,
    paddingLeft: 4
  },
  productInfoContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    width: '100%'
  },
  nameContainer: {
    flexDirection: 'column',
    gap: 4
  },
  productName: {
    fontSize: isSmallDevice ? 12 : 14
  },
  desktopButtonsContainer: {
    display: 'none'
  },
  classificationContainer: {
    width: '100%',

    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  classificationWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  classificationLabel: {
    fontSize: isSmallDevice ? 10 : 12,
    fontWeight: '500',
    color: myTheme.mutedForeground
  },
  classificationValue: {
    fontSize: isSmallDevice ? 10 : 12,
    fontWeight: '500',
    color: myTheme.primary
  },
  priceContainer: {
    width: '100%',

    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  oldPrice: {
    color: myTheme.gray[400],
    fontSize: isSmallDevice ? 10 : 12,
    textDecorationLine: 'line-through'
  },
  discountedPrice: {
    color: myTheme.red[500],
    fontSize: isSmallDevice ? 10 : 12
  },
  regularPrice: {
    fontSize: isSmallDevice ? 10 : 12
  },
  mobileButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  primaryButton: {
    borderColor: myTheme.primary
  },
  buttonText: {
    color: myTheme.primary,
    fontSize: isSmallDevice ? 10 : 12
  },
  quantityContainer: {
    width: '10%',

    alignItems: 'flex-end'
  },
  quantityText: {
    fontSize: isSmallDevice ? 10 : 12
  },
  subtotalContainer: {
    width: '20%',

    alignItems: 'flex-end'
  },
  subtotalText: {
    fontWeight: '500',
    color: myTheme.red[500],
    fontSize: isSmallDevice ? 10 : 12
  }
})

export default ProductOrderDetailLandscape
