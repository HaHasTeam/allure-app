'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { RtcConnection } from 'react-native-agora'

import { useViewerStream } from './useViewerStream'

import { log } from '@/utils/logger'

/**
 * Hook that extends useViewerStream with additional functionality
 * for tracking viewer count and other stream attachments
 */
export const useViewerStreamAttachment = ({
  appId,
  channel,
  token,
  userId
}: {
  appId: string
  channel: string
  token: string | null
  userId: string
}) => {
  // Use the base viewer stream hook
  const viewerStream = useViewerStream({
    appId,
    channel,
    token,
    userId
  })

  // Add state for tracking viewer count
  const [viewerCount, setViewerCount] = useState(0)
  const viewersRef = useRef<Set<number | string>>(new Set())

  // Add a ref to track if we've already identified the host
  const hasIdentifiedHostRef = useRef(false)

  // Track users who are broadcasting video
  const videoBroadcastersRef = useRef<Set<number>>(new Set())

  // Track users who are broadcasting audio
  const audioBroadcastersRef = useRef<Set<number>>(new Set())

  // Set up event listeners for user joined/left events to update viewer count
  useEffect(() => {
    if (!viewerStream.isInitialized || !viewerStream.engine) return

    // Track users joining the channel
    const onUserJoined = (connection: RtcConnection, uid: number, elapsed: number) => {
      if (connection.channelId === channel) {
        log.info(`User joined: ${uid}`)
        viewersRef.current.add(uid)
        setViewerCount(viewersRef.current.size)

        // If this is the first user to join and we don't have a host yet,
        // they might be the host - we'll wait for their video/audio state
        if (!viewerStream.hostUid && viewersRef.current.size === 1) {
          log.info(`First user joined (${uid}), they might be the host`)
        }
      }
    }

    // Track users leaving the channel
    const onUserOffline = (connection: RtcConnection, uid: number, reason: number) => {
      if (connection.channelId === channel) {
        log.info(`User left: ${uid}, reason: ${reason}`)
        viewersRef.current.delete(uid)
        videoBroadcastersRef.current.delete(uid)
        audioBroadcastersRef.current.delete(uid)
        setViewerCount(viewersRef.current.size)

        // If the host left, reset our flag
        if (uid === viewerStream.hostUid) {
          hasIdentifiedHostRef.current = false

          // Try to find a new host among remaining broadcasters
          findNewHost()
        }
      }
    }

    // Track user account changes
    const onUserInfoUpdated = (uid: number, userInfo: any) => {
      log.info(`User info updated: ${uid}`, userInfo)
    }

    // Track when we join the channel (to count ourselves)
    const onJoinChannelSuccess = (connection: RtcConnection, elapsed: number) => {
      if (connection.channelId === channel) {
        // Add ourselves to the count
        viewersRef.current.add(userId)
        setViewerCount(viewersRef.current.size)
      }
    }

    // Track remote video state changes - this is key for host identification
    const onRemoteVideoStateChanged = (
      connection: RtcConnection,
      remoteUid: number,
      state: number,
      reason: number,
      elapsed: number
    ) => {
      if (connection.channelId === channel) {
        log.debug(`Remote video state changed for ${remoteUid}: state=${state}, reason=${reason}`)

        // VideoRemoteStateStarting = 1, VideoRemoteStateDecoding = 2
        const isVideoActive = state === 1 || state === 2

        if (isVideoActive) {
          // Add to video broadcasters set
          videoBroadcastersRef.current.add(remoteUid)

          // If we don't have a host yet or this is a different user, update the host
          if (!viewerStream.hostUid || remoteUid !== viewerStream.hostUid) {
            log.info(`Setting host to ${remoteUid} based on video activity`)
            hasIdentifiedHostRef.current = true
          }
        } else {
          // Remove from video broadcasters set
          videoBroadcastersRef.current.delete(remoteUid)

          // If this was our host and they stopped video, check if they still have audio
          if (remoteUid === viewerStream.hostUid && !audioBroadcastersRef.current.has(remoteUid)) {
            // If no audio either, try to find a new host
            findNewHost()
          }
        }
      }
    }

    // Track remote audio state changes
    const onRemoteAudioStateChanged = (
      connection: RtcConnection,
      remoteUid: number,
      state: number,
      reason: number,
      elapsed: number
    ) => {
      if (connection.channelId === channel) {
        log.debug(`Remote audio state changed for ${remoteUid}: state=${state}, reason=${reason}`)

        // AudioRemoteStateStarting = 1, AudioRemoteStateDecoding = 2
        const isAudioActive = state === 1 || state === 2

        if (isAudioActive) {
          // Add to audio broadcasters set
          audioBroadcastersRef.current.add(remoteUid)

          // If we don't have a host yet and no video broadcasters, use audio broadcaster as host
          if (!viewerStream.hostUid && videoBroadcastersRef.current.size === 0) {
            log.info(`Setting host to ${remoteUid} based on audio activity`)
            hasIdentifiedHostRef.current = true
          }
        } else {
          // Remove from audio broadcasters set
          audioBroadcastersRef.current.delete(remoteUid)

          // If this was our host and they stopped audio, check if they still have video
          if (remoteUid === viewerStream.hostUid && !videoBroadcastersRef.current.has(remoteUid)) {
            // If no video either, try to find a new host
            findNewHost()
          }
        }
      }
    }

    // Function to find a new host among broadcasters
    const findNewHost = () => {
      // First try video broadcasters
      if (videoBroadcastersRef.current.size > 0) {
        const newHostUid = Array.from(videoBroadcastersRef.current)[0]
        log.info(`Found new host with UID ${newHostUid} from video broadcasters`)
        return
      }

      // Then try audio broadcasters
      if (audioBroadcastersRef.current.size > 0) {
        const newHostUid = Array.from(audioBroadcastersRef.current)[0]
        log.info(`Found new host with UID ${newHostUid} from audio broadcasters`)
        return
      }

      // If no broadcasters found, reset host state
      log.info('No broadcasters found to be the host')
      hasIdentifiedHostRef.current = false
    }

    // Add listeners
    viewerStream.engine.addListener('onUserJoined', onUserJoined)
    viewerStream.engine.addListener('onUserOffline', onUserOffline)
    viewerStream.engine.addListener('onUserInfoUpdated', onUserInfoUpdated)
    viewerStream.engine.addListener('onJoinChannelSuccess', onJoinChannelSuccess)
    viewerStream.engine.addListener('onRemoteVideoStateChanged', onRemoteVideoStateChanged)
    viewerStream.engine.addListener('onRemoteAudioStateChanged', onRemoteAudioStateChanged)

    // Set initial count (at least 1 for ourselves)
    if (viewerStream.joinChannelSuccess) {
      viewersRef.current.add(userId)
      setViewerCount(viewersRef.current.size)
    }

    // If host is already connected, add them to the count
    if (viewerStream.hostUid) {
      viewersRef.current.add(viewerStream.hostUid)
      setViewerCount(viewersRef.current.size)
      hasIdentifiedHostRef.current = true
    }

    return () => {
      viewerStream.engine.removeListener('onUserJoined', onUserJoined)
      viewerStream.engine.removeListener('onUserOffline', onUserOffline)
      viewerStream.engine.removeListener('onUserInfoUpdated', onUserInfoUpdated)
      viewerStream.engine.removeListener('onJoinChannelSuccess', onJoinChannelSuccess)
      viewerStream.engine.removeListener('onRemoteVideoStateChanged', onRemoteVideoStateChanged)
      viewerStream.engine.removeListener('onRemoteAudioStateChanged', onRemoteAudioStateChanged)
    }
  }, [
    viewerStream.isInitialized,
    viewerStream.engine,
    viewerStream.joinChannelSuccess,
    viewerStream.hostUid,
    channel,
    userId
  ])

  // When we join successfully, set up a delayed check for the host
  // useEffect(() => {
  //   if (viewerStream.joinChannelSuccess && !hasIdentifiedHostRef.current) {
  //     // Check after a short delay to ensure we catch late-starting streams
  //     const timeoutId = setTimeout(() => {
  //       if (!hasIdentifiedHostRef.current && !viewerStream.hostUid) {
  //         log.info('No host identified after delay, checking broadcasters')

  //         // If we have any broadcasters, use the first one as host
  //         if (videoBroadcastersRef.current.size > 0) {
  //           const newHostUid = Array.from(videoBroadcastersRef.current)[0]
  //           log.info(`Setting host to ${newHostUid} from video broadcasters after delay`)
  //         } else if (audioBroadcastersRef.current.size > 0) {
  //           const newHostUid = Array.from(audioBroadcastersRef.current)[0]
  //           log.info(`Setting host to ${newHostUid} from audio broadcasters after delay`)
  //         }
  //       }
  //     }, 3000)

  //     return () => clearTimeout(timeoutId)
  //   }
  // }, [viewerStream.joinChannelSuccess, viewerStream.hostUid])

  // Function to manually refresh viewer count
  const refreshViewerCount = useCallback(() => {
    setViewerCount(viewersRef.current.size)
  }, [])

  // Return the base hook properties along with viewer count
  return {
    ...viewerStream,
    viewerCount,
    refreshViewerCount
  }
}
