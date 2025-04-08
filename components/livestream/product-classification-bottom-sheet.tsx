"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import type { IClassification } from "@/types/classification";
import { calculateDiscountPrice } from "@/utils/price";
import { DiscountTypeEnum } from "@/types/enum";

const { width } = Dimensions.get("window");

interface ProductClassificationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  productName: string;
  classifications: IClassification[];
  onAddToCart: (
    classificationId: string,
    quantity: number,
    title?: string
  ) => void;
  onBuyNow: (
    classificationId: string,
    quantity: number,
    title?: string
  ) => void;
  actionType: "cart" | "buy";
  livestreamDiscount?: number; // Add livestream discount prop
}

const ProductClassificationBottomSheet = ({
  visible,
  onClose,
  productName,
  classifications,
  onAddToCart,
  onBuyNow,
  actionType,
  livestreamDiscount = 0, // Default to 0 if not provided
}: ProductClassificationBottomSheetProps) => {
  const { t } = useTranslation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedClassification, setSelectedClassification] = useState<
    string | null
  >(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] =
    useState<IClassification | null>(null);

  // Effect to open/close the bottom sheet based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
      // Set default selected classification if available
      if (classifications.length > 0 && !selectedClassification) {
        setSelectedClassification(classifications[0].id);
        setSelectedVariant(classifications[0]);
      }
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible, classifications, selectedClassification]);

  // Update selected variant when classification changes
  useEffect(() => {
    if (selectedClassification) {
      const variant = classifications.find(
        (c) => c.id === selectedClassification
      );
      if (variant) {
        setSelectedVariant(variant);
      }
    }
  }, [selectedClassification, classifications]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleIncreaseQuantity = () => {
    // Check if selected classification has a quantity limit
    if (selectedVariant && quantity < selectedVariant.quantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleConfirm = () => {
    if (!selectedClassification) return;

    // Get the selected classification object to access its title
    const selectedVariantObj = classifications.find(
      (c) => c.id === selectedClassification
    );
    const title = selectedVariantObj?.title;

    if (actionType === "cart") {
      onAddToCart(selectedClassification, quantity, title);
    } else {
      onBuyNow(selectedClassification, quantity, title);
    }

    // Reset state
    setQuantity(1);
    onClose();
  };

  // Get the first image of the selected variant or the first classification
  const getVariantImage = () => {
    if (
      selectedVariant &&
      selectedVariant.images &&
      selectedVariant.images.length > 0
    ) {
      return selectedVariant.images[0].fileUrl;
    } else if (
      classifications.length > 0 &&
      classifications[0].images &&
      classifications[0].images.length > 0
    ) {
      return classifications[0].images[0].fileUrl;
    }
    return "https://via.placeholder.com/100";
  };

  // Calculate discounted price if livestream discount is available
  const getDiscountedPrice = (originalPrice: number) => {
    if (livestreamDiscount && livestreamDiscount > 0) {
      return calculateDiscountPrice(
        originalPrice,
        livestreamDiscount,
        DiscountTypeEnum.PERCENTAGE
      );
    }
    return originalPrice;
  };

  // Format price with currency
  const formatPrice = (price: number) => {
    return t("productCard.price", { price });
  };

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={["85%"]}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Product Summary */}
          <View style={styles.productSummary}>
            <Image
              source={{ uri: getVariantImage() }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {productName}
              </Text>
              {selectedVariant && (
                <>
                  {livestreamDiscount > 0 ? (
                    <View style={styles.priceContainer}>
                      <Text style={styles.discountedPrice}>
                        {formatPrice(getDiscountedPrice(selectedVariant.price))}
                      </Text>
                      <Text style={styles.originalPrice}>
                        {formatPrice(selectedVariant.price)}
                      </Text>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                          -{livestreamDiscount * 100}%
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.productPrice}>
                      {formatPrice(selectedVariant.price)}
                    </Text>
                  )}
                </>
              )}
              {selectedVariant && (
                <Text style={styles.stockInfo}>
                  {t("productCard.inStock", {
                    quantity: selectedVariant.quantity,
                  })}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Classification Selection */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t("cart.selectVariant")}</Text>
            <View style={styles.variantsContainer}>
              {classifications.map((item) => {
                const isSelected = selectedClassification === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.variantChip,
                      isSelected && styles.selectedVariantChip,
                      item.quantity <= 0 && styles.disabledVariantChip,
                    ]}
                    onPress={() => {
                      if (item.quantity > 0) {
                        setSelectedClassification(item.id);
                      }
                    }}
                    disabled={item.quantity <= 0}
                  >
                    <Text
                      style={[
                        styles.variantChipText,
                        isSelected && styles.selectedVariantChipText,
                        item.quantity <= 0 && styles.disabledVariantChipText,
                      ]}
                    >
                      {item.title}
                    </Text>
                    {item.quantity <= 0 && (
                      <Text style={styles.outOfStockText}>
                        {t("productCard.outOfStock")}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Quantity Selection */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t("cart.quantity")}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity <= 1 && styles.quantityButtonDisabled,
                ]}
                onPress={handleDecreaseQuantity}
                disabled={quantity <= 1}
              >
                <Feather
                  name="minus"
                  size={18}
                  color={quantity <= 1 ? "#CBD5E1" : "#000"}
                />
              </TouchableOpacity>

              <View style={styles.quantityValueContainer}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  selectedVariant &&
                    quantity >= selectedVariant.quantity &&
                    styles.quantityButtonDisabled,
                ]}
                onPress={handleIncreaseQuantity}
                disabled={
                  selectedVariant ? quantity >= selectedVariant.quantity : false
                }
              >
                <Feather
                  name="plus"
                  size={18}
                  color={
                    selectedVariant && quantity >= selectedVariant.quantity
                      ? "#CBD5E1"
                      : "#000"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          {selectedVariant && (
            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPriceLabel}>{t("cart.totalPrice")}</Text>
              <Text style={styles.totalPriceValue}>
                {formatPrice(
                  getDiscountedPrice(selectedVariant.price) * quantity
                )}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedClassification && styles.disabledButton,
            ]}
            onPress={handleConfirm}
            disabled={!selectedClassification}
          >
            <Text style={styles.confirmButtonText}>
              {actionType === "cart" ? t("cart.addToCart") : t("cart.buyNow")}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    padding: 4,
  },
  productSummary: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ef4444",
    marginBottom: 4,
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ef4444",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: "#94a3b8",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  stockInfo: {
    fontSize: 14,
    color: "#6b7280",
  },
  divider: {
    height: 8,
    backgroundColor: "#f3f4f6",
    width: "100%",
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  variantsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  variantChip: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    minWidth: 80,
    alignItems: "center",
  },
  selectedVariantChip: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  disabledVariantChip: {
    borderColor: "#e5e7eb",
    backgroundColor: "#f3f4f6",
  },
  variantChipText: {
    fontSize: 14,
    color: "#4b5563",
  },
  selectedVariantChipText: {
    color: "#ef4444",
    fontWeight: "500",
  },
  disabledVariantChipText: {
    color: "#9ca3af",
  },
  outOfStockText: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    borderColor: "#e5e7eb",
    backgroundColor: "#f3f4f6",
  },
  quantityValueContainer: {
    width: 50,
    height: 36,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  totalPriceContainer: {
    flex: 1,
  },
  totalPriceLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  totalPriceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ef4444",
  },
  confirmButton: {
    backgroundColor: "#ef4444",
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 150,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#f3f4f6",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProductClassificationBottomSheet;
