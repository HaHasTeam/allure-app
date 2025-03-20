import { TAuth } from '@/types'
import { TUserPa } from '@/types/user'

export type AuthState = {
  isLoading: boolean
  isAuthenticated: boolean
  user?: TUserPa | null
  authData: TAuth | null
}

export type AuthActions = {
  initialize: (isAuthenticated: boolean, user?: TUserPa) => void
  authenticate: (user: TUserPa) => void
  unAuthenticate: () => void
  resetAuth: () => void
  setAuthState: (params: Partial<AuthState>) => void
}

export type AuthSlice = AuthState & AuthActions
