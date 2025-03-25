import { TClassification } from '@/types/classification'
import { TPreOrder } from '@/types/pre-order'

export type TAddPreOderRequestParams = Pick<TPreOrder, 'startTime' | 'endTime' | 'images'> & {
  product: string
  productClassifications: Pick<TClassification, 'image' | 'price' | 'quantity' | 'title'>[]
}

export type TGetPreOrderByIdRequestParams = {
  id: string
}

export type TUpdatePreOrderRequestParams = Partial<TPreOrder> & {
  id: string
}
