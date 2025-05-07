/* eslint-disable radix */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Feather } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState, useCallback } from 'react'
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Badge } from 'react-native-ui-lib'

import SearchModal from '../search/SearchModal'

import { myTheme } from '@/constants/index'
import { getProductFilterMutationApi } from '@/hooks/api/product'
import { ProductTagEnum } from '@/types/enum'
import { IResponseProduct } from '@/types/product'

// Update the ShopHeaderProps interface to include search-related props
interface ShopHeaderProps {
  cartItemCount?: number
  notificationCount?: number
  onProductsLoaded?: (products: IResponseProduct[]) => void
  defaultTag?: ProductTagEnum
  defaultLimit?: number
}

const ShopHeader = ({
  cartItemCount = 10,
  notificationCount = 10,
  onProductsLoaded,
  defaultTag = ProductTagEnum.BEST_SELLER,
  defaultLimit = 10
}: ShopHeaderProps) => {
  // const { mutateAsync: searchMutate } = useMutation({
  //   mutationKey: [getProductFilterMutationApi.mutationKey],
  //   mutationFn: getProductFilterMutationApi.fn
  // })
  const router = useRouter()

  const [searchModalVisible, setSearchModalVisible] = useState(false)

  // Add state for search and pagination
  const [searchQuery, setSearchQuery] = useState('')

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

  // Animation hooks
  const cartScale = useSharedValue(1)
  const notifScale = useSharedValue(1)

  const pressCartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(cartScale.value) }]
    }
  })

  const pressNotifStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(notifScale.value) }]
    }
  })

  // Animation handlers
  const handleCartPressIn = () => {
    cartScale.value = 0.9
  }

  const handleCartPressOut = () => {
    cartScale.value = 1
  }

  const handleNotifPressIn = () => {
    notifScale.value = 0.9
  }

  const handleNotifPressOut = () => {
    notifScale.value = 1
  }

  const handleSearchPress = () => {
    router.push({ pathname: '/(app)/(tabs)/explore' })
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {/* Search Bar */}
        <TouchableOpacity style={styles.searchContainer} activeOpacity={0.7} onPress={handleSearchPress}>
          <View style={styles.textFieldContainer}>
            <View style={styles.searchInputButton}>
              <View style={styles.searchIcon}>
                <Feather name='search' size={16} color={myTheme.primary} />
              </View>
              <View style={styles.searchPlaceholder}>
                <Animated.Text style={styles.placeholderText}>
                  {searchQuery ? searchQuery : 'Tìm kiếm sản phẩm...'}
                </Animated.Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Icons Container */}
        <View style={styles.iconsContainer}>
          {/* Cart Icon with Badge */}
          <AnimatedTouchable
            style={[styles.iconWrapper]}
            activeOpacity={0.7}
            onPressIn={handleCartPressIn}
            onPressOut={handleCartPressOut}
            onPress={() => router.push({ pathname: '/cart' })}
          >
            <Animated.View style={[styles.iconBackground, pressCartStyle]}>
              <Feather name='shopping-cart' size={18} color={myTheme.primary} />
            </Animated.View>
            {cartItemCount > 0 && (
              <Badge
                label={cartItemCount > 99 ? '99+' : cartItemCount.toString()}
                size={14}
                backgroundColor={myTheme.primary}
                containerStyle={styles.badge}
              />
            )}
          </AnimatedTouchable>

          {/* Notification Icon with Badge */}
          <AnimatedTouchable
            style={[styles.iconWrapper]}
            activeOpacity={0.7}
            onPressIn={handleNotifPressIn}
            onPressOut={handleNotifPressOut}
            onPress={() => router.push({ pathname: '/(app)/(home)/notifications' })}
          >
            <Animated.View style={[styles.iconBackground, pressNotifStyle]}>
              <Feather name='bell' size={18} color={myTheme.primary} />
            </Animated.View>
            {notificationCount > 0 && (
              <Badge
                label={notificationCount > 99 ? '99+' : notificationCount.toString()}
                size={14}
                backgroundColor={myTheme.primary}
                containerStyle={styles.badge}
              />
            )}
          </AnimatedTouchable>
        </View>
      </View>

      {/* Search Modal with Results */}
      {/* <SearchModal
        visible={searchModalVisible}
        onClose={handleSearchClose}
        onSearch={handleSearch}
        initialValue={searchQuery}
        products={products}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      /> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    backgroundColor: 'white',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 3
      }
    }),
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  searchContainer: {
    flex: 1,
    marginRight: 10
  },
  textFieldContainer: {
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1
      },
      android: {
        elevation: 1
      }
    })
  },
  searchInputButton: {
    height: 36,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchIcon: {
    marginRight: 8
  },
  searchPlaceholder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  placeholderText: {
    color: '#999',
    fontSize: 13
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconWrapper: {
    position: 'relative',
    marginLeft: 8,
    padding: 2
  },
  iconBackground: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1
      },
      android: {
        elevation: 1
      }
    })
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4
  }
})

export default ShopHeader
