import { useState, useEffect } from "react";
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
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AntDesign,
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { myTheme } from "@/constants";
import { getFeedbackGeneralOfProductApi } from "@/hooks/api/feedback/index";
import { getProductApi } from "@/hooks/api/product/index";
import type { IClassification } from "@/types/classification";

const { width } = Dimensions.get("window");

interface ProductDetailScreenProps {
  initProductId?: string;
  isInGroupBuying?: boolean;
}

const ProductDetailScreen = ({
  initProductId,
  isInGroupBuying = false,
}: ProductDetailScreenProps) => {
  const router = useRouter();

  // Get product ID from props or route params
  const { productId: routeProductId } = useLocalSearchParams<{
    productId: string;
  }>();
  const productId = initProductId || routeProductId;

  // Fetch product data
  const {
    data: productResponse,
    isFetching: isLoadingProduct,
    error: productError,
    refetch: refetchProduct,
  } = useQuery({
    queryKey: [getProductApi.queryKey, productId],
    queryFn: getProductApi.fn,
    enabled: !!productId,
  });

  // Fetch review data
  const {
    data: reviewGeneral,
    isFetching: isFetchingReviewGeneral,
    error: reviewError,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: [getFeedbackGeneralOfProductApi.queryKey, productId],
    queryFn: getFeedbackGeneralOfProductApi.fn,
    enabled: !!productId,
  });

  const product = productResponse?.data;
  const reviewData = reviewGeneral?.data;

  // State for UI
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<IClassification | null>(
    null
  );
  const [isFavorite, setIsFavorite] = useState(false);

  // Update selected size when product data is loaded
  useEffect(() => {
    if (product?.productClassifications?.length) {
      setSelectedSize(product.productClassifications[0]);
    }
  }, [product]);

  const handleSizeSelect = (classification: IClassification) => {
    setSelectedSize(classification);
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;

    console.log("Added to cart:", {
      product: product.name,
      size: selectedSize.size,
      price: selectedSize.price,
    });

    // Navigate back or to cart
    router.back();
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleRetry = () => {
    refetchProduct();
    refetchReviews();
  };

  const handleGoBack = () => {
    router.back();
  };

  // Loading state
  if (isLoadingProduct || isFetchingReviewGeneral) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={myTheme.primary} />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (productError || reviewError || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load product details</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={myTheme.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Feather name="arrow-left" size={24} color={myTheme.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <AntDesign
              name={isFavorite ? "heart" : "hearto"}
              size={22}
              color={myTheme.white}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <Feather name="share" size={22} color={myTheme.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Product Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                product.images[currentImageIndex]?.fileUrl ||
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-cdUFYWrZKjemXwWjckRqxZ4DdzChHV.png",
            }}
            style={styles.productImage}
            resizeMode="cover"
          />

          {/* Image Indicators */}
          <View style={styles.indicators}>
            {product.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  currentImageIndex === index && styles.activeIndicator,
                ]}
                onPress={() => handleImageChange(index)}
              />
            ))}
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          {/* Category */}
          <Text style={styles.category}>
            {product.category?.name || "Skin Care"}
          </Text>

          {/* Product Name and Rating */}
          <View style={styles.nameRatingContainer}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.ratingContainer}>
              <AntDesign
                name="star"
                size={18}
                color="#FFD700"
                style={styles.starIcon}
              />
              <Text style={styles.rating}>
                {reviewData?.averageRating || product.rating || "0.0"}
              </Text>
            </View>
          </View>

          {/* Seller Info */}
          <Text style={styles.sellerLabel}>Seller</Text>
          <View style={styles.sellerContainer}>
            <Image
              source={{
                uri:
                  product.brand?.logo || "/placeholder.svg?height=40&width=40",
              }}
              style={styles.sellerImage}
            />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>
                {product.brand?.name || "Brand Name"}
              </Text>
              <Text style={styles.sellerCompany}>
                {product.brand?.description || "Brand Description"}
              </Text>
            </View>
            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactButton}>
                <MaterialIcons name="chat" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton}>
                <MaterialIcons name="phone" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Size Selection */}
          {product.productClassifications &&
            product.productClassifications.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Select Size</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.sizesContainer}
                >
                  {product.productClassifications.map((classification) => (
                    <TouchableOpacity
                      key={classification.id}
                      style={[
                        styles.sizeButton,
                        selectedSize?.id === classification.id &&
                          styles.selectedSizeButton,
                      ]}
                      onPress={() => handleSizeSelect(classification)}
                    >
                      <Text
                        style={[
                          styles.sizeText,
                          selectedSize?.id === classification.id &&
                            styles.selectedSizeText,
                        ]}
                      >
                        {classification.size || classification.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

          {/* Product Details Section */}
          <Text style={styles.sectionTitle}>Product Details</Text>
          <Text style={styles.detailText}>
            {product.description || product.detail}
          </Text>

          {/* Group Buying Info (if applicable) */}
          {isInGroupBuying && (
            <View style={styles.groupBuyingContainer}>
              <Text style={styles.sectionTitle}>Group Buying</Text>
              <View style={styles.groupBuyingInfo}>
                <Text style={styles.groupBuyingText}>
                  Join with others to get a special discount!
                </Text>
                <Text style={styles.groupBuyingDiscount}>
                  Save up to 20% when buying in a group
                </Text>
              </View>
            </View>
          )}

          {/* Reviews Summary */}
          {reviewData && (
            <View style={styles.reviewsContainer}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <View style={styles.reviewSummary}>
                <View style={styles.ratingBig}>
                  <Text style={styles.ratingBigNumber}>
                    {reviewData.averageRating}
                  </Text>
                  <Text style={styles.ratingBigText}>out of 5</Text>
                </View>
                <View style={styles.ratingBars}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <View key={star} style={styles.ratingBar}>
                      <Text style={styles.ratingBarText}>
                        {star}{" "}
                        <AntDesign name="star" size={12} color="#FFD700" />
                      </Text>
                      <View style={styles.ratingBarBg}>
                        <View
                          style={[
                            styles.ratingBarFill,
                            {
                              width: `${
                                ((reviewData[
                                  `rating${star}Count` as keyof typeof reviewData
                                ] as number) /
                                  reviewData.totalCount) *
                                100
                              }%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.ratingBarCount}>
                        {
                          reviewData[
                            `rating${star}Count` as keyof typeof reviewData
                          ]
                        }
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
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
            ${selectedSize?.price || product.price}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <MaterialCommunityIcons
            name="shopping"
            size={20}
            color={myTheme.primaryForeground}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myTheme.white,
  },
  header: {
    backgroundColor: myTheme.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: myTheme.white,
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: myTheme.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: myTheme.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: myTheme.foreground,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: myTheme.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: myTheme.destructive,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: myTheme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: myTheme.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
  imageContainer: {
    width: "100%",
    height: width * 0.8,
    backgroundColor: myTheme.primary,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  indicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: myTheme.white,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: myTheme.white,
  },
  category: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    marginBottom: 4,
  },
  nameRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  productName: {
    fontSize: 22,
    fontWeight: "600",
    color: myTheme.foreground,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: myTheme.foreground,
  },
  sellerLabel: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    marginBottom: 8,
  },
  sellerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  sellerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "500",
    color: myTheme.foreground,
  },
  sellerCompany: {
    fontSize: 12,
    color: myTheme.mutedForeground,
  },
  contactButtons: {
    flexDirection: "row",
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: myTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: myTheme.foreground,
    marginBottom: 12,
  },
  sizesContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: myTheme.secondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: myTheme.secondary,
  },
  selectedSizeButton: {
    backgroundColor: myTheme.primary,
    borderColor: myTheme.primary,
  },
  sizeText: {
    fontSize: 14,
    color: myTheme.secondaryForeground,
  },
  selectedSizeText: {
    color: myTheme.primaryForeground,
  },
  detailText: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    lineHeight: 20,
    marginBottom: 24,
  },
  groupBuyingContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: myTheme.lightPrimary,
    borderRadius: 12,
  },
  groupBuyingInfo: {
    marginTop: 8,
  },
  groupBuyingText: {
    fontSize: 14,
    color: myTheme.foreground,
    marginBottom: 4,
  },
  groupBuyingDiscount: {
    fontSize: 16,
    fontWeight: "600",
    color: myTheme.primary,
  },
  reviewsContainer: {
    marginBottom: 24,
  },
  reviewSummary: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingBig: {
    alignItems: "center",
    marginRight: 20,
    width: 80,
  },
  ratingBigNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: myTheme.foreground,
  },
  ratingBigText: {
    fontSize: 12,
    color: myTheme.mutedForeground,
  },
  ratingBars: {
    flex: 1,
  },
  ratingBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingBarText: {
    width: 40,
    fontSize: 12,
    color: myTheme.mutedForeground,
  },
  ratingBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: myTheme.muted,
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: myTheme.primary,
  },
  ratingBarCount: {
    width: 30,
    fontSize: 12,
    color: myTheme.mutedForeground,
    textAlign: "right",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: myTheme.white,
    borderTopWidth: 1,
    borderTopColor: myTheme.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  priceLabel: {
    fontSize: 12,
    color: myTheme.mutedForeground,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: myTheme.foreground,
  },
  addToCartButton: {
    backgroundColor: myTheme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartText: {
    color: myTheme.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProductDetailScreen;
