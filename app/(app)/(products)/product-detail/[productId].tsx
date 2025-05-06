/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { AntDesign, MaterialIcons, MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  FlatList,
  Animated,
  Pressable,
  Modal
} from 'react-native'

import { myTheme } from '@/constants'
import { useToast } from '@/contexts/ToastContext'
import { createCartItemApi, getMyCartApi } from '@/hooks/api/cart'
import { getFeedbackGeneralOfProductApi, filterFeedbackApi } from '@/hooks/api/feedback/index'
import { getProductApi } from '@/hooks/api/product/index'
import useHandleServerError from '@/hooks/useHandleServerError'
import type { IClassification } from '@/types/classification'
import { DiscountTypeEnum, OrderEnum, ProductDiscountEnum, FeedbackFilterEnum } from '@/types/enum'
import type { IResponseFilterFeedback } from '@/types/feedback'
import { PreOrderProductEnum } from '@/types/pre-order'
import { calculateDiscountPrice } from '@/utils/price'

const { width, height } = Dimensions.get('window')
const ITEM_WIDTH = width
const ITEM_HEIGHT = width * 1.1

interface ProductDetailScreenProps {
  initProductId?: string
  isInGroupBuying?: boolean
}

const ProductDetailScreen = ({ initProductId, isInGroupBuying = false }: ProductDetailScreenProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const imageSliderRef = useRef<FlatList>(null)
  const thumbnailsRef = useRef<ScrollView>(null)
  const scrollX = useRef(new Animated.Value(0)).current
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false)
  const [showPriceDetails, setShowPriceDetails] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [reviews, setReviews] = useState<IResponseFilterFeedback[]>([])
  const [modalReviews, setModalReviews] = useState<IResponseFilterFeedback[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [modalTotalPages, setModalTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalCurrentPage, setModalCurrentPage] = useState(1)
  const [isLoadingReviews, setIsLoading] = useState(false)
  const [isLoadingModalReviews, setIsLoadingModalReviews] = useState(false)
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
    },
    onError: (error) => {
      handleServerError({ error })
    }
  })
  // Get product ID from props or route params
  const { productId: routeProductId } = useLocalSearchParams<{
    productId: string
  }>()
  const productId = initProductId || routeProductId

  // Fetch product data
  const {
    data: productResponse,
    isFetching: isLoadingProduct,
    error: productError,
    refetch: refetchProduct
  } = useQuery({
    queryKey: [getProductApi.queryKey, productId],
    queryFn: getProductApi.fn,
    enabled: !!productId
  })

  // Fetch review data
  const {
    data: reviewGeneral,
    isFetching: isFetchingReviewGeneral,
    error: reviewError,
    refetch: refetchReviews
  } = useQuery({
    queryKey: [getFeedbackGeneralOfProductApi.queryKey, productId],
    queryFn: getFeedbackGeneralOfProductApi.fn,
    enabled: !!productId
  })

  // Fetch review details
  const { mutateAsync: getFeedbackOfProduct } = useMutation({
    mutationKey: [filterFeedbackApi.mutationKey, productId],
    mutationFn: filterFeedbackApi.fn,
    onSuccess: (data) => {
      setReviews(data?.data?.items || [])
      setTotalPages(data?.data?.totalPages || 1)
      setIsLoading(false)
    }
  })

  // Fetch review details for modal
  const { mutateAsync: getFeedbackOfProductForModal } = useMutation({
    mutationKey: [filterFeedbackApi.mutationKey, productId, 'modal'],
    mutationFn: filterFeedbackApi.fn,
    onSuccess: (data) => {
      if (modalCurrentPage === 1) {
        setModalReviews(data?.data?.items || [])
      } else {
        setModalReviews((prev) => [...prev, ...(data?.data?.items || [])])
      }
      setModalTotalPages(data?.data?.totalPages || 1)
      setIsLoadingModalReviews(false)
    }
  })

  const product = productResponse?.data
  const reviewData = reviewGeneral?.data

  // Load reviews when product data is available
  useEffect(() => {
    if (productId) {
      loadReviews(1)
    }
  }, [productId])

  const loadReviews = async (page: number) => {
    setIsLoading(true)
    try {
      await getFeedbackOfProduct({
        params: productId || '',
        data: { type: FeedbackFilterEnum.ALL, value: '' },
        page: page.toString(),
        limit: '3'
      })
      setCurrentPage(page)
    } catch (error) {
      console.error('Error loading reviews:', error)
      setIsLoading(false)
    }
  }

  const loadModalReviews = async (page: number) => {
    setIsLoadingModalReviews(true)
    try {
      await getFeedbackOfProductForModal({
        params: productId || '',
        data: { type: FeedbackFilterEnum.ALL, value: '' },
        page: page.toString(),
        limit: '20'
      })
      setModalCurrentPage(page)
    } catch (error) {
      console.error('Error loading modal reviews:', error)
      setIsLoadingModalReviews(false)
    }
  }

  const loadMoreModalReviews = () => {
    if (modalCurrentPage < modalTotalPages && !isLoadingModalReviews) {
      loadModalReviews(modalCurrentPage + 1)
    }
  }

  // Determine the event type (normal, flash sale, pre-order)
  const event = useMemo(
    () =>
      isInGroupBuying
        ? OrderEnum.NORMAL
        : (product?.productDiscounts ?? [])?.length > 0 &&
            (product?.productDiscounts ?? [])[0]?.status === ProductDiscountEnum.ACTIVE
          ? OrderEnum.FLASH_SALE
          : (product?.preOrderProducts ?? [])?.length > 0 &&
              (product?.preOrderProducts ?? [])[0]?.status === PreOrderProductEnum.ACTIVE
            ? OrderEnum.PRE_ORDER
            : OrderEnum.NORMAL,
    [product?.preOrderProducts, product?.productDiscounts, isInGroupBuying]
  )

  // Find default classification and cheapest classification
  const defaultClassification = useMemo(() => {
    if (!product?.productClassifications?.length) return null
    return product.productClassifications.find((c) => c.type === 'DEFAULT') || null
  }, [product?.productClassifications])

  const cheapestClassification = useMemo(() => {
    if (!product?.productClassifications?.length) return null
    return [...product.productClassifications].sort((a, b) => a.price - b.price)[0]
  }, [product?.productClassifications])

  // State for UI
  const [selectedSize, setSelectedSize] = useState<IClassification | null>(null)

  // Update selected size when product data is loaded
  useEffect(() => {
    if (product?.productClassifications?.length) {
      // If there's a default classification, select it
      if (defaultClassification) {
        setSelectedSize(defaultClassification)
      } else {
        // Otherwise select the cheapest one
        setSelectedSize(cheapestClassification)
      }
    }
  }, [product, defaultClassification, cheapestClassification])

  // Determine if we should show the size selection section
  const shouldShowSizeSelection = useMemo(() => {
    return (product?.productClassifications?.length ?? 0) > 0 && !defaultClassification
  }, [product?.productClassifications, defaultClassification])

  const handleSizeSelect = (classification: IClassification) => {
    setSelectedSize(classification)
  }

  const handleAddToCart = async () => {
    if (!product || !selectedSize) return

    console.log('Added to cart:', {
      product: product.name,
      size: selectedSize.size,
      price: selectedSize.price
    })
    await createCartItemFn({
      quantity: 1,
      productClassification: selectedSize.id,
      classification: selectedSize.title ?? ''
    })
  }

  const handleImageChange = (index: number) => {
    setActiveImageIndex(index)
    // Scroll main image to the selected index
    imageSliderRef.current?.scrollToOffset({
      offset: index * ITEM_WIDTH,
      animated: true
    })

    // Scroll thumbnails to make the selected one visible
    thumbnailsRef.current?.scrollTo({
      x: index * 80 - width / 2 + 40,
      animated: true
    })
  }

  const handleMainImageScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH)
    if (slideIndex !== activeImageIndex) {
      setActiveImageIndex(slideIndex)

      // Scroll thumbnails to make the selected one visible
      thumbnailsRef.current?.scrollTo({
        x: slideIndex * 80 - width / 2 + 40,
        animated: true
      })
    }
  }

  const handleRetry = () => {
    refetchProduct()
    refetchReviews()
    loadReviews(1)
  }

  const handleGoBack = () => {
    router.back()
  }

  const toggleFullscreenGallery = () => {
    setShowFullscreenGallery(!showFullscreenGallery)
  }

  const togglePriceDetails = () => {
    setShowPriceDetails(!showPriceDetails)
  }

  const toggleAllReviews = () => {
    if (!showAllReviews) {
      // Reset modal state when opening
      setModalCurrentPage(1)
      setModalReviews([])
      loadModalReviews(1)
    }
    setShowAllReviews(!showAllReviews)
  }

  // Calculate price and discount based on event type
  const deal = event === OrderEnum.FLASH_SALE ? product?.productDiscounts?.[0]?.discount || 0 : 0
  const originalPrice = selectedSize?.price || cheapestClassification?.price || product?.price || 0
  const currentPrice =
    deal > 0 ? calculateDiscountPrice(originalPrice, deal, DiscountTypeEnum.PERCENTAGE) : originalPrice

  // Parse product details if available
  const detailObject = useMemo(() => {
    try {
      return product?.detail ? JSON.parse(product.detail) : {}
    } catch {
      return {}
    }
  }, [product?.detail])

  // Get label for detail values
  const getLabel = (key: string, value: string) => {
    const category = product?.category?.detail?.[key]

    if (!category || (category.type !== 'singleChoice' && category.type !== 'multipleChoice')) {
      return value
    }

    const matchingOption = category?.options?.find((opt) => opt.value === value)
    return matchingOption ? matchingOption.label : value
  }

  // Check if a value is a valid date
  const isValidDate = (value: unknown): boolean => {
    return typeof value === 'string' && !isNaN(new Date(value).getTime())
  }

  // Format date for reviews
  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Render a single review item
  const renderReviewItem = (review: IResponseFilterFeedback) => {
    // Get the first letter of username for avatar fallback
    const username = review.orderDetail.order.account.username || 'Anonymous User'
    const firstLetter = username.charAt(0).toUpperCase()

    return (
      <View style={styles.reviewItem} key={review.id}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUser}>
            {review.orderDetail.order.account.avatar ? (
              <Image
                source={{
                  uri: review.orderDetail.order.account.avatar
                }}
                style={styles.reviewUserImage}
              />
            ) : (
              <View style={[styles.reviewUserImage, styles.avatarFallback]}>
                <Text style={styles.avatarFallbackText}>{firstLetter}</Text>
              </View>
            )}
            <View>
              <Text style={styles.reviewUserName}>{username}</Text>
              <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.reviewRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <AntDesign
                key={star}
                name='star'
                size={14}
                color={star <= review.rating ? '#FFD700' : myTheme.muted}
                style={{ marginLeft: 2 }}
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewContent}>{review.content}</Text>
        {review.mediaFiles && review.mediaFiles.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
            {review.mediaFiles.map((media, index) => (
              <Image key={index} source={{ uri: media.fileUrl }} style={styles.reviewImage} />
            ))}
          </ScrollView>
        )}
      </View>
    )
  }

  // Loading state
  if (isLoadingProduct || isFetchingReviewGeneral) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='dark-content' />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={myTheme.primary} />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Error state
  if (productError || reviewError || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='dark-content' />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load product details</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor={myTheme.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Feather name='arrow-left' size={24} color={myTheme.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerActions}>{/* Removed favorite and share buttons */}</View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Beautiful Product Image Gallery */}
        <View style={styles.imageGalleryContainer}>
          {/* Main Image Slider */}
          <Animated.FlatList
            ref={imageSliderRef}
            data={product.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
            onMomentumScrollEnd={handleMainImageScroll}
            renderItem={({ item, index }) => (
              <Pressable style={styles.mainImageContainer} onPress={toggleFullscreenGallery}>
                <Image
                  source={{
                    uri:
                      item.fileUrl ||
                      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-cdUFYWrZKjemXwWjckRqxZ4DdzChHV.png'
                  }}
                  style={styles.mainImage}
                  resizeMode='cover'
                />

                {/* Zoom icon */}
                <View style={styles.zoomIconContainer}>
                  <Feather name='maximize' size={16} color='#fff' />
                </View>

                {/* Image counter */}
                <View style={styles.imageCounterContainer}>
                  <Text style={styles.imageCounter}>
                    {index + 1}/{product.images.length}
                  </Text>
                </View>
              </Pressable>
            )}
            keyExtractor={(item, index) => `main-image-${index}`}
          />

          {/* Thumbnails */}
          <View style={styles.thumbnailsOuterContainer}>
            <View style={styles.thumbnailsBackground}>
              <ScrollView
                ref={thumbnailsRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.thumbnailsContainer}
                contentContainerStyle={styles.thumbnailsContent}
              >
                {product.images.map((image, index) => (
                  <TouchableOpacity
                    key={`thumbnail-${index}`}
                    style={[styles.thumbnailButton, activeImageIndex === index && styles.activeThumbnail]}
                    onPress={() => handleImageChange(index)}
                  >
                    <Image
                      source={{
                        uri:
                          image.fileUrl ||
                          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-cdUFYWrZKjemXwWjckRqxZ4DdzChHV.png'
                      }}
                      style={styles.thumbnailImage}
                      resizeMode='cover'
                    />
                    {activeImageIndex === index && <View style={styles.activeThumbnailOverlay} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          {/* Category */}
          <Text style={styles.category}>{product.category?.name || 'Skin Care'}</Text>

          {/* Product Name and Rating */}
          <View style={styles.nameRatingContainer}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.ratingContainer}>
              <AntDesign name='star' size={18} color='#FFD700' style={styles.starIcon} />
              <Text style={styles.rating}>{reviewData?.averageRating || product.rating || '0.0'}</Text>
            </View>
          </View>

          {/* Special Event Banner */}
          {event !== OrderEnum.NORMAL && (
            <View style={styles.specialEventContainer}>
              <View style={styles.specialEventBadge}>
                <Text style={styles.specialEventBadgeText}>
                  {event === OrderEnum.FLASH_SALE ? 'FLASH SALE' : 'PRE-ORDER'}
                </Text>
              </View>
              <View style={styles.specialEventInfo}>
                <Text style={styles.specialEventTitle}>
                  {event === OrderEnum.FLASH_SALE ? t('flashSale.title') : t('preOrder.title')}
                </Text>
                <Text style={styles.specialEventTime}>
                  {event === OrderEnum.FLASH_SALE
                    ? t('flashSale.endsIn', {
                        val: new Date(product?.productDiscounts?.[0]?.endTime || Date.now())
                      })
                    : t('preOrder.endsIn', {
                        val: new Date(product?.preOrderProducts?.[0]?.endTime || Date.now())
                      })}
                </Text>
              </View>
            </View>
          )}

          {product?.productDiscounts?.[0]?.status === ProductDiscountEnum.WAITING && (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>
                {t('flashSale.waiting', {
                  val: new Date(product?.productDiscounts?.[0]?.startTime || Date.now())
                })}
              </Text>
            </View>
          )}

          {/* Price Section with Discount Info */}
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>{t('productCard.currentPrice', { price: currentPrice })}</Text>
              {deal > 0 && (
                <>
                  <View style={styles.dealTag}>
                    <Text style={styles.dealTagText}>{deal * 100}%</Text>
                  </View>
                  <Text style={styles.originalPrice}>{t('productCard.price', { price: originalPrice })}</Text>
                </>
              )}
              {deal > 0 && (
                <TouchableOpacity onPress={togglePriceDetails}>
                  <Feather name='alert-circle' size={16} color={myTheme.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>

            {/* Price Details Popup */}
            {showPriceDetails && (
              <View style={styles.priceDetailsPopup}>
                <View style={styles.priceDetailsHeader}>
                  <Text style={styles.priceDetailsTitle}>{t('productDetail.priceDetail')}</Text>
                  <TouchableOpacity onPress={togglePriceDetails}>
                    <Feather name='x' size={20} color={myTheme.foreground} />
                  </TouchableOpacity>
                </View>
                <View style={styles.priceDetailsContent}>
                  <View style={styles.priceDetailRow}>
                    <Text style={styles.priceDetailLabel}>{t('productDetail.originalPrice')}</Text>
                    <Text style={styles.priceDetailValue}>{t('productCard.price', { price: originalPrice })}</Text>
                  </View>
                  {deal > 0 && (
                    <View style={styles.priceDetailRow}>
                      <Text style={styles.priceDetailLabel}>{t('cart.directDiscount')}</Text>
                      <Text style={styles.priceDetailValue}>
                        -
                        {t('productCard.price', {
                          price: originalPrice * deal
                        })}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.priceDetailRow, styles.priceDetailTotal]}>
                    <Text style={styles.priceDetailTotalLabel}>{t('cart.estimateProductPrice')}</Text>
                    <Text style={styles.priceDetailTotalValue}>{t('productCard.price', { price: currentPrice })}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Seller Info */}
          <Text style={styles.sellerLabel}>Brand</Text>
          <View style={styles.sellerContainer}>
            <Image
              source={{
                uri: product.brand?.logo || '/placeholder.svg?height=40&width=40'
              }}
              style={styles.sellerImage}
            />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{product.brand?.name || 'Brand Name'}</Text>
              <Text style={styles.sellerCompany}>{product.brand?.description || 'Brand Description'}</Text>
            </View>
            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactButton}>
                <MaterialIcons name='chat' size={16} color='#fff' />
              </TouchableOpacity>
              {/* <TouchableOpacity style={styles.contactButton}>
                <MaterialIcons name="phone" size={16} color="#fff" />
              </TouchableOpacity> */}
            </View>
          </View>

          {/* Quality Service Section */}
          <View style={styles.qualityServiceContainer}>
            <Text style={styles.sectionTitle}>{t('productDetail.qualityService')}</Text>
            <View style={styles.qualityServiceList}>
              {product.certificates && product.certificates.length > 0 && (
                <View style={styles.qualityServiceItem}>
                  <AntDesign name='checkcircle' size={20} color={myTheme.primary} />
                  <View style={styles.qualityServiceContent}>
                    <Text style={styles.qualityServiceText}>{t('productDetail.safeCertificate')}</Text>
                    <View style={styles.certificateActions}>
                      {product.certificates.map((cert, index) => (
                        <View key={index} style={styles.certificateAction}>
                          {index > 0 && <Text style={styles.certificateSeparator}>|</Text>}
                          <Text style={styles.certificateLabel}>
                            {t('createProduct.file')} #{index + 1}
                          </Text>
                          <TouchableOpacity>
                            <Feather name='eye' size={16} color={myTheme.mutedForeground} />
                          </TouchableOpacity>
                          <TouchableOpacity>
                            <Feather name='download' size={16} color={myTheme.mutedForeground} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
              <View style={styles.qualityServiceItem}>
                <MaterialCommunityIcons name='package-up' size={20} color={myTheme.primary} />
                <Text style={styles.qualityServiceText}>{t('productDetail.official')}</Text>
              </View>
              <View style={styles.qualityServiceItem}>
                <MaterialCommunityIcons name='package' size={20} color={myTheme.primary} />
                <Text style={styles.qualityServiceText}>{t('productDetail.verified')}</Text>
              </View>
            </View>
          </View>

          {/* Size Selection - Only show if there's no DEFAULT type */}
          {shouldShowSizeSelection && (
            <>
              <Text style={styles.sectionTitle}>Select Size</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sizesContainer}>
                {product.productClassifications?.map((classification) => (
                  <TouchableOpacity
                    key={classification.id}
                    style={[styles.sizeButton, selectedSize?.id === classification.id && styles.selectedSizeButton]}
                    onPress={() => handleSizeSelect(classification)}
                  >
                    <Text style={[styles.sizeText, selectedSize?.id === classification.id && styles.selectedSizeText]}>
                      {classification.size || classification.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Product Details Section */}
          <Text style={styles.sectionTitle}>Product Details</Text>
          {Object.keys(detailObject).length > 0 ? (
            <View style={styles.detailTable}>
              {Object.entries(detailObject).map(([key, value]) => {
                const category = product?.category?.detail?.[key]
                if (!category) return null

                return (
                  <View key={key} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{category.label}</Text>
                    <Text style={styles.detailValue}>
                      {Array.isArray(value)
                        ? value.map((val) => getLabel(key, val)).join(', ')
                        : isValidDate(value)
                          ? t('date.toLocaleDateTimeString', {
                              val: new Date(value as string)
                            })
                          : getLabel(key, value as string)}
                    </Text>
                  </View>
                )
              })}
            </View>
          ) : (
            <Text style={styles.detailText}>{product.description || product.detail}</Text>
          )}

          {/* Group Buying Info (if applicable) */}
          {isInGroupBuying && (
            <View style={styles.groupBuyingContainer}>
              <Text style={styles.sectionTitle}>Group Buying</Text>
              <View style={styles.groupBuyingInfo}>
                <Text style={styles.groupBuyingText}>Join with others to get a special discount!</Text>
                <Text style={styles.groupBuyingDiscount}>Save up to 20% when buying in a group</Text>
              </View>
            </View>
          )}

          {/* Reviews Summary */}
          {reviewData && (
            <View style={styles.reviewsContainer}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <TouchableOpacity onPress={toggleAllReviews} style={styles.seeAllButton}>
                  <Text style={styles.seeAllButtonText}>See All</Text>
                  <Feather name='chevron-right' size={16} color={myTheme.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.reviewSummary}>
                <View style={styles.ratingBig}>
                  <Text style={styles.ratingBigNumber}>{reviewData.averageRating}</Text>
                  <Text style={styles.ratingBigText}>out of 5</Text>
                </View>
                <View style={styles.ratingBars}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <View key={star} style={styles.ratingBar}>
                      <Text style={styles.ratingBarText}>
                        {star} <AntDesign name='star' size={12} color='#FFD700' />
                      </Text>
                      <View style={styles.ratingBarBg}>
                        <View
                          style={[
                            styles.ratingBarFill,
                            {
                              width: `${
                                ((reviewData[`rating${star}Count` as keyof typeof reviewData] as number) /
                                  reviewData.totalCount) *
                                100
                              }%`
                            }
                          ]}
                        />
                      </View>
                      <Text style={styles.ratingBarCount}>
                        {reviewData[`rating${star}Count` as keyof typeof reviewData]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Review List */}
              {isLoadingReviews ? (
                <ActivityIndicator size='small' color={myTheme.primary} style={styles.reviewsLoading} />
              ) : reviews.length > 0 ? (
                <View style={styles.reviewsList}>{reviews.map((review) => renderReviewItem(review))}</View>
              ) : (
                <Text style={styles.noReviewsText}>No reviews yet</Text>
              )}
            </View>
          )}

          {/* Add padding at the bottom for the fixed button */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Fixed Add to Cart Button at Bottom */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.price}>
            {t('productCard.price', {
              price: selectedSize?.price || cheapestClassification?.price || product.price
            })}
          </Text>
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <MaterialCommunityIcons
            name='shopping'
            size={20}
            color={myTheme.primaryForeground}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Fullscreen Gallery Modal */}
      {showFullscreenGallery && (
        <Pressable style={styles.fullscreenGallery} onPress={toggleFullscreenGallery}>
          <StatusBar barStyle='light-content' backgroundColor='#000' />
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity style={styles.fullscreenCloseButton} onPress={toggleFullscreenGallery}>
              <Ionicons name='close' size={28} color='#fff' />
            </TouchableOpacity>
            <Text style={styles.fullscreenCounter}>
              {activeImageIndex + 1}/{product.images.length}
            </Text>
          </View>

          <FlatList
            data={product.images}
            horizontal
            pagingEnabled
            initialScrollIndex={activeImageIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index
            })}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.fullscreenImageContainer}>
                <Image source={{ uri: item.fileUrl }} style={styles.fullscreenImage} resizeMode='contain' />
              </View>
            )}
            keyExtractor={(_, index) => `fullscreen-${index}`}
          />
        </Pressable>
      )}

      {/* All Reviews Modal */}
      <Modal visible={showAllReviews} animationType='slide' transparent={false} onRequestClose={toggleAllReviews}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={toggleAllReviews} style={styles.modalCloseButton}>
              <Feather name='arrow-left' size={24} color={myTheme.foreground} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>All Reviews</Text>
            <View style={{ width: 24 }} />
          </View>

          <FlatList
            data={modalReviews}
            renderItem={({ item }) => renderReviewItem(item)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreModalReviews}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingModalReviews ? (
                <ActivityIndicator size='small' color={myTheme.primary} style={{ marginVertical: 20 }} />
              ) : modalCurrentPage < modalTotalPages ? (
                <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreModalReviews}>
                  <Text style={styles.loadMoreButtonText}>Load More</Text>
                </TouchableOpacity>
              ) : null
            }
            ListEmptyComponent={
              isLoadingModalReviews ? (
                <ActivityIndicator size='large' color={myTheme.primary} style={{ marginVertical: 40 }} />
              ) : (
                <View style={styles.emptyReviewsContainer}>
                  <Text style={styles.emptyReviewsText}>No reviews available</Text>
                </View>
              )
            }
          />

          {/* Pagination */}
          {modalTotalPages > 1 && (
            <View style={styles.reviewPaginationContainer}>
              <Text style={styles.paginationText}>
                Page {modalCurrentPage} of {modalTotalPages}
              </Text>
              <View style={styles.paginationButtons}>
                <TouchableOpacity
                  style={[styles.paginationButton, modalCurrentPage === 1 && styles.paginationButtonDisabled]}
                  onPress={() => modalCurrentPage > 1 && loadModalReviews(modalCurrentPage - 1)}
                  disabled={modalCurrentPage === 1 || isLoadingModalReviews}
                >
                  <Feather
                    name='chevron-left'
                    size={20}
                    color={modalCurrentPage === 1 ? myTheme.mutedForeground : myTheme.foreground}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    modalCurrentPage === modalTotalPages && styles.paginationButtonDisabled
                  ]}
                  onPress={() => modalCurrentPage < modalTotalPages && loadModalReviews(modalCurrentPage + 1)}
                  disabled={modalCurrentPage === modalTotalPages || isLoadingModalReviews}
                >
                  <Feather
                    name='chevron-right'
                    size={20}
                    color={modalCurrentPage === modalTotalPages ? myTheme.mutedForeground : myTheme.foreground}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myTheme.white
  },
  header: {
    backgroundColor: myTheme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: myTheme.white
  },
  backButton: {
    padding: 4
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 8
  },
  scrollView: {
    flex: 1,
    backgroundColor: myTheme.white
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: myTheme.background
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: myTheme.foreground
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: myTheme.background,
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: myTheme.destructive,
    marginBottom: 16,
    textAlign: 'center'
  },
  retryButton: {
    backgroundColor: myTheme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24
  },
  retryButtonText: {
    color: myTheme.primaryForeground,
    fontSize: 16,
    fontWeight: '600'
  },
  // Enhanced Beautiful Image Gallery Styles
  imageGalleryContainer: {
    position: 'relative',
    backgroundColor: myTheme.primary,
    overflow: 'hidden'
  },
  mainImageContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    position: 'relative'
  },
  mainImage: {
    width: '100%',
    height: '100%'
  },
  zoomIconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8
  },
  imageCounterContainer: {
    position: 'absolute',
    bottom: 90, // Above the thumbnails
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  imageCounter: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 90, // Above the thumbnails
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  paginationDotContainer: {
    padding: 8 // Larger touch target
  },
  paginationDot: {
    height: 4,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4
  },
  thumbnailsOuterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80
  },
  thumbnailsBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center'
  },
  thumbnailsContainer: {
    height: 70
  },
  thumbnailsContent: {
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  thumbnailButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  activeThumbnail: {
    borderColor: '#fff',
    transform: [{ scale: 1.05 }]
  },
  activeThumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  thumbnailImage: {
    width: '100%',
    height: '100%'
  },
  // Fullscreen Gallery Styles
  fullscreenGallery: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 1000
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1001
  },
  fullscreenCloseButton: {
    padding: 8
  },
  fullscreenCounter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  fullscreenImageContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullscreenImage: {
    width,
    height: height * 0.8
  },
  // Original styles
  detailsContainer: {
    padding: 16,
    backgroundColor: myTheme.white
  },
  category: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    marginBottom: 4
  },
  nameRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  productName: {
    fontSize: 22,
    fontWeight: '600',
    color: myTheme.foreground,
    flex: 1
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  starIcon: {
    marginRight: 4
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: myTheme.foreground
  },
  // Price Section Styles
  priceSection: {
    marginVertical: 12,
    position: 'relative'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: myTheme.destructive
  },
  dealTag: {
    backgroundColor: myTheme.destructive,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  dealTagText: {
    color: myTheme.white,
    fontSize: 12,
    fontWeight: '600'
  },
  originalPrice: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    textDecorationLine: 'line-through'
  },
  priceDetailsPopup: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: width * 0.9,
    backgroundColor: myTheme.white,
    borderRadius: 8,
    padding: 16,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  },
  priceDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  priceDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: myTheme.foreground
  },
  priceDetailsContent: {
    backgroundColor: 'rgba(254, 226, 226, 0.3)',
    borderRadius: 8,
    padding: 12
  },
  priceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  priceDetailLabel: {
    fontSize: 14,
    color: myTheme.mutedForeground
  },
  priceDetailValue: {
    fontSize: 14,
    color: myTheme.destructive,
    fontWeight: '500'
  },
  priceDetailTotal: {
    borderTopWidth: 1,
    borderTopColor: myTheme.border,
    paddingTop: 8,
    marginTop: 8
  },
  priceDetailTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: myTheme.foreground
  },
  priceDetailTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: myTheme.destructive
  },
  sellerLabel: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    marginBottom: 8
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  sellerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  sellerInfo: {
    flex: 1
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '500',
    color: myTheme.foreground
  },
  sellerCompany: {
    fontSize: 12,
    color: myTheme.mutedForeground
  },
  contactButtons: {
    flexDirection: 'row'
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: myTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  // Quality Service Styles
  qualityServiceContainer: {
    marginVertical: 16,
    backgroundColor: myTheme.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: myTheme.border
  },
  qualityServiceList: {
    marginTop: 8
  },
  qualityServiceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border
  },
  qualityServiceContent: {
    flex: 1,
    marginLeft: 12
  },
  qualityServiceText: {
    fontSize: 14,
    color: myTheme.foreground,
    marginLeft: 12
  },
  certificateActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4
  },
  certificateAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    gap: 4
  },
  certificateSeparator: {
    color: myTheme.mutedForeground,
    marginHorizontal: 4
  },
  certificateLabel: {
    fontSize: 12,
    color: myTheme.mutedForeground
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: myTheme.foreground,
    marginBottom: 12
  },
  sizesContainer: {
    flexDirection: 'row',
    marginBottom: 24
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: myTheme.secondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: myTheme.secondary
  },
  selectedSizeButton: {
    backgroundColor: myTheme.primary,
    borderColor: myTheme.primary
  },
  sizeText: {
    fontSize: 14,
    color: myTheme.secondaryForeground
  },
  selectedSizeText: {
    color: myTheme.primaryForeground
  },
  // Detail Table Styles
  detailTable: {
    borderWidth: 1,
    borderColor: myTheme.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24
  },
  detailRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border
  },
  detailLabel: {
    width: '40%',
    padding: 12,
    backgroundColor: myTheme.muted,
    fontWeight: '500',
    fontSize: 14
  },
  detailValue: {
    flex: 1,
    padding: 12,
    fontSize: 14
  },
  detailText: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    lineHeight: 20,
    marginBottom: 24
  },
  groupBuyingContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: myTheme.lightPrimary,
    borderRadius: 12
  },
  groupBuyingInfo: {
    marginTop: 8
  },
  groupBuyingText: {
    fontSize: 14,
    color: myTheme.foreground,
    marginBottom: 4
  },
  groupBuyingDiscount: {
    fontSize: 16,
    fontWeight: '600',
    color: myTheme.primary
  },
  // Reviews Styles
  reviewsContainer: {
    marginBottom: 24
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  seeAllButtonText: {
    fontSize: 14,
    color: myTheme.primary,
    marginRight: 4
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  ratingBig: {
    alignItems: 'center',
    marginRight: 20,
    width: 80
  },
  ratingBigNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: myTheme.foreground
  },
  ratingBigText: {
    fontSize: 12,
    color: myTheme.mutedForeground
  },
  ratingBars: {
    flex: 1
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  ratingBarText: {
    width: 40,
    fontSize: 12,
    color: myTheme.mutedForeground
  },
  ratingBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: myTheme.muted,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: myTheme.primary
  },
  ratingBarCount: {
    width: 30,
    fontSize: 12,
    color: myTheme.mutedForeground,
    textAlign: 'right'
  },
  // Review List Styles
  reviewsList: {
    marginTop: 16
  },
  reviewsLoading: {
    marginVertical: 20
  },
  noReviewsText: {
    textAlign: 'center',
    color: myTheme.mutedForeground,
    marginVertical: 20
  },
  reviewItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: myTheme.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: myTheme.border
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  reviewUserImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '500',
    color: myTheme.foreground
  },
  reviewDate: {
    fontSize: 12,
    color: myTheme.mutedForeground
  },
  reviewRating: {
    flexDirection: 'row'
  },
  reviewContent: {
    fontSize: 14,
    color: myTheme.foreground,
    lineHeight: 20,
    marginBottom: 8
  },
  reviewImages: {
    flexDirection: 'row',
    marginBottom: 8
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 8
  },
  reviewFooter: {
    borderTopWidth: 1,
    borderTopColor: myTheme.border,
    paddingTop: 8
  },
  reviewProductInfo: {
    fontSize: 12,
    color: myTheme.mutedForeground
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: myTheme.white
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border
  },
  modalCloseButton: {
    padding: 4
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: myTheme.foreground
  },
  modalContent: {
    padding: 16,
    paddingBottom: 80 // Extra padding for pagination
  },
  loadMoreButton: {
    backgroundColor: myTheme.muted,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20
  },
  loadMoreButtonText: {
    color: myTheme.foreground,
    fontWeight: '500'
  },
  emptyReviewsContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyReviewsText: {
    fontSize: 16,
    color: myTheme.mutedForeground
  },
  // Pagination Styles
  reviewPaginationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: myTheme.white,
    borderTopWidth: 1,
    borderTopColor: myTheme.border
  },
  paginationText: {
    fontSize: 14,
    color: myTheme.mutedForeground
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: myTheme.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  paginationButtonDisabled: {
    opacity: 0.5
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: myTheme.white,
    borderTopWidth: 1,
    borderTopColor: myTheme.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5
  },
  priceLabel: {
    fontSize: 12,
    color: myTheme.mutedForeground
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: myTheme.foreground
  },
  addToCartButton: {
    backgroundColor: myTheme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addToCartText: {
    color: myTheme.primaryForeground,
    fontSize: 16,
    fontWeight: '600'
  },
  // Special Event Styles
  specialEventContainer: {
    marginVertical: 12,
    backgroundColor: 'rgba(254, 226, 226, 0.3)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  specialEventBadge: {
    backgroundColor: myTheme.destructive,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 12
  },
  specialEventBadgeText: {
    color: myTheme.white,
    fontWeight: '700',
    fontSize: 12
  },
  specialEventInfo: {
    flex: 1
  },
  specialEventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: myTheme.foreground
  },
  specialEventTime: {
    fontSize: 12,
    color: myTheme.mutedForeground,
    marginTop: 2
  },
  waitingContainer: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: myTheme.muted,
    borderRadius: 4
  },
  waitingText: {
    fontSize: 14,
    color: myTheme.foreground,
    textAlign: 'center'
  },
  avatarFallback: {
    backgroundColor: myTheme.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarFallbackText: {
    color: myTheme.white,
    fontSize: 18,
    fontWeight: 'bold'
  }
})

export default ProductDetailScreen
