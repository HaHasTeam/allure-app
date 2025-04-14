import { IAddress } from './address'
import { IBrand } from './brand'
import { TMetaData } from './request'
import { TRoleResponse, UserRoleEnum } from './role'

export enum UserGenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum UserStatusEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED'
}

export type TUser = TMetaData & {
  firstName?: string
  lastName?: string
  username: string
  email: string
  password: string
  role: TRoleResponse
  gender?: UserGenderEnum | string
  phone?: string
  dob?: string
  avatar?: string
  status: UserStatusEnum | string
  isEmailVerify: boolean
  brands?: IBrand[]
}
export type TUserPa = TMetaData & {
  firstName?: string
  lastName?: string
  username: string
  email: string
  password: string
  role: UserRoleEnum | string
  gender?: UserGenderEnum | string
  phone?: string
  dob?: string
  avatar?: string
  status: UserStatusEnum | string
  isEmailVerify: boolean
  brands?: IBrand[]
  addresses?: IAddress[]
}
export type TUserUpdateStatusTracking = TMetaData & {
  firstName?: string
  lastName?: string
  username: string
  email: string
  password: string
  role: TRoleResponse
  gender?: UserGenderEnum | string
  phone?: string
  dob?: string
  avatar?: string
  status: UserStatusEnum | string
  isEmailVerify: boolean
  brands?: IBrand[]
}
