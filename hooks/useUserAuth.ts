import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { createFirebaseTokenApi } from './api/firebase'

import { errorMessage } from '@/constants'
import { useSession } from '@/contexts/AuthContext'
import { firebaseAuth } from '@/utils/firebase'

const useUserAuth = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>()
  const [error, setError] = useState<string | null>(null)
  const { firebaseToken, saveFirebaseToken } = useSession()
  const { mutateAsync: createCustomToken } = useMutation({
    mutationFn: createFirebaseTokenApi.fn,
    mutationKey: [createFirebaseTokenApi.mutationKey]
  })

  if (firebaseToken && !user && firebaseToken.length > 0) {
    console.log('====================================')
    console.log('firebaseToken 21', firebaseToken)
    console.log('====================================')
    firebaseAuth
      .signInWithCustomToken(firebaseToken)
      .then((result) => {
        setUser(result.user)
      })
      .catch((err) => {
        setError(errorMessage.ERM033)
        console.log(err)
      })
  }

  useEffect(() => {
    ;(async () => {
      if (!(firebaseToken && firebaseToken.length > 0)) {
        const result = await createCustomToken()
        if (typeof result === 'string' || !result) {
          setError(result || errorMessage.ERM033)
        } else {
          saveFirebaseToken(result.data.token)
        }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useEffect(() => {
  //   if (firebaseToken) {
  //     const subscriber = firebaseAuth.onAuthStateChanged((user) => {
  //       if (!user) {
  //         removeFirebaseToken()
  //       }
  //       setUser(user)
  //     })
  //     return subscriber
  //   } // unsubscribe on unmount
  // }, [firebaseToken, removeFirebaseToken])

  return { user, error }
}

export default useUserAuth
