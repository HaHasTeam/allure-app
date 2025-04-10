import { GroupBuyingCriteria, TGroupProduct } from './group-product'
import { TMetaData } from './request'
import { TUser } from './user'

export type TGroupBuying = TMetaData & {
  startTime?: string
  endTime: string
  status: GroupBuyingStatusEnum
  groupProduct: TGroupProduct
  criteria: GroupBuyingCriteria
  creator: TUser
}

export enum GroupBuyingStatusEnum {
  'ACTIVE' = 'ACTIVE',
  'INACTIVE' = 'INACTIVE',
}
