'use client'

import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useMutation } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native'
import { Button } from 'react-native-ui-lib'

import SuccessContent from './SuccessContent'

import { myTheme } from '@/constants'
import { generatePaymentLinkApi } from '@/hooks/api/payment'

interface QRCodePaymentProps {
  /**
   * Amount to pay in VND
   */
  amount: number
  /**
   * Optional payment description
   */
  description?: string
  /**
   * Optional payment ID for reference
   */
  paymentId?: string
  /**
   * Callback function triggered on successful payment
   * @param data Payment response data including the order ID
   */
  onSuccess?: (paidId: string) => Promise<void>
  /**
   * Callback function triggered on payment error
   * @param error Error details
   */
  onError?: (error: Error | unknown) => void
  /**
   * Callback function triggered when browser is closed
   */
  onBrowserClosed?: () => void
  /**
   * Callback function triggered when browser is opened
   */
  onBrowserOpened?: () => void
}

export function QRCodePayment({
  amount,
  description = 'Payment',
  paymentId,
  onSuccess,
  onError,
  onBrowserClosed,
  onBrowserOpened
}: QRCodePaymentProps) {
  const { mutateAsync: generatePaymentLink, data: paymentLinkRes } = useMutation({
    mutationKey: [generatePaymentLinkApi.mutationKey],
    mutationFn: generatePaymentLinkApi.fn
  })
  const url = Linking.createURL('/(app)/(checkout)/result')

  const [isLoading, setIsLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [isOpeningBrowser, setIsOpeningBrowser] = useState(false)
  // Use a ref instead of a variable in the cleanup function
  const isMountedRef = useRef(true)

  // Generate payment link when component mounts
  useEffect(() => {
    if (amount >= 0 && !paymentLinkRes?.data?.url) {
      setIsLoading(true)
      generatePaymentLink({
        amount,
        description: description || 'Payment',
        returnUrl: url,
        cancelUrl: url
      })
        .then(() => {
          if (isMountedRef.current) {
            setIsLoading(false)
          }
        })
        .catch((error) => {
          if (isMountedRef.current) {
            console.error('Error generating payment link:', error)
            setIsLoading(false)
            onError?.(error)
          }
        })
    }
  }, [amount, description, generatePaymentLink, paymentLinkRes?.data?.url, paymentId, onError, url])

  // Open browser when payment link is available
  useEffect(() => {
    // Set isMountedRef to true when the component mounts
    isMountedRef.current = true

    const openBrowser = async () => {
      if (paymentLinkRes?.data?.url && !isOpeningBrowser && !completed) {
        try {
          setIsOpeningBrowser(true)

          // Notify that browser is being opened
          onBrowserOpened?.()

          // Open the payment URL in the browser
          const result = await WebBrowser.openAuthSessionAsync(
            paymentLinkRes.data.url,
            // Callback URL - this should match your app's URL scheme
            url
          )

          // Check if component is still mounted before updating state
          if (!isMountedRef.current) return

          setIsOpeningBrowser(false)

          if (result.type === 'success') {
            // Extract payment ID from URL if available
            const resultUrl = result.url
            const params = new URLSearchParams(resultUrl.split('?')[1])
            const paymentId = params.get('id')

            if (paymentId) {
              setCompleted(true)
              onSuccess?.(paymentId).catch((err) => {
                if (isMountedRef.current) {
                  onError?.(err)
                }
              })
            } else {
              // Check if we can extract it from another part of the URL
              const urlParts = resultUrl.split('/')
              const potentialId = urlParts[urlParts.length - 1]

              if (potentialId && potentialId.length > 8) {
                setCompleted(true)
                onSuccess?.(potentialId).catch((err) => {
                  if (isMountedRef.current) {
                    onError?.(err)
                  }
                })
              } else {
                // If we can't find the ID, we'll need to check the payment status
                console.log('Payment may have completed, but ID not found in URL')
                onBrowserClosed?.()
              }
            }
          } else {
            // Browser was dismissed without success
            console.log('Browser closed without completing payment')
            onBrowserClosed?.()
          }
        } catch (error) {
          if (!isMountedRef.current) return
          setIsOpeningBrowser(false)
          console.error('Error opening browser:', error)
          onError?.(error)
        }
      }
    }

    openBrowser()

    // Cleanup function to set isMountedRef to false when component unmounts
    return () => {
      isMountedRef.current = false
    }
  }, [
    paymentLinkRes?.data?.url,
    isOpeningBrowser,
    completed,
    onSuccess,
    onError,
    onBrowserClosed,
    onBrowserOpened,
    url
  ])

  // Handle manual button press to open payment page
  const handleOpenPaymentPage = async () => {
    if (paymentLinkRes?.data?.url) {
      try {
        setIsOpeningBrowser(true)
        onBrowserOpened?.()

        const result = await WebBrowser.openAuthSessionAsync(paymentLinkRes.data.url, url)

        // Check if component is still mounted
        if (!isMountedRef.current) return

        setIsOpeningBrowser(false)

        if (result.type === 'success') {
          // Extract payment ID from URL if available
          const resultUrl = result.url
          const params = new URLSearchParams(resultUrl.split('?')[1])
          const paymentId = params.get('id')

          if (paymentId) {
            setCompleted(true)
            onSuccess?.(paymentId).catch(onError)
          } else {
            // Check if we can extract it from another part of the URL
            const urlParts = resultUrl.split('/')
            const potentialId = urlParts[urlParts.length - 1]

            if (potentialId && potentialId.length > 8) {
              setCompleted(true)
              onSuccess?.(potentialId).catch(onError)
            } else {
              onBrowserClosed?.()
            }
          }
        } else {
          onBrowserClosed?.()
        }
      } catch (error) {
        if (isMountedRef.current) {
          setIsOpeningBrowser(false)
          onError?.(error)
        }
      }
    }
  }

  if (isLoading) {
    return (
      <BottomSheetView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={myTheme.primary} />
        <Text style={styles.loadingText}>{description ? `Preparing ${description}...` : 'Preparing payment...'}</Text>
      </BottomSheetView>
    )
  }

  if (completed) {
    return (
      <BottomSheetView style={styles.successContainer}>
        <SuccessContent />
      </BottomSheetView>
    )
  }

  return (
    <BottomSheetView style={styles.container}>
      <View style={styles.browserPromptContainer}>
        <Text style={styles.browserPromptTitle}>Ready to process payment</Text>
        <Text style={styles.browserPromptText}>
          You'll be redirected to a secure payment page. Complete the payment there and return to the app.
        </Text>

        <Button
          label='Open Payment Page'
          backgroundColor={myTheme.primary}
          style={styles.openBrowserButton}
          onPress={handleOpenPaymentPage}
          disabled={isOpeningBrowser || !paymentLinkRes?.data?.url}
        />
      </View>
    </BottomSheetView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myTheme.white
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: myTheme.foreground,
    textAlign: 'center'
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  browserPromptContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  browserPromptTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: myTheme.foreground,
    marginBottom: 12,
    textAlign: 'center'
  },
  browserPromptText: {
    fontSize: 16,
    color: myTheme.mutedForeground,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24
  },
  openBrowserButton: {
    width: '100%',
    marginTop: 16
  }
})
