import { StatusEnum } from './enum'
import { IImage } from './image'
import { IPreOrder } from './pre-order'
import { IProduct } from './product'
import { IProductDiscount } from './product-discount'
import { TMetaData } from './request'

export type TClassification = TMetaData & {
  title: string
  price: number
  quantity: number
  image: string | null
  status: ClassificationStatusEnum
}

export interface IClassificationSelection {
  color: string | null
  size: string | null
  other: string | null
}

export type IClassificationKey = keyof IClassificationSelection

export type IClassification = IClassificationSelection & {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  price: number
  quantity: number
  sku: string
  type: string
  status?: StatusEnum.ACTIVE | StatusEnum.INACTIVE
  images: IImage[]
  product: IProduct
  preOrderProduct?: IPreOrder | null
  productDiscount?: IProductDiscount | null
}

export interface IClassificationWithSecondLevel extends IClassification {
  secondLevel: string | undefined
}

export enum ClassificationStatusEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}
