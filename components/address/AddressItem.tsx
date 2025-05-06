import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useRef, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RadioButton } from 'react-native-ui-lib'

import UpdateAddressDialog from './UpdateAddressDialog'
import StatusTag from '../tag/StatusTag'

import { myTheme } from '@/constants'
import { IAddress } from '@/types/address'
import { hexToRgba } from '@/utils/color'

interface AddressItemProps {
  address: IAddress
  selectedAddressId?: string
  isShowRadioItem?: boolean
  handleAddressSelection: (addressId: string | undefined) => void
}
const AddressItem = ({
  address,
  selectedAddressId,
  isShowRadioItem = true,
  handleAddressSelection
}: AddressItemProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const toggleModalVisibility = () => {
    if (isModalVisible) {
      bottomSheetModalRef.current?.close() // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present() // Open modal if it's not visible
    }
    setIsModalVisible(!isModalVisible) // Toggle the state
  }
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* content */}
        <View style={styles.flex}>
          {isShowRadioItem ? (
            <View style={styles.radioContainer}>
              <RadioButton
                selected={address?.id === selectedAddressId}
                id={address?.id}
                onPress={() => handleAddressSelection(address?.id)}
                size={16}
                color={myTheme.primary}
              />
            </View>
          ) : null}
          <View style={styles.addressDetails}>
            <View style={styles.headerSection}>
              <View style={styles.nameSection}>
                <View style={styles.namePart}>
                  <View style={[styles.circleIcon, { backgroundColor: hexToRgba(myTheme.secondary, 0.5) }]}>
                    <AntDesign name='user' color={myTheme.gray[500]} size={16} />
                  </View>
                  <Text style={styles.nameText}>{address?.fullName ?? ''}</Text>
                </View>
              </View>
            </View>
          </View>
          <View>
            <View style={[styles.flex, styles.alignCenter]}>
              <View>{address?.isDefault && <StatusTag tag='Default' />}</View>
              {/* update */}
              <TouchableOpacity style={styles.buttonLink} onPress={() => toggleModalVisibility()}>
                {/* <Text style={}>{t("address.update")}</Text> */}
                <MaterialCommunityIcons name='pencil' style={styles.buttonLinkText} />
              </TouchableOpacity>
              <UpdateAddressDialog
                address={address}
                bottomSheetModalRef={bottomSheetModalRef}
                setIsModalVisible={setIsModalVisible}
                toggleModalVisible={toggleModalVisibility}
              />
            </View>
          </View>
        </View>
        <View style={styles.phoneAddressContainer}>
          <View style={styles.phonePart}>
            <View style={[styles.circleIcon, { backgroundColor: hexToRgba(myTheme.secondary, 0.5) }]}>
              <AntDesign name='phone' color={myTheme.gray[500]} size={16} />
            </View>
            <Text>{address?.phone ?? ''}</Text>
          </View>
          <View style={styles.addressLine}>
            <View style={[styles.circleIcon, { backgroundColor: hexToRgba(myTheme.secondary, 0.5) }]}>
              <Feather name='map-pin' color={myTheme.gray[500]} size={16} />
            </View>
            <Text style={styles.addressText}>{address?.fullAddress ?? ''}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AddressItem

const styles = StyleSheet.create({
  phoneAddressContainer: {
    gap: 8,
    marginLeft: 24
  },
  alignCenter: {
    alignItems: 'center'
  },
  buttonLinkText: {
    color: myTheme.blue[500]
  },
  buttonLink: {},
  container: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8
  },
  flex: {
    flexDirection: 'row',
    gap: 8
  },
  contentWrapper: {
    padding: 8,
    gap: 6
  },
  radioContainer: {
    height: 32,
    justifyContent: 'center'
  },
  addressDetails: {
    flex: 1,
    flexDirection: 'column',
    gap: 12
  },
  headerSection: {
    // flexDirection: "row",
    // justifyContent: "center",
    // alignItems: "center",
  },
  nameSection: {
    // flexDirection: "row",
    // alignItems: "center",
    gap: 8
  },
  namePart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8
  },
  phonePart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  nameText: {
    fontWeight: '500'
  },
  addressSection: {
    flexDirection: 'column',
    gap: 8
  },
  addressLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4
  },
  addressText: {
    color: '#4B5563',
    fontSize: 14,
    flex: 1
  },
  circleIcon: {
    borderRadius: 9999,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  defaultTag: {
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12
  }
})
