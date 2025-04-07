import { getMessaging, getToken, onMessage } from 'firebase/messaging'

import { app } from '../firebase'

export const messaging = getMessaging(app)

const checkAndRequestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    // Check if the browser supports notifications
    return false
  } else if (Notification.permission === 'granted') {
    // Check whether notification permissions have already been granted;
    // if so, create a notification
    return true
  } else if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        console.log('Notification permission granted.')
        return true
      }
    } catch (error) {
      console.error('An error occurred while requesting permission:', error)
    }
  }

  return false
}

export const getRegistrationToken = async () => {
  if (!(await checkAndRequestNotificationPermission())) return null

  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })

    return currentToken ? currentToken : null
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err)
    // ...
    return null
  }
}
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload)
    })
  })
