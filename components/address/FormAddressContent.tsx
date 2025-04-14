/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Control, Controller, FieldErrors, UseFormResetField, UseFormWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View } from 'react-native'
import { Checkbox, RadioButton, RadioGroup, TextField } from 'react-native-ui-lib'
import { z } from 'zod'

import { myTheme } from '@/constants'
import { getDistrictsByProvinceApi, getProvincesApi, getWardsByDistrictApi } from '@/hooks/api/address'
import { CreateAddressSchema } from '@/schema/address.schema'
import { AddressEnum } from '@/types/enum'

interface FormAddressContentProps {
  control: Control<z.infer<typeof CreateAddressSchema>>
  errors: FieldErrors<z.infer<typeof CreateAddressSchema>>
  watch: UseFormWatch<z.infer<typeof CreateAddressSchema>>
  resetField: UseFormResetField<z.infer<typeof CreateAddressSchema>>
  initialAddress?: {
    province?: string
    district?: string
    ward?: string
  }
}
export default function FormAddressContent({
  control,
  errors,
  initialAddress,
  resetField,
  watch
}: FormAddressContentProps) {
  const { t } = useTranslation()
  // const [provinces, setProvinces] = useState<IProvince[]>([])
  const [provinceCode, setProvinceCode] = useState<string>('')
  const [districtCode, setDistrictCode] = useState<string>('')
  const [selectedType, setSelectedType] = useState<AddressEnum | ''>('')

  const handleTypeSelection = (type: AddressEnum) => {
    setSelectedType(type)
  }

  const { data: provinces } = useQuery({
    queryKey: [getProvincesApi.queryKey],
    queryFn: getProvincesApi.fn
  })

  const { data: province } = useQuery({
    queryKey: [getDistrictsByProvinceApi.queryKey, provinceCode as string],
    queryFn: getDistrictsByProvinceApi.fn,
    enabled: !!provinceCode // Only fetch when provinceCode is available
  })

  const { data: district, isLoading: isWardsLoading } = useQuery({
    queryKey: [getWardsByDistrictApi.queryKey, districtCode as string],
    queryFn: getWardsByDistrictApi.fn,
    enabled: !!districtCode // Only fetch when districtCode is available
  })

  const handleProvinceChange = (provinceCode: string) => {
    setProvinceCode(provinceCode)
    resetField('district')
    resetField('ward')
  }

  const handleDistrictChange = (districtCode: string) => {
    setDistrictCode(districtCode)
    resetField('ward')
  }

  useEffect(() => {
    if (provinces && initialAddress?.province) {
      const selectedProvince = provinces.find((p) => p.name === initialAddress.province)
      if (selectedProvince) {
        setProvinceCode(selectedProvince.code)
      }
    }
  }, [provinces, initialAddress?.province])
  useEffect(() => {
    if (province?.districts && initialAddress?.district) {
      const selectedDistrict = province.districts.find((d) => d.name === initialAddress.district)
      if (selectedDistrict) {
        setDistrictCode(selectedDistrict.code)
      }
    }
  }, [province?.districts, initialAddress?.district])
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {/* Full Name Input */}
        <View style={{ marginVertical: 8 }}>
          <Text style={{ marginBottom: 8 }}>{t('address.fullName')}</Text>
          <Controller
            control={control}
            name='fullName'
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <TextField
                  placeholder={t('address.enterFullName')}
                  onChangeText={onChange}
                  value={value}
                  style={{
                    borderWidth: 1,
                    borderColor: error ? 'red' : myTheme.primary,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10
                  }}
                />
                {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Phone Input */}
        <View style={{ marginVertical: 8 }}>
          <Text style={{ marginBottom: 8 }}>{t('address.phone')}</Text>
          <Controller
            control={control}
            name='phone'
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                {/* Replace with React Native Phone Input component */}
                <TextField
                  placeholder={t('address.phone')}
                  onChangeText={onChange}
                  value={value}
                  keyboardType='phone-pad'
                  style={{
                    borderWidth: 1,
                    borderColor: error ? 'red' : myTheme.primary,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10
                  }}
                />
                {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Province Picker */}
        <View style={{ marginVertical: 8 }}>
          <Text style={{ marginBottom: 8 }}>{t('address.provinceOrCity')}</Text>
          <Controller
            control={control}
            name='province'
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                {/* Replace with React Native Picker or Dropdown */}
                <TextField
                  placeholder={t('address.chooseProvinceOrCity')}
                  onChangeText={(selectedProvince) => {
                    const province = provinces?.find((p) => p.name === selectedProvince)
                    onChange(selectedProvince)
                    handleProvinceChange(province?.code ?? '')
                  }}
                  value={value}
                  style={{
                    borderWidth: 1,
                    borderColor: error ? 'red' : myTheme.primary,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10
                  }}
                />
                {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* District Picker */}
        <View style={{ marginVertical: 8 }}>
          <Text style={{ marginBottom: 8 }}>{t('address.district')}</Text>
          <Controller
            control={control}
            name='district'
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                {/* Replace with React Native Picker or Dropdown */}
                <TextField
                  placeholder={t('address.chooseDistrict')}
                  onChangeText={(selectedDistrict) => {
                    const district = province?.districts?.find((d) => d.name === selectedDistrict)
                    onChange(selectedDistrict)
                    handleDistrictChange(district?.code ?? '')
                  }}
                  value={value}
                  editable={!!watch('province')}
                  style={{
                    borderWidth: 1,
                    borderColor: error ? 'red' : myTheme.primary,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: !watch('province') ? '#f0f0f0' : 'white'
                  }}
                />
                {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Ward Picker */}
        <View style={{ marginVertical: 8 }}>
          <Text style={{ marginBottom: 8 }}>{t('address.ward')}</Text>
          <Controller
            control={control}
            name='ward'
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                {/* Replace with React Native Picker or Dropdown */}
                <TextField
                  placeholder={t('address.chooseWard')}
                  onChangeText={onChange}
                  value={value}
                  editable={!!watch('district')}
                  style={{
                    borderWidth: 1,
                    borderColor: error ? 'red' : myTheme.primary,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: !watch('district') ? '#f0f0f0' : 'white'
                  }}
                />
                {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Detail Address */}
        <View style={{ marginVertical: 8 }}>
          <Text style={{ marginBottom: 8 }}>{t('address.detailAddress')}</Text>
          <Controller
            control={control}
            name='detailAddress'
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <TextField
                  multiline
                  numberOfLines={4}
                  placeholder={t('address.enterDetailAddress')}
                  onChangeText={onChange}
                  value={value}
                  style={{
                    borderWidth: 1,
                    borderColor: error ? 'red' : myTheme.primary,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    height: 100
                  }}
                />
                {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
              </View>
            )}
          />
        </View>
        {/* Notes */}
        <View style={{ marginVertical: 8 }}>
          <Text style={{ marginBottom: 8 }}>{t('address.notes')}</Text>
          <Controller
            control={control}
            name='notes'
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <TextField
                  multiline
                  numberOfLines={4}
                  placeholder={t('address.enterNotes')}
                  onChangeText={onChange}
                  value={value}
                  style={{
                    borderWidth: 1,
                    borderColor: error ? 'red' : myTheme.primary,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    height: 100
                  }}
                />
                {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Address Type Radio */}
        <View style={{ marginVertical: 8 }}>
          <Text style={{ marginBottom: 8 }}>{t('address.addressType')}</Text>
          <Controller
            control={control}
            name='type'
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}
                >
                  <RadioGroup
                    initialValue={value}
                    onValueChange={onChange}
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {Object.values(AddressEnum).map((type) => (
                      <View
                        key={type}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <RadioButton
                          value={type}
                          color={myTheme.primary}
                          label={t(`address.addressTypeValue${type.charAt(0) + type.slice(1).toLocaleLowerCase()}`, {
                            type
                          })}
                          size={18}
                        />
                      </View>
                    ))}
                  </RadioGroup>
                </View>
                {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Default Address Checkbox */}
        <View style={{ marginVertical: 8 }}>
          <Controller
            control={control}
            name='isDefault'
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Checkbox
                  value={value}
                  onValueChange={() => onChange(!value)}
                  style={{ alignSelf: 'center', borderRadius: 6 }}
                  color={myTheme.primary}
                  size={18}
                />
                <Text style={{ marginLeft: 8 }}>{t('address.setAsDefault')}</Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  )
}
