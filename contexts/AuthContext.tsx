'use client'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from 'expo-router'
import { jwtDecode } from 'jwt-decode'
import { type PropsWithChildren, useState, useEffect } from 'react'

import AuthContext from './AuthContenxtDefinition'

import useRole from '@/hooks/api/useRole'
import { resolveError } from '@/utils'
import { POST } from '@/utils/api.caller'
import { getItem, removeItem, setItem } from '@/utils/asyncStorage'
import { log } from '@/utils/logger'

export { useSession } from '../hooks/useSession'

export function SessionProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | undefined>()
  const [refreshToken, setRefreshToken] = useState<string | undefined>()
  const [firebaseToken, setFirebaseToken] = useState<string | undefined>()
  // const [firebaseUser, setFirebaseUser] =
  //   useState<FirebaseAuthTypes.User | null>(null);
  // const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const navigation = useNavigation()
  // Use the useRole hook instead of managing role state directly
  const {
    fetchRoles,
    getRoleByEnum,
    getRoleNameByEnum,
    isRolesLoaded,
    rolesData: roles,
    mappedRoles,
    isLoading: isLoadingRoles
  } = useRole()

  // const { mutateAsync: createCustomToken } = useMutation({
  //   mutationFn: createFirebaseTokenApi.fn,
  //   mutationKey: [createFirebaseTokenApi.mutationKey],
  // });

  // Initialize Firebase authentication
  // useEffect(() => {
  //   if (firebaseToken && firebaseToken.length > 0) {
  //     console.log("====================================");
  //     console.log("firebaseToken in SessionProvider", firebaseToken);
  //     console.log("====================================");

  //     firebaseAuth
  //       .signInWithCustomToken(firebaseToken)
  //       .then((result) => {
  //         setFirebaseUser(result.user);
  //       })
  //       .catch((err) => {
  //         setFirebaseError(errorMessage.ERM033);
  //         console.log(err);
  //       });
  //   }
  // }, [firebaseToken]);

  // Add auth state change listener
  // useEffect(() => {
  //   if (firebaseToken) {
  //     const subscriber = firebaseAuth.onAuthStateChanged((user) => {
  //       setFirebaseUser(user);
  //     });
  //     return subscriber; // unsubscribe on unmount
  //   }
  // }, [firebaseToken]);

  // Initialize Firebase token if needed - now checks for accessToken as well
  // useEffect(() => {
  //   (async () => {
  //     const hasValidAccessToken =
  //       accessToken &&
  //       typeof accessToken === "string" &&
  //       accessToken.length > 0;

  //     // Check if we have a valid firebaseToken
  //     const hasValidFirebaseToken =
  //       firebaseToken &&
  //       typeof firebaseToken === "string" &&
  //       firebaseToken.length > 0;

  //     console.log("Auth tokens check:", {
  //       hasAccessToken: !!accessToken,
  //       accessTokenLength: accessToken ? accessToken.length : 0,
  //       isAccessTokenValid: hasValidAccessToken,
  //       hasFirebaseToken: !!firebaseToken,
  //       firebaseTokenLength: firebaseToken ? firebaseToken.length : 0,
  //       isFirebaseTokenValid: hasValidFirebaseToken,
  //     });

  //     // Only proceed if we have a valid accessToken but no valid firebaseToken
  //     if (hasValidAccessToken && !hasValidFirebaseToken) {
  //       console.log(
  //         "Access token exists but no valid Firebase token found, creating a new one..."
  //       );

  //       try {
  //         const result = await createCustomToken();

  //         if (typeof result === "string" || !result) {
  //           console.error("Failed to create token:", result);
  //           setFirebaseError(result || errorMessage.ERM033);
  //         } else if (result.data && result.data.token) {
  //           console.log("Successfully created new Firebase token");
  //           await setItem("firebaseToken", result.data.token);
  //           setFirebaseToken(result.data.token);
  //         } else {
  //           console.error("Invalid token response format:", result);
  //           setFirebaseError(errorMessage.ERM033);
  //         }
  //       } catch (error) {
  //         console.error("Error creating custom token:", error);
  //         setFirebaseError(errorMessage.ERM033);
  //       }
  //     } else if (!hasValidAccessToken) {
  //       console.log("No valid access token, skipping Firebase token creation");
  //       // Optionally clear firebase token if access token is invalid
  //       // if (hasValidFirebaseToken) {
  //       //   await removeItem("firebaseToken")
  //       //   setFirebaseToken(undefined)
  //       // }
  //     } else {
  //       console.log("Using existing Firebase token");
  //     }
  //   })();
  // }, [accessToken, firebaseToken, createCustomToken]);

  useEffect(() => {
    ;(async () => {
      try {
        log.info('Checking stored token', process.env.EXPO_PUBLIC_API_URL)

        // Fetch roles on initial load - doesn't depend on authentication
        await fetchRoles()

        const storedToken = await Promise.all([
          getItem('accessToken'),
          getItem('refreshToken'),
          getItem('firebaseToken')
        ])
        console.log('storedToken', storedToken)

        if (storedToken[0] && storedToken[1]) {
          setAccessToken(storedToken[0])
          setRefreshToken(storedToken[1])
          const decodedToken = jwtDecode(storedToken[0])
          if (decodedToken.exp && decodedToken.exp * 1000 > Date.now()) {
            navigation.reset({
              index: 0,
              routes: [{ name: '(app)' as never }]
            })
          }
        }

        if (storedToken[2]) {
          setFirebaseToken(storedToken[2])
        }
      } catch (error) {
        log.error(error)
        navigation.reset({
          index: 0,
          routes: [{ name: 'welcome' as never }]
        })
      }
    })()
  }, [navigation, fetchRoles])

  return (
    <AuthContext.Provider
      value={{
        login: async (email, password) => {
          try {
            const { data: res } = await POST('/auth/login', { email, password }, {}, {})

            setAccessToken(res.data?.accessToken)
            setRefreshToken(res.data?.refreshToken)
            await setItem('accessToken', res.data?.accessToken)
            await setItem('refreshToken', res.data?.refreshToken)
            if (navigation.canGoBack()) {
              navigation.goBack()
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'welcome' as never }]
              })
            }
            return true
          } catch (error) {
            console.log('error 130', error)

            return resolveError(error)
          }
        },
        logout: async () => {
          try {
            await AsyncStorage.removeItem('refreshToken')
            await AsyncStorage.removeItem('accessToken')
            await AsyncStorage.removeItem('firebaseToken')
            setAccessToken(undefined)
            setRefreshToken(undefined)
            setFirebaseToken(undefined)
          } catch (error) {
            return resolveError(error)
          }
        },
        saveFirebaseToken: async (firebaseToken: string) => {
          try {
            await setItem('firebaseToken', firebaseToken)
            setFirebaseToken(firebaseToken)
          } catch (error) {
            return resolveError(error)
          }
        },
        removeFirebaseToken: async () => {
          try {
            await removeItem('firebaseToken')
            setFirebaseToken(undefined)
          } catch (error) {
            return resolveError(error)
          }
        },
        setToken: async (accessToken, refreshToken) => {
          setAccessToken(accessToken)
          setRefreshToken(refreshToken)
          await setItem('accessToken', accessToken)
          await setItem('refreshToken', refreshToken)
        },
        fetchRoles,
        getRoleByEnum,
        getRoleNameByEnum,
        isRolesLoaded,
        accessToken,
        refreshToken,
        firebaseToken,
        roles,
        mappedRoles,
        isLoadingRoles
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
