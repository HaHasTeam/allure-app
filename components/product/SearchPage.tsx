import { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Modal,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { height, myTheme } from "@/constants/index";
import type { IResponseProduct } from "@/types/product";
import useDebounce from "@/hooks/useDebounce";
import type { ICategory } from "@/types/category";
import { Slider } from "react-native-ui-lib";
import ProductCard from "./ProductCard";
import { PRICE_STEP, MAX_PRICE } from "@/constants/infor";
import {
  DiscountTypeEnum,
  OrderEnum,
  ProductEnum,
  StatusEnum,
} from "@/types/enum";
import { getCheapestClassification } from "@/utils/product";
import { calculateDiscountPrice } from "@/utils/price";

interface FilterOptions {
  categories?: string[];
  priceRange?: { min: number; max: number }; // Updated to non-nullable values
  sortBy?: string;
  statuses?: string[];
}

interface SearchPageProps {
  onBack: () => void;
  onSearch: (query: string) => void;
  initialValue?: string;
  products?: IResponseProduct[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  categories?: ICategory[];
  isCategoriesLoading?: boolean;
  onFilterChange: (filters: FilterOptions) => void;
  activeFilters: {
    categories: string[];
    priceRange: { min: number; max: number }; // Updated to non-nullable values
    sortBy: string;
    statuses: string[];
  };
}

const SearchPage = ({
  onBack,
  onSearch,
  initialValue = "",
  products = [],
  isLoading = false,
  onLoadMore,
  hasMore = false,
  categories = [],
  isCategoriesLoading = false,
  onFilterChange,
  activeFilters,
}: SearchPageProps) => {
  const [searchText, setSearchText] = useState(initialValue);
  const debouncedSearchText = useDebounce(searchText, 500); // 500ms debounce
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    categories: activeFilters.categories,
    priceRange: activeFilters.priceRange,
    sortBy: activeFilters.sortBy,
    statuses: activeFilters.statuses,
  });
  const [activeSortTab, setActiveSortTab] = useState("relevance");
  const [priceRange, setPriceRange] = useState({
    min: localFilters.priceRange.min || 0,
    max: localFilters.priceRange.max || MAX_PRICE,
  });
  // Add state for displayed values that update in real-time during slider interaction
  const [displayedPriceRange, setDisplayedPriceRange] = useState(priceRange);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList>(null);
  const prevDebouncedText = useRef(debouncedSearchText);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, []);

  useEffect(() => {
    setSearchText(initialValue);
  }, [initialValue]);

  // Update local filters when active filters change
  useEffect(() => {
    const newPriceRange = {
      min: activeFilters.priceRange.min || 0,
      max: activeFilters.priceRange.max || MAX_PRICE,
    };

    setLocalFilters({
      categories: activeFilters.categories,
      priceRange: activeFilters.priceRange,
      sortBy: activeFilters.sortBy,
      statuses: activeFilters.statuses,
    });
    setActiveSortTab(activeFilters.sortBy);
    setPriceRange(newPriceRange);
    setDisplayedPriceRange(newPriceRange);
  }, [activeFilters]);

  // Reset local filters to match active filters when modal is opened
  useEffect(() => {
    if (showFilters) {
      const newPriceRange = {
        min: activeFilters.priceRange.min || 0,
        max: activeFilters.priceRange.max || MAX_PRICE,
      };

      setLocalFilters({
        categories: [...activeFilters.categories],
        priceRange: { ...activeFilters.priceRange },
        sortBy: activeFilters.sortBy,
        statuses: [...activeFilters.statuses],
      });
      setPriceRange({ ...newPriceRange });
      setDisplayedPriceRange({ ...newPriceRange });
    }
  }, [showFilters, activeFilters]);

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

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const updatedCategories = localFilters.categories.includes(categoryId)
      ? localFilters.categories.filter((id) => id !== categoryId)
      : [...localFilters.categories, categoryId];

    setLocalFilters({
      ...localFilters,
      categories: updatedCategories,
    });
  };

  const handleSortChange = (sortOption: string) => {
    setActiveSortTab(sortOption);
    setLocalFilters({
      ...localFilters,
      sortBy: sortOption,
    });
    onFilterChange({
      ...localFilters,
      sortBy: sortOption,
    });
  };

  const handleSliderTouchStart = () => {
    // Use requestAnimationFrame to avoid UI blocking
    requestAnimationFrame(() => {
      setIsDragging(true);
    });
  };

  const handleSliderTouchEnd = () => {
    // Use requestAnimationFrame to avoid UI blocking
    requestAnimationFrame(() => {
      setIsDragging(false);
      // Update the actual price range when dragging ends
      setPriceRange({ ...displayedPriceRange });
      setLocalFilters({
        ...localFilters,
        priceRange: {
          min: displayedPriceRange.min,
          max: displayedPriceRange.max,
        },
      });
    });
  };

  const handleRangeChange = (values: { min: number; max: number }) => {
    // Use requestAnimationFrame to optimize UI updates
    requestAnimationFrame(() => {
      setDisplayedPriceRange({ ...values });
    });
  };

  const handleApplyFilters = () => {
    // Make a deep copy of the localFilters to avoid reference issues
    const filtersToApply = {
      categories: [...localFilters.categories],
      priceRange: {
        min: localFilters.priceRange.min,
        max: localFilters.priceRange.max,
      },
      sortBy: localFilters.sortBy,
      statuses: [...localFilters.statuses],
    };

    // Force the parent component to recognize this as a new filter set
    onFilterChange({ ...filtersToApply });
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    // Create a completely new reset filters object with non-null price values
    const resetFilters = {
      categories: [],
      priceRange: { min: 0, max: MAX_PRICE },
      sortBy: "relevance",
      statuses: [],
    };
    const resetRange = {
      min: 0,
      max: MAX_PRICE,
    };

    // Update all local state
    setLocalFilters({ ...resetFilters });
    setActiveSortTab("relevance");
    setPriceRange({ ...resetRange });
    setDisplayedPriceRange({ ...resetRange });

    onFilterChange({ ...resetFilters });
    setShowFilters(false);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={myTheme.primary} />
      </View>
    );
  };

  const handleEndReached = () => {
    if (!isLoading && hasMore && onLoadMore) {
      onLoadMore();
    }
  };

  const renderSortTabs = () => {
    return (
      <View style={styles.sortTabsContainer}>
        <TouchableOpacity
          style={[
            styles.sortTab,
            activeSortTab === "relevance" && styles.sortTabActive,
          ]}
          onPress={() => handleSortChange("relevance")}
        >
          <Text
            style={[
              styles.sortTabText,
              activeSortTab === "relevance" && styles.sortTabTextActive,
            ]}
          >
            Liên quan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortTab,
            activeSortTab === "newest" && styles.sortTabActive,
          ]}
          onPress={() => handleSortChange("newest")}
        >
          <Text
            style={[
              styles.sortTabText,
              activeSortTab === "newest" && styles.sortTabTextActive,
            ]}
          >
            Mới nhất
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortTab,
            activeSortTab === "bestSelling" && styles.sortTabActive,
          ]}
          onPress={() => handleSortChange("bestSelling")}
        >
          <Text
            style={[
              styles.sortTabText,
              activeSortTab === "bestSelling" && styles.sortTabTextActive,
            ]}
          >
            Bán chạy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortTab,
            (activeSortTab === "priceLowToHigh" ||
              activeSortTab === "priceHighToLow") &&
              styles.sortTabActive,
          ]}
          onPress={() =>
            handleSortChange(
              activeSortTab === "priceLowToHigh"
                ? "priceHighToLow"
                : "priceLowToHigh"
            )
          }
        >
          <View style={styles.priceTabContainer}>
            <Text
              style={[
                styles.sortTabText,
                (activeSortTab === "priceLowToHigh" ||
                  activeSortTab === "priceHighToLow") &&
                  styles.sortTabTextActive,
              ]}
            >
              Giá
            </Text>
            <MaterialIcons
              name={
                activeSortTab === "priceLowToHigh"
                  ? "arrow-upward"
                  : "arrow-downward"
              }
              size={14}
              color={
                activeSortTab === "priceLowToHigh" ||
                activeSortTab === "priceHighToLow"
                  ? myTheme.primary
                  : "#757575"
              }
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const setQuickPriceRange = (min: number, max: number) => {
    const newRange = { min, max };
    setPriceRange({ ...newRange });
    setDisplayedPriceRange({ ...newRange });
    setLocalFilters({
      ...localFilters,
      priceRange: { min, max },
    });
  };

  const renderFilters = () => {
    return (
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.filterModalContainer}>
          <View style={styles.filterModalContent}>
            <View style={styles.filterHeader}>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                style={styles.backButton}
              >
                <Feather name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.filterTitle}>Bộ lọc tìm kiếm</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.filterScrollView}>
              {/* Categories Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Theo Danh Mục</Text>
                <View style={styles.filterCategoryGrid}>
                  {categories
                    .filter((category) => category.level === 1) // Only show level 1 categories
                    .map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.filterCategoryItem,
                          localFilters.categories.includes(category.id) &&
                            styles.filterCategoryItemActive,
                        ]}
                        onPress={() => handleCategoryToggle(category.id)}
                      >
                        <Text
                          style={[
                            styles.filterCategoryText,
                            localFilters.categories.includes(category.id) &&
                              styles.filterCategoryTextActive,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>

              {/* Price Range Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Khoảng Giá</Text>

                {/* Price display */}
                <View style={styles.priceRangeContainer}>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Từ</Text>
                    <Text
                      style={[
                        styles.priceValue,
                        isDragging && styles.priceValueActive,
                      ]}
                    >
                      {formatPrice(displayedPriceRange.min)}
                    </Text>
                  </View>
                  <View style={styles.priceSeparator} />
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Đến</Text>
                    <Text
                      style={[
                        styles.priceValue,
                        isDragging && styles.priceValueActive,
                      ]}
                    >
                      {formatPrice(displayedPriceRange.max)}
                    </Text>
                  </View>
                </View>

                {/* Single price range slider */}
                <View style={styles.sliderContainer}>
                  <Slider
                    minimumValue={0}
                    maximumValue={MAX_PRICE}
                    step={PRICE_STEP}
                    onRangeChange={handleRangeChange}
                    containerStyle={styles.sliderContainerStyle}
                    trackStyle={styles.sliderTrack}
                    minimumTrackTintColor={myTheme.primary}
                    maximumTrackTintColor="#D9D9D9"
                    thumbTintColor={myTheme.primary}
                    thumbStyle={styles.sliderThumb}
                    initialMinimumValue={priceRange.min}
                    initialMaximumValue={priceRange.max}
                    useRange={true}
                    onSeekStart={handleSliderTouchStart}
                    onSeekEnd={handleSliderTouchEnd}
                  />
                </View>

                {/* Quick price options */}
                <View style={styles.priceQuickOptions}>
                  <TouchableOpacity
                    style={[
                      styles.priceQuickOption,
                      priceRange.min === 0 &&
                        priceRange.max === 100000 &&
                        styles.priceQuickOptionActive,
                    ]}
                    onPress={() => setQuickPriceRange(0, 100000)}
                  >
                    <Text style={styles.priceQuickOptionText}>0-100k</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.priceQuickOption,
                      priceRange.min === 100000 &&
                        priceRange.max === 300000 &&
                        styles.priceQuickOptionActive,
                    ]}
                    onPress={() => setQuickPriceRange(100000, 300000)}
                  >
                    <Text style={styles.priceQuickOptionText}>100k-300k</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.priceQuickOption,
                      priceRange.min === 300000 &&
                        priceRange.max === 500000 &&
                        styles.priceQuickOptionActive,
                    ]}
                    onPress={() => setQuickPriceRange(300000, 500000)}
                  >
                    <Text style={styles.priceQuickOptionText}>300k-500k</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetButtonText}>Thiết lập lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  const renderProductCard = ({ item: product }: { item: IResponseProduct }) => {
    const productClassifications = product?.productClassifications?.filter(
      (classification) => classification.status === StatusEnum.ACTIVE
    );
    const productClassification = getCheapestClassification(
      product.productClassifications ?? []
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
      : product.status === ProductEnum.OFFICIAL
      ? ""
      : product.status;

    const mockProduct = {
      id: product.id,
      name: product.name,
      tag: productTag,
      price: productClassification?.price ?? -1,
      currentPrice,
      images: product.images,
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
      description: product.description,
      detail: product.detail,
      rating: Number(product.averageRating),
      ratingAmount: Number(product.totalRatings),
      soldInPastMonth: Number(product.salesLast30Days),
      salesLast30Days: Number(product.salesLast30Days),
      classifications: productClassifications,
      certificates: product.certificates,
    };

    return (
      <ProductCard
        key={product?.id}
        product={mockProduct}
        isProductDiscount={productTag === OrderEnum.FLASH_SALE}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={myTheme.primary} />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            value={searchText}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity onPress={toggleFilters} style={styles.filterButton}>
          <Feather name="filter" size={20} color={myTheme.primary} />
          <Text style={styles.filterButtonText}>Lọc</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Tabs */}
      {renderSortTabs()}

      {/* Filters Modal */}
      {renderFilters()}

      {/* Search Results */}
      <FlatList
        ref={listRef}
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={myTheme.primary} />
            ) : (
              <Text style={styles.emptyText}>
                {searchText.length > 0
                  ? `Không tìm thấy kết quả cho "${searchText}"`
                  : "Nhập từ khóa để tìm kiếm"}
              </Text>
            )}
          </View>
        }
        // ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myTheme.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: myTheme.white,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border,
  },
  backButton: {
    padding: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: myTheme.white,
    borderWidth: 1,
    borderColor: myTheme.primary,
    borderRadius: 4,
    height: 36,
    marginHorizontal: 8,
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    color: myTheme.foreground,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  filterButtonText: {
    color: myTheme.primary,
    fontSize: 12,
    marginLeft: 2,
  },
  sortTabsContainer: {
    flexDirection: "row",
    backgroundColor: myTheme.white,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border,
  },
  sortTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sortTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: myTheme.primary,
  },
  sortTabText: {
    fontSize: 13,
    color: myTheme.grey,
  },
  sortTabTextActive: {
    color: myTheme.primary,
    fontWeight: "500",
  },
  priceTabContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  filterModalContent: {
    flex: 1,
    backgroundColor: myTheme.white,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: myTheme.foreground,
  },
  filterScrollView: {
    flex: 1,
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: myTheme.lightGrey,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    color: myTheme.foreground,
  },
  filterCategoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterCategoryItem: {
    width: "48%",
    backgroundColor: myTheme.lightGrey,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 8,
    marginRight: "4%",
  },
  filterCategoryItemActive: {
    backgroundColor: myTheme.lightPrimary,
    borderColor: myTheme.primary,
    borderWidth: 1,
  },
  filterCategoryText: {
    fontSize: 12,
    color: myTheme.foreground,
    textAlign: "center",
  },
  filterCategoryTextActive: {
    color: myTheme.primary,
    fontWeight: "500",
  },
  priceDisplayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priceDisplayText: {
    fontSize: 14,
    color: myTheme.primary,
    fontWeight: "500",
    marginTop: 4,
  },
  sliderContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: myTheme.grey,
    marginBottom: 4,
  },
  priceQuickOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  priceQuickOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: myTheme.lightGrey,
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 4,
  },
  priceQuickOptionActive: {
    backgroundColor: myTheme.lightPrimary,
    borderColor: myTheme.primary,
    borderWidth: 1,
  },
  priceQuickOptionText: {
    fontSize: 12,
    color: myTheme.foreground,
  },
  filterActions: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: myTheme.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: myTheme.border,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    color: myTheme.foreground,
    fontSize: 14,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: myTheme.primary,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: myTheme.white,
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    padding: 4,
    paddingBottom: 80,
  },
  productRow: {
    justifyContent: "space-between",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.3,
  },
  emptyText: {
    fontSize: 14,
    color: myTheme.grey,
    textAlign: "center",
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  sliderContainerStyle: {
    height: 40,
    marginVertical: 6,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: myTheme.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sliderValueText: {
    fontSize: 14,
    color: myTheme.primary,
    fontWeight: "500",
    marginTop: 4,
  },
  priceRangeTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  // New styles for the improved price display
  priceRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: myTheme.lightGrey,
    borderRadius: 8,
    padding: 12,
  },
  priceBox: {
    flex: 1,
    alignItems: "center",
  },
  priceSeparator: {
    width: 1,
    height: 30,
    backgroundColor: myTheme.border,
    marginHorizontal: 10,
  },
  priceLabel: {
    fontSize: 12,
    color: myTheme.grey,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    color: myTheme.primary,
    fontWeight: "600",
  },
  priceValueActive: {
    color: myTheme.primary,
    fontWeight: "700",
  },
  // Styles for thumb value tooltips
  thumbValueContainer: {
    position: "absolute",
    bottom: 30,
    backgroundColor: myTheme.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  thumbValueText: {
    color: myTheme.white,
    fontSize: 12,
    fontWeight: "600",
  },
});

export default SearchPage;
