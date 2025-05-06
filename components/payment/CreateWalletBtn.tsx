/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-native-ui-lib'

import { getMyWalletApi, createWalletApi } from '@/hooks/api/wallet'

const CreateWalletBtn = () => {
  const { t } = useTranslation()

  const { mutateAsync: createWalletFn, isPending } = useMutation({
    mutationKey: [createWalletApi.mutationKey],
    mutationFn: createWalletApi.fn
  })
  const queryClient = useQueryClient()

  const handleCreateWallet = async () => {
    // if (!user) return
    // await createWalletFn({ ownerId: user.id, balance: 10000000 })
    // queryClient.invalidateQueries({
    //   queryKey: [getMyWalletApi.queryKey]
    // })
  }

  return (
    <Button
      label={t('walletTerm.createWallet')}
      onPress={handleCreateWallet}
      disabled={isPending}
      loading={isPending}
    />
  )
}

export default CreateWalletBtn
