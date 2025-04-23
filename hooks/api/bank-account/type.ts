export interface IBankAccount {
  id: string
  accountNumber: string
  accountName: string
  bankName: string
  isDefault?: boolean
  createdAt: string
}

export type TCreateBankAccountParams = Omit<IBankAccount, 'id' | 'createdAt'>
