import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { View, Text, Card, Chip, LoaderScreen } from 'react-native-ui-lib'

import { myDeviceWidth, myFontWeight, width, myTheme } from '../../../constants/index'
import { LiveStreamEnum } from '../../../types/enum'

import MyText from '@/components/common/MyText'
import { getActiveLiveStreamApi, type LivestreamResponse } from '@/hooks/api/livestream'

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Format time for display
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// Get relative time description in Vietnamese
const getTimeDescription = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = date.getTime() - now.getTime()

  // If the time has passed
  if (diffMs < 0) {
    const pastDiffMins = Math.abs(Math.round(diffMs / 60000))
    const pastDiffHours = Math.abs(Math.round(diffMs / 3600000))
    const pastDiffDays = Math.abs(Math.round(diffMs / 86400000))

    if (pastDiffMins < 60) return `Đã bắt đầu ${pastDiffMins} phút trước`
    if (pastDiffHours < 24) return `Đã bắt đầu ${pastDiffHours} giờ trước`
    return `Đã bắt đầu ${pastDiffDays} ngày trước`
  }

  // If the time is in the future
  const diffMins = Math.round(diffMs / 60000)
  const diffHours = Math.round(diffMs / 3600000)
  const diffDays = Math.round(diffMs / 86400000)

  if (diffMins < 60) return `Bắt đầu trong ${diffMins} phút`
  if (diffHours < 24) return `Bắt đầu trong ${diffHours} giờ`
  return `Bắt đầu trong ${diffDays} ngày`
}

// Translate status to Vietnamese
const translateStatus = (status: string) => {
  switch (status) {
    case LiveStreamEnum.LIVE:
      return 'TRỰC TIẾP'
    case LiveStreamEnum.SCHEDULED:
      return 'SẮP DIỄN RA'
    case LiveStreamEnum.ENDED:
      return 'ĐÃ KẾT THÚC'
    case LiveStreamEnum.CANCELLED:
      return 'ĐÃ HỦY'
    default:
      return status
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case LiveStreamEnum.LIVE:
      return myTheme.destructive
    case LiveStreamEnum.SCHEDULED:
      return myTheme.primary
    case LiveStreamEnum.ENDED:
      return myTheme.grey
    case LiveStreamEnum.CANCELLED:
      return myTheme.accent
    default:
      return myTheme.grey
  }
}

const LiveStreamItem = ({ item }: { item: LivestreamResponse }) => {
  const router = useRouter()
  const goToLivestream = (livestream: LivestreamResponse) => {
    router.push({
      pathname: '/(app)/(livestream)/viewer-stream',
      params: {
        id: livestream.id,
        title: livestream.title
      }
    })
  }
  return (
    <Card style={styles.card} borderRadius={16} elevation={2} enableShadow backgroundColor={myTheme.white} marginB-16>
      <Card.Section
        imageSource={item.thumbnail ? { uri: item.thumbnail } : require('@/assets/images/fallBackImage.jpg')}
        imageStyle={styles.cardImage}
        imageProps={{ resizeMode: 'cover' }}
      />

      <Chip
        label={translateStatus(item.status)}
        labelStyle={styles.statusLabel}
        containerStyle={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
      />

      <View padding-16>
        <Text text70 style={styles.title}>
          {item.title}
        </Text>

        <View style={styles.timeContainer}>
          <View row spread marginB-4>
            <Text text80 style={styles.dateText}>
              {formatDate(item.startTime)}
            </Text>
            <Text text80 style={styles.timeText}>
              {formatTime(item.startTime)}
            </Text>
          </View>

          <Text text80 style={styles.relativeTimeText}>
            {getTimeDescription(item.startTime)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (item.status === LiveStreamEnum.LIVE) {
              goToLivestream(item)
            } else {
              // Keep existing behavior for non-live streams
              // You can add navigation to details page here if needed
            }
          }}
        >
          <View
            style={styles.watchButton}
            backgroundColor={item.status === LiveStreamEnum.LIVE ? myTheme.primary : myTheme.secondary}
          >
            <Text
              style={styles.watchButtonText}
              color={item.status === LiveStreamEnum.LIVE ? myTheme.white : myTheme.secondaryForeground}
            >
              {item.status === LiveStreamEnum.LIVE ? 'Xem Ngay' : 'Xem Chi Tiết'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Card>
  )
}

const LiveStreamList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: [getActiveLiveStreamApi.queryKey],
    queryFn: getActiveLiveStreamApi.fn
  })

  const livestreams = data?.data || []

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: myTheme.background }}>
      <View padding-16>
        <MyText
          text='Phát Trực Tiếp'
          styleProps={{
            fontSize: width < myDeviceWidth.sm ? 22 : 24,
            textAlign: 'left',
            marginTop: 24,
            marginBottom: 16,
            fontFamily: myFontWeight.bold,
            color: myTheme.primary
          }}
        />
      </View>

      {isLoading ? (
        <LoaderScreen color={myTheme.primary} message='Đang tải dữ liệu...' />
      ) : error ? (
        <View flex center>
          <Text text70 color={myTheme.mutedForeground}>
            Lỗi khi tải dữ liệu
          </Text>
        </View>
      ) : livestreams.length === 0 ? (
        <View flex center>
          <Text text70 color={myTheme.mutedForeground}>
            Không có sự kiện trực tiếp nào
          </Text>
        </View>
      ) : (
        <FlatList
          data={livestreams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LiveStreamItem item={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingTop: 0
  },
  card: {
    overflow: 'hidden'
  },
  cardImage: {
    height: 200,
    width: '100%'
  },
  statusChip: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  statusLabel: {
    color: myTheme.white,
    fontSize: 12,
    fontFamily: myFontWeight.semiBold
  },
  title: {
    fontSize: 18,
    fontFamily: myFontWeight.bold,
    marginBottom: 12,
    color: myTheme.foreground
  },
  timeContainer: {
    marginTop: 8,
    marginBottom: 16
  },
  dateText: {
    fontSize: 14,
    color: myTheme.foreground,
    fontFamily: myFontWeight.medium
  },
  timeText: {
    fontSize: 14,
    color: myTheme.foreground,
    fontFamily: myFontWeight.medium
  },
  relativeTimeText: {
    fontSize: 14,
    color: myTheme.primary,
    fontFamily: myFontWeight.semiBold
  },
  watchButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  watchButtonText: {
    fontFamily: myFontWeight.semiBold,
    fontSize: 14
  }
})

export default LiveStreamList
