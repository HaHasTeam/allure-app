import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import SearchPage from '@/components/product/SearchPage'
import { ProductTagEnum } from '@/types/enum'
import { useRouter } from 'expo-router'
import { getAllCategoryApi } from '@/hooks/api/category'
import { getProductFilterApi } from '@/hooks/api/product'
import { MAX_PRICE } from '@/constants/infor'

const SearchScreen = () => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(20)
  const [sortOption, setSortOption] = useState('relevance')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = useState({
    min: 0,
    max: MAX_PRICE
  })
  // Map sort option to ProductTagEnum
  const getSortByValue = () => {
    switch (sortOption) {
      case 'priceLowToHigh':
        return ProductTagEnum.PRICE_ASC
      case 'priceHighToLow':
        return ProductTagEnum.PRICE_DESC
      case 'bestSelling':
        return ProductTagEnum.BEST_SELLER
      case 'newest':
        return ProductTagEnum.NEW
      case 'hot':
        return ProductTagEnum.HOT
      default:
        return undefined
    }
  }

  // Build query parameters object
  const buildQueryParams = () => {
    const params: any = {
      page: currentPage,
      limit: limit
    }
    params.search = query.trim()

    // Add sort order if it's price-related
    if (sortOption === 'priceLowToHigh') {
      params.order = 'ASC'
    } else if (sortOption === 'priceHighToLow') {
      params.order = 'DESC'
    }

    // Add sortBy if it's not the default
    const sortByValue = getSortByValue()
    if (sortByValue) {
      params.sortBy = sortByValue.toString()
    }

    // Only add category filter if categories are selected
    if (selectedCategories.length > 0) {
      params.categoryId = selectedCategories.join()
    }

    // Only add status filter if statuses are selected
    if (selectedStatuses.length > 0) {
      params.statuses = selectedStatuses.join()
    }

    // Only add price range filters if they are not the default values
    if (selectedPriceRange.min >= 0) {
      params.minPrice = selectedPriceRange.min
    }

    if (selectedPriceRange.max <= MAX_PRICE) {
      params.maxPrice = selectedPriceRange.max
    }

    return params
  }

  // Determine if we should enable the query
  const shouldEnableQuery = () => {
    return selectedCategories.length > 0 || selectedStatuses.length > 0 || selectedPriceRange.max <= MAX_PRICE
  }
  // Fetch product data with filters
  const { data: productData, isFetching } = useQuery({
    queryKey: [getProductFilterApi.queryKey, buildQueryParams()],
    queryFn: getProductFilterApi.fn,
    enabled: shouldEnableQuery()
  })

  // Fetch category data
  const { data: categoryListData, isLoading: isCategoryListLoading } = useQuery({
    queryKey: [getAllCategoryApi.queryKey],
    queryFn: getAllCategoryApi.fn
  })

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    setCurrentPage(1) // Reset to first page on new search
  }

  const handleLoadMore = () => {
    if (!isFetching && productData?.data) {
      const { total, page, limit } = productData.data
      const hasNextPage = Number(page) * Number(limit) < Number(total)

      if (hasNextPage) {
        setCurrentPage((prev) => prev + 1)
      }
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleFilterChange = (filters: {
    categories?: string[]
    priceRange?: { min: number; max: number }
    sortBy?: string
    statuses?: string[]
  }) => {
    // Create new state objects to ensure React detects the change
    let filtersChanged = false

    if (filters.categories !== undefined) {
      setSelectedCategories([...filters.categories])
      filtersChanged = true
    }

    if (filters.priceRange !== undefined) {
      setSelectedPriceRange({ ...filters.priceRange })
      filtersChanged = true
    }

    if (filters.sortBy !== undefined) {
      setSortOption(filters.sortBy)
      filtersChanged = true
    }

    if (filters.statuses !== undefined) {
      setSelectedStatuses([...filters.statuses])
      filtersChanged = true
    }

    // Always reset to first page when filters change
    if (filtersChanged) {
      setCurrentPage(1)
    }
  }

  // Extract products from the response
  const products = productData?.data?.items || []

  // Check if there are more pages
  const hasMore = productData?.data
    ? Number(productData.data.page) * Number(productData.data.limit) < Number(productData.data.total)
    : false

  return (
    <View style={styles.container}>
      <SearchPage
        onBack={handleBack}
        onSearch={handleSearch}
        initialValue={query}
        products={products}
        isLoading={isFetching}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        categories={categoryListData?.data || []}
        isCategoriesLoading={isCategoryListLoading}
        onFilterChange={handleFilterChange}
        activeFilters={{
          categories: selectedCategories,
          priceRange: selectedPriceRange,
          sortBy: sortOption,
          statuses: selectedStatuses
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default SearchScreen
