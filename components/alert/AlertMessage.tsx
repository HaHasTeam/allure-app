import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { myTheme } from '@/constants'

type AlertMessageProps = {
  message: string
  style?: object
  size?: 'small' | 'medium' | 'large'
  textSize?: 'small' | 'medium' | 'large'
  titleSize?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'accent' | 'warn' | 'black' | 'danger' | 'success'
  text?: 'primary' | 'secondary' | 'accent' | 'black' | 'danger' | 'black' | 'success'
  titleStyle?: object
  title?: string
  isShowIcon?: boolean
  onPress?: () => void
  buttonText?: string
  buttonStyle?: object
}

const AlertMessage = ({
  message,
  style,
  size = 'medium',
  color = 'warn',
  text = 'black',
  textSize = 'medium',
  titleStyle,
  title,
  titleSize = 'large',
  isShowIcon = true,
  buttonText,
  onPress,
  buttonStyle
}: AlertMessageProps) => {
  const { t } = useTranslation()

  // Convert Tailwind size classes to numeric values
  const sizeValues = {
    small: 8,
    medium: 16,
    large: 32
  }

  // Convert Tailwind text size classes to React Native sizes
  const textSizeValues = {
    small: 12,
    medium: 14,
    large: 18
  }

  // Map color variants to theme colors
  const getIconColor = (colorName: string) => {
    switch (colorName) {
      case 'danger':
        return myTheme.red[500]
      case 'black':
        return myTheme.foreground
      case 'warn':
        return myTheme.yellow[500]
      case 'primary':
        return myTheme.primary
      case 'secondary':
        return myTheme.secondary
      case 'accent':
        return myTheme.accent
      case 'success':
        return myTheme.green[500]
      default:
        return myTheme.foreground
    }
  }

  const getTextColor = (colorName: string) => {
    switch (colorName) {
      case 'danger':
        return myTheme.red[600]
      case 'black':
        return myTheme.foreground
      case 'warn':
        return myTheme.foreground
      case 'primary':
        return myTheme.background
      case 'secondary':
        return myTheme.background
      case 'accent':
        return myTheme.background
      case 'success':
        return myTheme.foreground
      default:
        return myTheme.foreground
    }
  }

  // Map alert background and border colors
  const getAlertStyle = (colorName: string) => {
    switch (colorName) {
      case 'primary':
        return {
          backgroundColor: `${myTheme.primary}20`,
          borderColor: `${myTheme.primary}80`
        }
      case 'secondary':
        return {
          backgroundColor: myTheme.background,
          borderColor: `${myTheme.secondary}80`
        }
      case 'accent':
        return {
          backgroundColor: `${myTheme.accent}20`,
          borderColor: `${myTheme.accent}80`
        }
      case 'warn':
        return {
          backgroundColor: myTheme.yellow[50],
          borderColor: myTheme.yellow[300]
        }
      case 'black':
        return {
          backgroundColor: myTheme.background,
          borderColor: myTheme.foreground
        }
      case 'danger':
        return {
          backgroundColor: myTheme.red[100],
          borderColor: myTheme.red[300]
        }
      case 'success':
        return {
          backgroundColor: myTheme.green[100],
          borderColor: myTheme.green[300]
        }
      default:
        return {
          backgroundColor: myTheme.yellow[50],
          borderColor: myTheme.yellow[300]
        }
    }
  }

  return (
    <View style={[styles.container, getAlertStyle(color), buttonText && styles.buttonGap, style]}>
      <View style={styles.fullWidth}>
        {title && (
          <Text
            style={[
              styles.title,
              isShowIcon && styles.titleWithIcon,
              { color: getIconColor(color) },
              { fontSize: textSizeValues[titleSize] },
              titleStyle
            ]}
          >
            {title.toUpperCase()}
          </Text>
        )}
        <View style={styles.messageContainer}>
          {isShowIcon && (
            <View>
              <Feather name='info' size={sizeValues[size]} color={getIconColor(color)} />
            </View>
          )}
          <Text style={[styles.message, { color: getTextColor(text) }, { fontSize: textSizeValues[textSize] }]}>
            {message}
          </Text>
        </View>
      </View>
      {buttonText && (
        <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress}>
          <Text style={styles.buttonText}>{t(`button.${buttonText}`)}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  buttonGap: {
    gap: 4
  },
  title: {
    fontWeight: 'bold'
  },
  titleWithIcon: {
    marginLeft: 20
  },
  fullWidth: {
    width: '100%'
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  message: {},
  button: {
    backgroundColor: myTheme.primary,
    padding: 8,
    borderRadius: 4
  },
  buttonText: {
    color: 'white',
    fontWeight: '500'
  }
})

export default AlertMessage
