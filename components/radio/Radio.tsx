import { Feather } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'

import { myTheme } from '@/constants'

interface RadioProps {
  value: string
  id: string
  checked: boolean
  disabled: boolean
  onSelect: (value: string) => void
}
const RadioButton = ({ value, id, checked, disabled, onSelect }: RadioProps) => {
  return (
    <TouchableOpacity
      id={id}
      style={[styles.radioContainer, disabled && styles.disabled]}
      onPress={() => !disabled && onSelect(value)}
      disabled={disabled}
    >
      <View style={[styles.radioCircle, checked && styles.checkedCircle]}>
        {checked && <Feather name='check' size={14} color='white' />}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: myTheme.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkedCircle: {
    backgroundColor: myTheme.primary
  },
  text: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333'
  },
  disabled: {
    opacity: 0.5
  },
  disabledText: {
    color: myTheme.gray[200]
  }
})

export default RadioButton
