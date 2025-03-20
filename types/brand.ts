import { TMetaData } from './request'

export type TBrand = TMetaData & {
  name: string
  logo: string
  document: string
  description: string
  email: string
  phone: string
  address: string
  star?: number
  status: BrandStatusEnum
}

export enum BrandStatusEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
  DENIED = 'DENIED',
}
export enum StatusEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
  DENIED = 'DENIED',
}
export type IBrand = {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  logo: string
  document: string
  description: string
  email: string
  phone: string
  address: string
  star: number
  status:
    | BrandStatusEnum.ACTIVE
    | BrandStatusEnum.BANNED
    | BrandStatusEnum.INACTIVE
    | BrandStatusEnum.PENDING
    | BrandStatusEnum.DENIED
}

export type IBranch = {
  id?: string
  name: string
  logo?: string
  document: string
  description?: string
  email: string
  phone?: string
  address?: string
  status?: StatusEnum
  createdAt?: string
  updatedAt?: string
  star?: number
}
