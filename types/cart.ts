import { IClassification } from './classification'
import { StatusEnum } from './enum'
import { TGroupBuying } from './group-buying'
import { ILivestream } from './livestream'
import { IProductCart } from './product'

export type ICart = {
  id: string
  brandName: string
  products: IProductCart[]
}

export interface ICartItem {
  id: string
  createdAt?: string
  updatedAt?: string
  groupBuying?: TGroupBuying
  quantity: number
  classification?: string
  status: StatusEnum.ACTIVE | StatusEnum.INACTIVE
  productClassification: IClassification
  livestreamDiscount?: number
  livestream?: ILivestream
}

export type ICreateCartItem = Omit<
  ICartItem,
  'createdAt' | 'updatedAt' | 'status' | 'id' | 'productClassification' | 'groupBuying' | 'livestream'
> & {
  productClassification: string
  groupBuying?: string
  livestreamDiscount?: number
  livestream?: string
}
export type IUpdateCartItem = Omit<ICartItem, 'createdAt' | 'updatedAt' | 'status' | 'productClassification'> & {
  productClassification?: string
}
// export interface ICreateCartItem {
//   id: string
//   classification?: string
//   productClassification?: string
//   quantity?: number
// }

export interface ICartByBrand {
  [brandName: string]: ICartItem[]
}

export interface IRemoveCartItem {
  itemIds: string[]
}
