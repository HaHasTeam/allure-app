import { TUser, UserStatusEnum } from '@/types/user'

export type TCreateUserRequestParams = Pick<TUser, 'username' | 'email' | 'password' | 'phone'> & {
  brands?: string[]
  role: string
} & Partial<Omit<TUser, 'role' | 'brands'>> & {
    redirectUrl?: string
    brands?: string[]
  }

export type TLoginUserRequestParams = Pick<TUser, 'email' | 'password'>

export type TUpdateUserRequestParams = Partial<Omit<TUser, 'email' | 'password'>>

export type TInviteCoWorkerRequestParams = Pick<TUser, 'email'> & {
  role: string
  brand?: string
  redirectUrl?: string
}

export type TInviteMultipleCoWorkersRequestParams = {
  emails: string[]
  role: string
  brand?: string
  redirectUrl?: string
}

export type TUserResponse = TUser

export type TUpdateUserStatusRequestParams = {
  id: string
  status: UserStatusEnum
}

export type TUpdateUsersListStatusRequestParams = {
  ids: string[]
  status: UserStatusEnum
}
