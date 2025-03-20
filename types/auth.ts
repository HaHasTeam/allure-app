export type TAuth = {
  accessToken: string
  refreshToken: string
}

export type TEmailDecoded = {
  accountId: string
}

export type TInviteSignupDecoded = {
  email: string
  brand: string
  role: string
}
