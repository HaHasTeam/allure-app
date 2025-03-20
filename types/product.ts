import { IBrand, TBrand } from './brand'
import { ICategory } from './category'
import { IClassification } from './classification'
import { ProductEnum } from './enum'
import { TServerFile } from './file'
import { IPreOrder } from './pre-order'
import { IProductDiscount } from './product-discount'
import { IImage } from './productImage'
import { TMetaData } from './request'

// common starts
export type TProduct = TMetaData & {
  name: string
  description: string
  detail: string
  brand: TBrand
  images: IImage[]
  status: ProductStatusEnum
  productClassifications: IClassification[]
  certificates: TServerFile[]
  salesLast30Days: number
}

export type IProductDetail = {
  organizationName?: string[]
  organizationAddress?: string[]
  ingredients?: string
  expiryPeriod?: string[]
  volume?: string[]
  batchNumber?: string
  expiryDate?: string
  origin?: string[]
  weight?: string[]
  packagingType?: string[]
  formula?: string[]
  activeIngredients?: string[]
  skinType?: string[]
  productType?: string[]
  skinCare?: string[]
  specialFeatures?: string[]
  versionType?: string[]
  quantityPerPack?: string[]
  storageCondition?: string[]
}

export type IProductClassification = {
  id?: string
  title?: string
  price?: number
  quantity?: number
  images?: File[]
  status?: string
  type?: string
  sku?: string
}
export type IServerProductClassification = {
  id?: string
  title?: string
  price?: number
  quantity?: number
  images?: IImage[]
  status?: string
  type?: string
  sku?: string
}

export type ICreateProduct = {
  id?: string
  name: string
  brand?: string
  category?: string
  images: File[]
  description: string
  status: string
  detail?: IProductDetail
  productClassifications?: IProductClassification[]
  price?: number
  quantity?: number
  sku?: string
}
export type IServerCreateProduct = {
  id?: string
  name?: string
  brand?: string
  category?: string
  images?: IImage[]
  description?: string
  status?: string
  detail?: string
  productClassifications?: IServerProductClassification[]
  price?: number
  quantity?: number
  sku?: string
}
export type IResponseProduct = {
  id: string
  name: string
  brand: IBrand
  category?: ICategory
  images: IImage[]
  description: string
  status: string
  detail: string
  productClassifications: IClassification[]
  price: number
  quantity: number
  sku?: string
  menu?: string
  updatedAt: string
  certificates: TServerFile[]
  average_rating: number
  total_ratings: number
  salesLast30Days: number
}

export type IProductTable = {
  checked?: string
  id?: string
  name: string
  price?: number
  quantity?: number
  status?: string
  updatedAt?: string
  description: string
  detail: string
  brand?: IBrand
  category?: ICategory
  sku?: string
  menu?: string
}

// common ends

// components interface starts
export interface ProductTableProps {
  tableData: TProduct[]
}
// type IProductImage = {
//   id: string
//   image: string
//   fileUrl?: string
// }

export type IProduct = {
  id: string
  name: string
  tag?: string
  price: number
  currentPrice?: number
  images: IImage[]
  deal?: number
  flashSale?: {
    productAmount: number
    soldAmount?: number
  } | null
  rating: number
  ratingAmount: number
  salesLast30Days: number
  description: string
  classifications: IClassification[]
  createdAt?: string
  updatedAt?: string
  detail: string
  sku?: string
  status?: ProductEnum
  brand?: IBrand
  productClassifications?: IClassification[] // use for cart
  productDiscounts?: IProductDiscount[] | null // use for cart
  preOrderProducts?: IPreOrder[] | null // use for cart
  category?: ICategory // use for product details
  certificates: TServerFile[]
}

export type IProductCart = {
  image: string
  name: string
  classifications: IClassification[]
  currentPrice: number
  price: number
  id: string
  eventType: string
  quantity: number
  totalPrice?: number
}
export type IProductCard = {
  id: string
  name: string
  tag?: string
  price?: number
  currentPrice?: number
  images: IImage[]
  deal?: number
  flashSale?: {
    productAmount: number
    soldAmount?: number
  }
  rating: number
  ratingAmount: number
  soldInPastMonth: number
  classifications?: IServerProductClassification[]
  certificate: string
}

// components interface ends

// enum starts
export enum ProductClassificationTypeEnum {
  DEFAULT = 'DEFAULT',
  CUSTOM = 'CUSTOM',
}
export enum ProductStatusEnum {
  FLASH_SALE = 'FLASH_SALE',
  OFFICIAL = 'OFFICIAL',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}
// enum ends
