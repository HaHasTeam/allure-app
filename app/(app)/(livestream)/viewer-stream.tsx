/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { Feather, MaterialIcons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
  BackHandler,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  PanResponder
} from 'react-native'
import type { FlatList as FlatListType } from 'react-native'
import { RtcSurfaceView, ClientRoleType } from 'react-native-agora'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TextField } from 'react-native-ui-lib' // Import TextField instead of TextInput

import ProductsBottomSheet from '@/components/livestream/product-bottom-sheet'
import { myTheme } from '@/constants/index'
import { getCustomTokenLivestreamApi, getLiveStreamByIdMutation, type LiveSteamDetail } from '@/hooks/api/livestream'
import useUser from '@/hooks/api/useUser'
import { useFirebaseChat } from '@/hooks/useFirebaseChat'
import { useViewerStreamAttachment } from '@/hooks/useViewerStreamAttachment'
import { log } from '@/utils/logger'

const { width, height } = Dimensions.get('window')

export default function LivestreamViewerScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [newMessage, setNewMessage] = useState('')
  const [streamDuration, setStreamDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentToken, setCurrentToken] = useState<string | null>(null)
  const [isRefreshingToken, setIsRefreshingToken] = useState(false)
  const [listProduct, setListProduct] = useState<LiveSteamDetail[]>([])
  const [tokenError, setTokenError] = useState(false)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [streamInfo, setStreamInfo] = useState<{
    title: string
    hostName: string
    hostAvatar?: string
  }>({
    title: (params.title as string) || 'Live Stream',
    hostName: 'Host',
    hostAvatar: undefined
  })

  // Add these new state variables for gesture scrolling
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
  const [lastScrollPosition, setLastScrollPosition] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)
  const [visibleHeight, setVisibleHeight] = useState(0)

  const [account, setAccount] = useState<{ id: string; name: string } | null>(null)

  // Products modal visibility state
  const [isProductsModalVisible, setProductsModalVisible] = useState(false)
  // Replace these two hooks
  const { mutateAsync: getLivestreamById } = useMutation({
    mutationKey: [getLiveStreamByIdMutation.mutationKey],
    mutationFn: getLiveStreamByIdMutation.fn
  })

  const { mutateAsync: getLivestreamToken } = useMutation({
    mutationKey: [getCustomTokenLivestreamApi.mutationKey],
    mutationFn: getCustomTokenLivestreamApi.fn
  })
  // Get params
  const livestreamId = params.id as string

  const { getProfile } = useUser()

  // Use Firebase chat hook
  const {
    messages: chatMessages,
    isInitialized: isChatInitialized,
    isLoggedIn: isChatLoggedIn,
    isSending: isChatSending,
    error: chatError,
    isLoadingMore,
    hasMoreMessages,
    sendMessage: sendChatMessage,
    loadMoreMessages,
    clearError: clearChatError,
    reconnect: reconnectChat
  } = useFirebaseChat(livestreamId)

  const chatListRef = useRef<
    FlatListType<{
      id: string
      user: string
      message: string
      avatar: string
      timestamp: number
    }>
  >(null)

  // Add a ref for the text input
  const inputRef = useRef<any>(null)
  // Check if scroll position is near the bottom
  const isNearBottom = useCallback(() => {
    if (!chatListRef.current || chatMessages.length === 0) return true

    // If we're within 20 pixels of the bottom, consider it "at bottom"
    return lastScrollPosition > contentHeight - visibleHeight - 20
  }, [lastScrollPosition, contentHeight, visibleHeight, chatMessages.length])

  // Set up pan responder for gesture-based scrolling
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // Only respond to vertical gestures
          return Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        },
        onPanResponderGrant: () => {
          setIsScrolling(true)
          setIsAutoScrollEnabled(false)
        },
        onPanResponderMove: (_, gestureState) => {
          if (chatListRef.current) {
            // Calculate new scroll position based on gesture
            const newPosition = lastScrollPosition - gestureState.dy
            chatListRef.current.scrollToOffset({ offset: newPosition, animated: false })
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          // Update last scroll position
          if (chatListRef.current) {
            setLastScrollPosition(lastScrollPosition - gestureState.dy)
          }

          // If user flicked quickly, add momentum scrolling
          if (Math.abs(gestureState.vy) > 0.5) {
            const distance = gestureState.vy * 300 // Adjust multiplier for momentum
            if (chatListRef.current) {
              chatListRef.current.scrollToOffset({
                offset: lastScrollPosition - gestureState.dy - distance,
                animated: true
              })
              // Update last position after momentum scroll
              setLastScrollPosition(lastScrollPosition - gestureState.dy - distance)
            }
          }

          setIsScrolling(false)

          // After a short delay, re-enable auto-scroll if at bottom
          setTimeout(() => {
            if (chatListRef.current && isNearBottom()) {
              setIsAutoScrollEnabled(true)
            }
          }, 1000)
        }
      }),
    [lastScrollPosition, isNearBottom]
  )

  // Animation values
  const controlsOpacity = useSharedValue(1)

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile()
        if (data && data.id) {
          setAccount({
            id: data.id,
            name: data.email || 'Viewer'
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [getProfile])

  // Listen for keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true)
    })
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false)
    })

    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [])

  // Function to focus the input
  const focusInput = useCallback(() => {
    console.log('Attempting to focus input')
    if (inputRef.current) {
      // For TextField, we need to access the inner TextInput
      setTimeout(() => {
        if (inputRef.current) {
          if (inputRef.current.focus) {
            inputRef.current.focus()
            console.log('Focus called on input ref')
          } else if (inputRef.current.getTextField && inputRef.current.getTextField().focus) {
            // Some UI lib components have a getTextField method
            inputRef.current.getTextField().focus()
            console.log('Focus called on getTextField')
          } else {
            console.log('Input ref exists but no focus method found', inputRef.current)
          }
        }
      }, 100)
    } else {
      console.log('Input ref is null')
    }
  }, [])

  // Fetch livestream info and token
  useEffect(() => {
    async function fetchLivestreamData() {
      setIsLoading(true)
      try {
        // Fetch livestream details
        const { data: livestreamData } = await getLivestreamById(livestreamId)

        if (livestreamData) {
          setStreamInfo({
            title: livestreamData.title || 'Live Stream',
            hostName: 'Host', // You might want to fetch host info from your API
            hostAvatar: undefined
          })
          setListProduct(livestreamData.livestreamProducts)

          // Store the stream start time
          if (livestreamData.startTime) {
            // Calculate initial stream duration based on startTime
            const startTimeDate = new Date(livestreamData.startTime)
            const currentTime = new Date()
            const durationInSeconds = Math.floor((currentTime.getTime() - startTimeDate.getTime()) / 1000)

            // Only set if it's a positive value
            if (durationInSeconds > 0) {
              setStreamDuration(durationInSeconds)
            }
          }
        }

        const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600

        // Fetch token
        const { data: tokenResult } = await getLivestreamToken({
          channelName: livestreamId,
          privilegeExpirationInSecond: privilegeExpiredTs,
          role: ClientRoleType.ClientRoleAudience
        })
        console.log('token', tokenResult)

        if (tokenResult) {
          // Fallback in case the structure is different
          setCurrentToken(tokenResult)
        } else {
          setTokenError(true)
          Alert.alert('Error', 'Failed to get streaming token. Please try again.')
        }
      } catch (error) {
        console.error('Error fetching livestream data:', error)
        Alert.alert('Error', 'Failed to load livestream. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLivestreamData()
  }, [livestreamId, getLivestreamById, getLivestreamToken])

  // Initialize the viewer stream hook with attachment for viewer count
  const { engine, isInitialized, hostUid, isHostVideoEnabled, leaveChannel, viewerCount } = useViewerStreamAttachment({
    appId: '00f5d43335cb4a19969ef78bb8955d2c', // Replace with your Agora App ID
    channel: livestreamId,
    token: currentToken,
    userId: account?.id || 'viewer'
  })

  // Timer for stream duration
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-hide controls after inactivity
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null)

  const resetControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current)
    }

    controlsOpacity.value = withTiming(1, { duration: 200 })

    controlsTimerRef.current = setTimeout(() => {
      controlsOpacity.value = withTiming(0, { duration: 500 })
    }, 5000)
  }, [controlsOpacity])
  // Leave the livestream
  const leaveStream = useCallback(() => {
    if (isInitialized) {
      leaveChannel()
    }
    router.back()
  }, [isInitialized, leaveChannel, router])

  // Confirm leaving the stream
  const confirmLeaveStream = useCallback(() => {
    Alert.alert('Leave Stream', 'Are you sure you want to leave this livestream?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: leaveStream }
    ])
  }, [leaveStream])

  // Format duration as MM:SS
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    if (chatListRef.current && chatMessages.length > 0) {
      chatListRef.current.scrollToEnd({ animated: true })
      setIsAutoScrollEnabled(true)
    }
  }, [chatMessages.length])

  // Send a chat message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !isChatLoggedIn) {
      if (!isChatLoggedIn) {
        Alert.alert('Not Logged In', 'You need to be logged in to chat.')
      }
      return
    }

    try {
      await sendChatMessage(newMessage.trim())
      setNewMessage('')
      Keyboard.dismiss() // Dismiss keyboard after sending message

      // Scroll to bottom
      if (chatListRef.current) {
        chatListRef.current?.scrollToEnd({ animated: true })
      }

      resetControlsTimer()
    } catch (error) {
      console.error('Error sending message:', error)
      Alert.alert('Error', 'Failed to send message. Please try again.')
    }
  }, [newMessage, isChatLoggedIn, sendChatMessage, resetControlsTimer])

  // Handle scroll event to track scroll position
  const handleScroll = useCallback((event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y
    const contentHeight = event.nativeEvent.contentSize.height
    const layoutHeight = event.nativeEvent.layoutMeasurement.height

    setLastScrollPosition(scrollY)
    setContentHeight(contentHeight)
    setVisibleHeight(layoutHeight)

    // If user manually scrolled away from bottom, disable auto-scroll
    if (scrollY < contentHeight - layoutHeight - 20) {
      setIsAutoScrollEnabled(false)
    } else {
      setIsAutoScrollEnabled(true)
    }
  }, [])

  // Animated styles
  const controlsStyle = useAnimatedStyle(() => {
    return {
      opacity: controlsOpacity.value
    }
  })

  // Manual token refresh button handler
  const onManualTokenRefresh = () => {
    Alert.alert('Session Expired', 'Your viewing session has expired. Please exit and rejoin the stream.', [
      { text: 'OK', onPress: () => router.back() }
    ])
  }

  // Handle chat reconnection
  const handleReconnectChat = () => {
    if (reconnectChat()) {
      Alert.alert('Success', 'Reconnected to chat successfully')
    }
  }

  // Open products modal
  const openProductsModal = useCallback(() => {
    console.log('Opening products modal')
    setProductsModalVisible(true)
  }, [])

  // Close products modal
  const closeProductsModal = useCallback(() => {
    console.log('Closing products modal')
    setProductsModalVisible(false)
  }, [])

  // Handle cart button press
  const handleCartButtonPress = () => {
    console.log('Cart button pressed')
    openProductsModal()
  }

  // Render a chat message item
  const renderChatMessage = useCallback(
    ({ item }: { item: any; index: number }) => (
      <Animated.View style={[styles.tiktokChatMessage, { opacity: 1 }]} key={item.id}>
        <View style={styles.tiktokAvatarContainer}>
          <Text style={styles.tiktokAvatarText}>{item.avatar}</Text>
        </View>
        <View style={styles.tiktokMessageContent}>
          <Text style={styles.tiktokMessageUser}>{item.user}</Text>
          <Text style={styles.tiktokMessageText}>{item.message}</Text>
        </View>
      </Animated.View>
    ),
    []
  )

  // Dismiss keyboard when tapping outside the input
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss()
  }, [])

  // Add this near the top of your component function
  const insets = useSafeAreaInsets()

  const MemoizedFlatList = useMemo(
    () => (
      <FlatList
        ref={chatListRef}
        data={chatMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderChatMessage}
        style={styles.tiktokChatList}
        contentContainerStyle={styles.tiktokChatListContent}
        onEndReached={hasMoreMessages ? loadMoreMessages : undefined}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          isLoadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size='small' color='#ffffff' />
              <Text style={styles.loadingMoreText}>Loading more messages...</Text>
            </View>
          ) : null
        }
        onContentSizeChange={() => {
          // Only auto-scroll to bottom for new messages if we're already at the bottom
          if (chatListRef.current && chatMessages.length > 0 && isAutoScrollEnabled) {
            chatListRef.current.scrollToEnd({ animated: false })
          }
        }}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>No messages yet. Be the first to say something!</Text>
          </View>
        }
      />
    ),
    [
      chatMessages,
      renderChatMessage,
      hasMoreMessages,
      loadMoreMessages,
      handleScroll,
      isLoadingMore,
      isAutoScrollEnabled
    ]
  )
  // Handle token errors from Agora
  useEffect(() => {
    if (isInitialized && engine) {
      const handleError = (errorCode: number, msg: string) => {
        log.error(`Agora error: ${errorCode}, ${msg}`)

        // Error codes related to token expiration
        // 109: token expired
        // 110: token invalid
        if (errorCode === 109 || errorCode === 110) {
          log.warn('Token expired or invalid')
          Alert.alert('Connection Error', 'Your viewing session has expired. Please exit and rejoin the stream.', [
            { text: 'OK' }
          ])
          setTokenError(true)
        }
      }

      //   Add error listener
      engine.addListener('onError', handleError)

      return () => {
        engine.removeListener('onError', handleError)
      }
    }
  }, [isInitialized, engine])

  useEffect(() => {
    // Start timer for stream duration
    timerRef.current = setInterval(() => {
      setStreamDuration((prev) => prev + 1)
    }, 1000)

    // Handle back button press
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Prevent going back with hardware button
      confirmLeaveStream()
      return true
    })

    // Initialize controls timer
    resetControlsTimer()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current)
      }

      backHandler.remove()
    }
  }, [confirmLeaveStream, resetControlsTimer])

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container} onTouchStart={resetControlsTimer}>
        <StatusBar hidden />

        {/* Video Stream */}
        <View style={styles.videoContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='large' color={myTheme.primary} />
              <Text style={styles.loadingText}>Loading stream...</Text>
            </View>
          ) : isInitialized ? (
            isHostVideoEnabled ? (
              <RtcSurfaceView style={styles.videoView} canvas={{ uid: hostUid || 0 }} />
            ) : (
              <View style={styles.hostOfflineContainer}>
                <MaterialIcons name='videocam-off' size={48} color='#94a3b8' />
                <Text style={styles.hostOfflineText}>Host camera is off</Text>
              </View>
            )
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                {tokenError ? 'Session expired. Please exit and rejoin.' : 'Waiting for host...'}
              </Text>
              {tokenError && (
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={onManualTokenRefresh}
                  disabled={isRefreshingToken}
                >
                  <Text style={styles.refreshButtonText}>Refresh Token</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Settings button in top left */}
        <TouchableOpacity style={styles.backButton} onPress={confirmLeaveStream}>
          <View style={styles.actionButtonInner}>
            <Feather name='arrow-left' size={24} color='#fff' />
          </View>
        </TouchableOpacity>

        {/* Chat container with gesture support */}
        <View
          style={[
            styles.tiktokChatContainer,
            {
              bottom: 80 + (insets.bottom > 0 ? insets.bottom : 20),
              ...(isKeyboardVisible && { bottom: Platform.OS === 'ios' ? 120 : 100 })
            }
          ]}
          {...panResponder.panHandlers}
        >
          {chatError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{chatError}</Text>
              <View style={styles.errorButtonsContainer}>
                <TouchableOpacity style={styles.errorButton} onPress={handleReconnectChat}>
                  <Text style={styles.errorButtonText}>Reconnect</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.errorButton} onPress={clearChatError}>
                  <Text style={styles.errorButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {MemoizedFlatList}

          {/* Show return to bottom button only when needed */}
          {!isAutoScrollEnabled && (
            <TouchableOpacity style={styles.autoScrollButton} onPress={scrollToBottom}>
              <Feather name='arrow-down-circle' size={20} color='#fff' />
            </TouchableOpacity>
          )}
        </View>

        {/* Replace the View with KeyboardAvoidingView */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 + insets.bottom : 10 + insets.bottom}
          style={[styles.keyboardAvoidingView, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20, zIndex: 10 }]}
        >
          <View style={[styles.inputRowContainer, { paddingBottom: insets.bottom > 0 ? 10 : 24 }]}>
            {/* Cart button on the left */}
            <TouchableOpacity style={styles.inputSideButton} onPress={handleCartButtonPress}>
              <Feather name='shopping-cart' size={22} color='#fff' />
            </TouchableOpacity>

            {/* Chat input in the middle */}
            <View style={styles.persistentChatInputContainer}>
              <TouchableOpacity style={styles.chatInputWrapper} activeOpacity={0.8} onPress={focusInput}>
                <TextField
                  ref={inputRef}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder='Type a message...'
                  placeholderTextColor='#94a3b8'
                  returnKeyType='send'
                  onSubmitEditing={sendMessage}
                  enableErrors={false}
                  fieldStyle={styles.uiLibInputField}
                  style={styles.uiLibInputText}
                  containerStyle={styles.uiLibInputContainer}
                  autoCapitalize='none'
                  autoCorrect={false}
                  showCharCounter={false}
                  hideUnderline
                  onFocus={() => setIsKeyboardVisible(true)}
                  onBlur={() => setIsKeyboardVisible(false)}
                />
              </TouchableOpacity>

              {/* Send button */}
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!newMessage.trim() || !isChatLoggedIn || isChatSending) && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!newMessage.trim() || !isChatLoggedIn || isChatSending}
              >
                <Feather name='send' size={18} color='#fff' />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Overlay Controls - Now only shown when needed */}
        <Animated.View style={[styles.overlayControls, controlsStyle]}>
          {/* Top Row: Header with info */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.liveIndicator}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <Text style={styles.durationText}>{formatDuration(streamDuration)}</Text>
            </View>

            <Text style={styles.titleText} numberOfLines={1}>
              {streamInfo.title}
            </Text>

            <View style={styles.headerRight}>
              <View style={styles.viewerContainer}>
                <Feather name='eye' size={14} color='#fff' />
                <Text style={styles.viewerCount}>{viewerCount}</Text>
              </View>
            </View>
          </View>

          {/* Host Info */}
          <View style={styles.hostInfoContainer}>
            <View style={styles.hostAvatarContainer}>
              {streamInfo.hostAvatar ? (
                <Image source={{ uri: streamInfo.hostAvatar }} style={styles.hostAvatar} />
              ) : (
                <Text style={styles.hostAvatarText}>{streamInfo.hostName.charAt(0)}</Text>
              )}
            </View>
            <View style={styles.hostTextContainer}>
              <Text style={styles.hostName}>{streamInfo.hostName}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Products Modal */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: isProductsModalVisible ? 'auto' : 'none'
          }}
        >
          <ProductsBottomSheet
            visible={isProductsModalVisible}
            onClose={closeProductsModal}
            products={listProduct}
            livestreamId={livestreamId}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a'
  },
  videoView: {
    flex: 1
  },
  hostOfflineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b'
  },
  hostOfflineText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b'
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 16
  },
  refreshButton: {
    backgroundColor: myTheme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16
  },
  refreshButtonText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  overlayControls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'box-none' // Allow touches to pass through to elements below
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  liveIndicator: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8
  },
  liveText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12
  },
  durationText: {
    color: '#ffffff',
    fontSize: 14
  },
  titleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  viewerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16
  },
  viewerCount: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 4
  },
  hostInfoContainer: {
    position: 'absolute',
    top: 70,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    padding: 8,
    maxWidth: '80%'
  },
  hostAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: myTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  hostAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600'
  },
  hostTextContainer: {
    flex: 1
  },
  hostName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10
  },
  actionButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4
      },
      android: {
        elevation: 5
      }
    })
  },
  // TikTok-style chat container
  tiktokChatContainer: {
    position: 'absolute',
    bottom: 80, // Leave space for the chat input
    left: 0,
    right: 0,
    maxHeight: height * 0.5, // Take up to half the screen height
    paddingHorizontal: 16,
    pointerEvents: 'box-none' // Allow touches to pass through to elements below
  },
  tiktokChatList: {
    flex: 1
  },
  tiktokChatListContent: {
    paddingBottom: 8
  },
  tiktokChatMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    maxWidth: '85%',
    alignSelf: 'flex-start'
  },
  tiktokAvatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: myTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  tiktokAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  },
  tiktokMessageContent: {
    flex: 1
  },
  tiktokMessageUser: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600'
  },
  tiktokMessageText: {
    color: '#f8fafc',
    fontSize: 14
  },
  keyboardAvoidingView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10 // Lower zIndex so bottom sheets can appear above it
  },
  inputRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  inputSideButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4
  },
  persistentChatInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 8,
    zIndex: 100,
    pointerEvents: 'auto'
  },
  chatInputWrapper: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    pointerEvents: 'auto' // Ensure it can receive touch events
  },
  // Styles for react-native-ui-lib TextField
  uiLibInputContainer: {
    flex: 1,
    height: 36,
    backgroundColor: 'transparent',
    pointerEvents: 'auto' // Ensure it can receive touch events
  },
  uiLibInputField: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0
  },
  uiLibInputText: {
    color: '#ffffff',
    fontSize: 14,
    height: 36,
    paddingVertical: 4,
    paddingHorizontal: 12
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: myTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.7)',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  errorText: {
    color: '#ffffff',
    flex: 1
  },
  errorButtonsContainer: {
    flexDirection: 'row'
  },
  errorButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8
  },
  errorButtonText: {
    color: '#ffffff',
    fontSize: 12
  },
  emptyChat: {
    padding: 20,
    alignItems: 'center'
  },
  emptyChatText: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center'
  },
  loadingMoreContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingMoreText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 12
  },
  // Style for auto-scroll button
  autoScrollButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: myTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  }
})
