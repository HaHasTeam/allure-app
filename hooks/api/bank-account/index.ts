import { IBankAccount, TCreateBankAccountParams } from './type'

import { TServerResponse } from '@/types/request'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { privateRequest } from '@/utils/request'

// Lấy danh sách tài khoản ngân hàng
export const getBankAccountsApi = toQueryFetcher<void, TServerResponse<IBankAccount[]>>(
  'getBankAccountsApi',
  async () => {
    return privateRequest('/bank-accounts')
  }
)

// Tạo tài khoản ngân hàng mới
export const createBankAccountApi = toMutationFetcher<TCreateBankAccountParams, TServerResponse<IBankAccount>>(
  'createBankAccountApi',
  async (data) => {
    return privateRequest('/bank-accounts', {
      method: 'POST',
      data
    })
  }
)

/**
 * Deletes a bank account
 */
export const deleteBankAccountApi = toMutationFetcher<string, TServerResponse<void>>(
  'delete-bank-account',
  async (bankAccountId) => {
    return privateRequest(`/bank-accounts/${bankAccountId}`, {
      method: 'DELETE'
    })
  }
)

/**
 * Updates a bank account
 */
export const updateBankAccountApi = toMutationFetcher<
  { id: string; data: Omit<IBankAccount, 'id'> },
  TServerResponse<IBankAccount>
>('update-bank-account', async ({ id, data }) => {
  return privateRequest(`/bank-accounts/${id}`, {
    method: 'PUT',
    data
  })
})

/**
 * Sets a bank account as default
 */
export const setDefaultBankAccountApi = toMutationFetcher<string, TServerResponse<IBankAccount>>(
  'set-default-bank-account',
  async (bankAccountId) => {
    return privateRequest(`/bank-accounts/${bankAccountId}`, {
      method: 'PUT',
      data: {
        isDefault: true
      }
    })
  }
)
