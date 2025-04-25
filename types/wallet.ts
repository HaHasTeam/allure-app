import { TMetaData } from './request'
import { TUser } from './user'

import { IBankAccount } from '@/hooks/api/bank-account/type'

export interface IWithdrawalRequest extends TMetaData {
  id: string
  amount: number
  status: WithdrawalRequestStatusEnum

  // Direct bank details based on withdrawalRequest.entity.ts
  bankName: string
  accountNumber: string
  accountName: string

  // Optional fields from entity
  rejectedReason?: string

  // Relationships
  account?: TUser
  processedBy?: TUser

  // Previous fields still kept for compatibility
  bankAccount?: IBankAccount

  createdAt: string
  updatedAt: string
}

export enum WithdrawalRequestStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export type WithdrawalRequestFilterParams = {
  statuses?: WithdrawalRequestStatusEnum[]
  page?: number
  limit?: number
}

export type TWallet = TMetaData & {
  balance: number
  availableBalance: number
  owner?: TUser
}
