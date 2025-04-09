"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { height, myTheme } from "@/constants/index";
import type { IResponseProduct } from "@/types/product";
import { getCheapestClassification } from "@/utils/product";
import {
  DiscountTypeEnum,
  OrderEnum,
  ProductEnum,
  StatusEnum,
} from "@/types/enum";
import { calculateDiscountPrice } from "@/utils/price";
import useDebounce from "@/hooks/useDebounce";
import { useTranslation } from "react-i18next";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  initialValue?: string;
  products?: IResponseProduct[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const SearchModal = ({
  visible,
  onClose,
  onSearch,
  initialValue,
  products = [],
  isLoading = false,
  onLoadMore,
  hasMore = false,
}: SearchModalProps) => {
  const [searchText, setSearchText] = useState(initialValue);
  const { t } = useTranslation();
  const debouncedSearchText = useDebounce(searchText, 500); // 500ms debounce
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList>(null);
  const prevDebouncedText = useRef(debouncedSearchText);

  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [visible]);

  // Only update searchText from initialValue when the modal becomes visible
  useEffect(() => {
    if (visible) {
      setSearchText(initialValue);
    }
  }, [initialValue, visible]);

  // Safe search effect that prevents loops
  useEffect(() => {
    // Only trigger search if the debounced text has actually changed
    if (debouncedSearchText !== prevDebouncedText.current) {
      prevDebouncedText.current = debouncedSearchText;

      if (debouncedSearchText.trim().length > 2) {
        onSearch(debouncedSearchText);
      } else if (debouncedSearchText === "") {
        onSearch("");
      }
    }
  }, [debouncedSearchText, onSearch]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const renderProductItem = ({ item }: { item: IResponseProduct }) => {
    const productClassifications = item?.productClassifications?.filter(
      (classification) => classification.status === StatusEnum.ACTIVE
    );
    const productClassification = getCheapestClassification(
      item.productClassifications ?? []
    );
    const isActive = productClassification?.status === StatusEnum.ACTIVE;
    const hasDiscount = isActive && productClassification?.productDiscount;
    const hasPreOrder = isActive && productClassification?.preOrderProduct;

    const currentPrice = calculateDiscountPrice(
      productClassification?.price ?? 0,
      hasDiscount ? productClassification?.productDiscount?.discount : 0,
      DiscountTypeEnum.PERCENTAGE
    );

    const productTag = hasPreOrder
      ? OrderEnum.PRE_ORDER
      : hasDiscount
      ? OrderEnum.FLASH_SALE
      : item.status === ProductEnum.OFFICIAL
      ? ""
      : item.status;

    const mockProduct = {
      id: item.id,
      name: item.name,
      tag: productTag,
      price: productClassification?.price ?? -1,
      currentPrice,
      images: item.images,
      deal: hasDiscount ? productClassification?.productDiscount?.discount : 0,
      flashSale: hasDiscount
        ? {
            productAmount: (
              productClassification?.productDiscount?.productClassifications ??
              []
            ).filter(
              (classification) => classification?.status === StatusEnum.ACTIVE
            )?.[0].quantity,
            soldAmount: 65,
          }
        : null,
      description: item.description,
      detail: item.detail,
      rating: Number(item.averageRating),
      ratingAmount: Number(item.totalRatings),
      soldInPastMonth: Number(item.salesLast30Days),
      salesLast30Days: Number(item.salesLast30Days),
      classifications: productClassifications,
      certificates: item.certificates,
    };
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => {
          // Handle product selection
          onClose();
          // Navigate to product detail or perform other actions
        }}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: mockProduct.images?.[0]?.fileUrl }}
            style={styles.productImage}
          />
        </View>
        <View style={styles.productContent}>
          <Text style={styles.productName} numberOfLines={1}>
            {mockProduct.name}
          </Text>
          <Text style={styles.productPrice}>
            {t("productCard.price", { price: mockProduct?.price })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleEndReached = () => {
    if (!isLoading && hasMore && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={myTheme.primary} />
          </TouchableOpacity>

          <View style={styles.searchInputContainer}>
            <Feather
              name="search"
              size={18}
              color={myTheme.primary}
              style={styles.searchIcon}
            />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchText}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.clearButton}
              >
                <Feather name="x" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        <FlatList
          ref={listRef}
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {isLoading ? (
                <ActivityIndicator size="large" color={myTheme.primary} />
              ) : (
                <Text style={styles.emptyText}>
                  {searchText.length > 0
                    ? `No results found for "${searchText}"`
                    : "Start typing to search products"}
                </Text>
              )}
            </View>
          }
          // ListFooterComponent={renderFooter}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
    minHeight: height * 0.5,
  },
  productItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 12,
  },
  productImage: {
    width: "100%",
    height: "100%",
    aspectRatio: 1,
  },
  productContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    color: myTheme.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.3,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default SearchModal;
