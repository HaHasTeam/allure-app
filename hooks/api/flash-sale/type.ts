import { TFlashSale } from '@/types/flash-sale'

export type TAddFlashSaleRequestParams = Pick<TFlashSale, 'startTime' | 'endTime' | 'images'> & {
  product: string
}

export type TGetAllFlashSaleByBrandIdRequestParams = {
  brandId: string
}
