import { TBrand } from './brand'
import { IClassification } from './classification'
import { IImage } from './image'
import { IResponseProduct } from './product'
import { TMetaData } from './request'

export type TFlashSale = TMetaData & {
  startTime: string
  endTime: string
  discount: number
  product: IResponseProduct
  brand: TBrand
  images: IImage[]
  status: FlashSaleStatusEnum
  productClassifications: IClassification[]
}

export enum FlashSaleStatusEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}
