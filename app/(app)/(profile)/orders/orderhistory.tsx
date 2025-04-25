'use client'

import { Header, HeaderBackButton } from '@react-navigation/elements'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Stack, useRouter } from 'expo-router'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native'
import { Card, Text, TouchableOpacity } from 'react-native-ui-lib'

import Empty from '@/components/empty'
import LoadingContentLayer from '@/components/loading/LoadingContentLayer'
import OrderItem from '@/components/order/OrderItem'
import OrderParentItem from '@/components/order/OrderParentItem'
import { OrderRequestFilter } from '@/components/order/OrderRequestFilter'
import SearchOrders from '@/components/order/SearchOrders'
import APIPagination from '@/components/pagination'
import { myTheme } from '@/constants'
import { filterOrdersParentApi, filterRequestApi } from '@/hooks/api/order'
import { type OrderRequestTypeEnum, type RequestStatusEnum, ShippingStatusEnum } from '@/types/enum'
import type { IOrderItem, IRequest } from '@/types/order'

export default function OrderHistory() {
  const { t } = useTranslation()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isTrigger, setIsTrigger] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [refreshing, setRefreshing] = useState(false)
  const queryClient = useQueryClient()

  const [requestTypes, setRequestTypes] = useState<OrderRequestTypeEnum[]>([])
  const [requestStatuses, setRequestStatuses] = useState<RequestStatusEnum[]>([])

  const simplifiedTriggers = useMemo(
    () => [
      { value: 'all', text: `${t('order.all')}` },
      {
        value: 'pending',
        text: `${t('requestStatus.pending')}`,
        statuses: [
          ShippingStatusEnum.JOIN_GROUP_BUYING,
          ShippingStatusEnum.TO_PAY,
          ShippingStatusEnum.WAIT_FOR_CONFIRMATION
        ]
      },
      {
        value: 'processing',
        text: `${t('order.processing')}`,
        statuses: [ShippingStatusEnum.PREPARING_ORDER, ShippingStatusEnum.TO_SHIP]
      },
      {
        value: 'shipping',
        text: `${t('order.delivering')}`,
        statuses: [ShippingStatusEnum.SHIPPING]
      },
      {
        value: 'delivered',
        text: `${t('order.delivered')}`,
        statuses: [ShippingStatusEnum.DELIVERED]
      },
      {
        value: 'completed',
        text: `${t('order.completed')}`,
        statuses: [ShippingStatusEnum.COMPLETED]
      },
      {
        value: 'returns',
        text: `${t('order.returns')}`,
        statuses: [
          ShippingStatusEnum.RETURNING,
          ShippingStatusEnum.BRAND_RECEIVED,
          ShippingStatusEnum.RETURNED_FAIL,
          ShippingStatusEnum.REFUNDED
        ]
      },
      {
        value: 'cancelled',
        text: `${t('order.cancelled')}`,
        statuses: [ShippingStatusEnum.CANCELLED]
      },
      { value: 'request', text: `${t('order.requestManagement')}` }
    ],
    [t]
  )

  const { data: filterOrdersData, isFetching: isLoading } = useQuery({
    queryKey: [
      filterOrdersParentApi.queryKey,
      {
        page: currentPage,
        limit: 10,
        order: 'DESC',
        statuses: simplifiedTriggers.find((trigger) => trigger.value === activeTab)?.statuses
          ? simplifiedTriggers.find((trigger) => trigger.value === activeTab)?.statuses
          : activeTab === 'all'
            ? undefined
            : (activeTab.toUpperCase() as ShippingStatusEnum),
        search: searchQuery || undefined
      }
    ],
    queryFn: filterOrdersParentApi.fn
  })

  const { data: filterRequestsData, isFetching: isLoadingRequest } = useQuery({
    queryKey: [
      filterRequestApi.queryKey,
      {
        page: currentPage,
        limit: 10,
        order: 'DESC',
        statuses: requestStatuses.length > 0 ? requestStatuses : [],
        types: requestTypes.length > 0 ? requestTypes : []
      }
    ],
    queryFn: filterRequestApi.fn
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleRequestFilterChange = async (types: OrderRequestTypeEnum[], statuses: RequestStatusEnum[]) => {
    setRequestTypes(types)
    setRequestStatuses(statuses)
    // Trigger refetch with new filters
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [filterOrdersParentApi.queryKey]
      }),
      queryClient.invalidateQueries({ queryKey: [filterRequestApi.queryKey] })
    ])
  }

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: [filterOrdersParentApi.queryKey]
    })
    queryClient.invalidateQueries({ queryKey: [filterRequestApi.queryKey] })
  }, [isTrigger, queryClient])

  const handlePageChange = (index: number) => {
    setCurrentPage(index)
    // Refetch data with the new page
    queryClient.invalidateQueries({
      queryKey: [activeTab === 'request' ? filterRequestApi.queryKey : filterOrdersParentApi.queryKey]
    })
  }

  useEffect(() => {
    if (activeTab === 'request' && filterRequestsData?.data) {
      setTotalPages(filterRequestsData.data.totalPages)
    } else if (filterOrdersData?.data) {
      setTotalPages(filterOrdersData.data.totalPages)
    }
  }, [filterOrdersData, filterRequestsData, activeTab])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [filterOrdersParentApi.queryKey]
      }),
      queryClient.invalidateQueries({ queryKey: [filterRequestApi.queryKey] })
    ])
    setRefreshing(false)
  }, [queryClient])

  const renderRequestItem = ({ item }: { item: IRequest }) => {
    return (
      <Card style={styles.orderCard} marginB-12>
        <OrderItem
          brand={
            item?.order?.orderDetails[0]?.productClassification?.preOrderProduct?.product?.brand ??
            item?.order?.orderDetails[0]?.productClassification?.productDiscount?.product?.brand ??
            item?.order?.orderDetails[0]?.productClassification?.product?.brand ??
            null
          }
          orderItem={item?.order}
          setIsTrigger={setIsTrigger}
        />
      </Card>
    )
  }

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Empty
          title={t('empty.order.title')}
          description={activeTab === 'all' ? t('empty.order.description') : t('empty.order.statusDescription')}
        />
      </View>
    )
  }

  const renderTabItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === item.value && styles.activeTabButton]}
      onPress={() => {
        setActiveTab(item.value)
        setCurrentPage(1)
      }}
    >
      <Text style={[styles.tabText, activeTab === item.value && styles.activeTabText]}>{item.text}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          header: () => (
            <Header
              headerLeft={() => (
                <HeaderBackButton label={t('button.back')} tintColor={myTheme.primary} onPress={() => router.back()} />
              )}
              title={t('order.myOrder')}
              headerTitleStyle={styles.headerTitle}
              headerStyle={styles.header}
            />
          )
        }}
      />

      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={simplifiedTriggers}
          renderItem={renderTabItem}
          keyExtractor={(item) => item.value}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        />
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        {activeTab === 'request' ? (
          <OrderRequestFilter onFilterChange={handleRequestFilterChange} />
        ) : (
          <SearchOrders onSearch={handleSearch} />
        )}
      </View>

      {/* Loading State */}
      {(isLoading || isLoadingRequest) && !refreshing && <LoadingContentLayer />}

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Request Items */}
        {activeTab === 'request' && !isLoadingRequest && filterRequestsData?.data ? (
          filterRequestsData.data.total > 0 ? (
            <FlatList
              data={filterRequestsData.data.items}
              renderItem={renderRequestItem}
              keyExtractor={(item) => item?.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListFooterComponent={
                <View style={styles.paginationContainer}>
                  <APIPagination currentPage={currentPage} onPageChange={handlePageChange} totalPages={totalPages} />
                </View>
              }
            />
          ) : (
            renderEmpty()
          )
        ) : null}

        {/* Order Items */}
        {activeTab !== 'request' && !isLoading && filterOrdersData?.data ? (
          filterOrdersData.data.total > 0 ? (
            <FlatList
              data={filterOrdersData.data.items}
              keyExtractor={(item) => item?.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.orderItemWrapper}>
                  {item?.status === ShippingStatusEnum.TO_PAY ? (
                    <OrderParentItem setIsTrigger={setIsTrigger} order={item} />
                  ) : (
                    <Card style={styles.orderCard}>
                      {item?.children?.map((childOrder: IOrderItem) => (
                        <OrderItem
                          key={childOrder.id}
                          brand={
                            childOrder?.orderDetails?.[0]?.productClassification?.preOrderProduct?.product?.brand ??
                            childOrder?.orderDetails?.[0]?.productClassification?.productDiscount?.product?.brand ??
                            childOrder?.orderDetails?.[0]?.productClassification?.product?.brand ??
                            null
                          }
                          orderItem={childOrder}
                          setIsTrigger={setIsTrigger}
                        />
                      ))}
                    </Card>
                  )}
                </View>
              )}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListFooterComponent={
                <View style={styles.paginationContainer}>
                  <APIPagination currentPage={currentPage} onPageChange={handlePageChange} totalPages={totalPages} />
                </View>
              }
            />
          ) : (
            renderEmpty()
          )
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myTheme.background
  },
  header: {
    backgroundColor: myTheme.white,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border
  },
  headerTitle: {
    fontWeight: '600',
    color: myTheme.foreground,
    fontSize: 18
  },
  tabsContainer: {
    backgroundColor: myTheme.white,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTabButton: {
    borderBottomColor: myTheme.primary
  },
  tabText: {
    fontSize: 14,
    color: myTheme.mutedForeground
  },
  activeTabText: {
    color: myTheme.primary,
    fontWeight: '600'
  },
  searchContainer: {
    padding: 16,
    backgroundColor: myTheme.white,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 24
  },
  orderItemWrapper: {
    marginBottom: 16
  },
  orderCard: {
    padding: 0,
    marginBottom: 16,
    backgroundColor: myTheme.white,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: myTheme.border
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  paginationContainer: {
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center'
  }
})
