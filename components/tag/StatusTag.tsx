import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { myTheme } from '@/constants'

interface StatusTagProps {
  tag: string
  text?: string
}

export default function StatusTag({ tag, text }: StatusTagProps) {
  const { t } = useTranslation()

  let tagStyle = {}
  let tagText = ''

  // Define color based on tag
  switch (tag) {
    case 'Default': // for default address
      tagStyle = styles.default
      tagText = t('statusTag.default')
      break
    case 'BestVoucher':
      tagStyle = styles.bestVoucher
      tagText = t('voucher.bestChoice')
      break
    case 'numberCount':
      tagStyle = styles.numberCount
      break
    default:
      tagStyle = styles.defaultTag
      tagText = tag // Default to the tag string if no match is found
      break
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.text, tagStyle]}>{text ? text : tagText}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10
  },
  text: {
    fontSize: 12,
    fontWeight: 'medium'
  },
  default: {
    color: myTheme.primary,
    backgroundColor: myTheme.white,
    borderWidth: 1,
    borderColor: myTheme.primary,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 4
  },
  defaultTag: { color: myTheme.gray[800], backgroundColor: myTheme.gray[200] },
  bestVoucher: {
    color: myTheme.white,
    backgroundColor: myTheme.green[500],
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2
  },
  numberCount: {
    color: myTheme.white,
    backgroundColor: myTheme.orange[500],
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2
  }
})
