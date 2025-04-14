import { Feather } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'

import FileDownloadButton from './FileDownLoadButton'

import { myTheme } from '@/constants'
import { CustomFile } from '@/types/file'
import { hexToRgba } from '@/utils/color'

// Types
type DirectionOptions = 'rtl' | 'ltr' | undefined

type FileUploaderContextType = {
  pickDocument: () => Promise<void>
  isLOF: boolean
  isFileTooBig: boolean
  removeFileFromSet: (index: number) => void
  activeIndex: number
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>
  orientation: 'horizontal' | 'vertical'
  direction: DirectionOptions
  getPreviewUrl: (index: number) => string
}

const FileUploaderContext = createContext<FileUploaderContextType | null>(null)

export const useFileUpload = () => {
  const context = useContext(FileUploaderContext)
  if (!context) {
    throw new Error('useFileUpload must be used within a FileUploaderProvider')
  }
  return context
}

type FileUploaderProps = {
  value: CustomFile[] | null
  reSelect?: boolean
  onValueChange: (value: CustomFile[] | null) => void
  dropzoneOptions: {
    accept?: Record<string, string[]>
    maxFiles?: number
    maxSize?: number
    multiple?: boolean
  }
  orientation?: 'horizontal' | 'vertical'
  customMaxFiles?: number
  style?: any
  dir?: DirectionOptions
}

/**
 * File upload Docs: {@link: https://localhost:3000/docs/file-upload}
 */
export const FileUploader = ({
  style,
  dropzoneOptions,
  value,
  onValueChange,
  reSelect,
  orientation = 'vertical',
  customMaxFiles = 1,
  children,
  dir,
  ...props
}: FileUploaderProps & React.ComponentProps<typeof View>) => {
  const [isFileTooBig, setIsFileTooBig] = useState(false)
  const [isLOF, setIsLOF] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const router = useRouter()

  const {
    accept = {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    },
    maxFiles = customMaxFiles,
    maxSize = 4 * 1024 * 1024,
    multiple = true
  } = dropzoneOptions

  const reSelectAll = maxFiles === 1 ? true : reSelect
  const direction: DirectionOptions = dir === 'rtl' ? 'rtl' : 'ltr'

  const removeFileFromSet = useCallback(
    (i: number) => {
      if (!value) return
      const newFiles = value.filter((_, index) => index !== i)
      onValueChange(newFiles.length > 0 ? newFiles : null)
    },
    [value, onValueChange]
  )

  // Document picker function
  const pickDocument = async () => {
    try {
      if (isLOF) return

      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        multiple,
        copyToCacheDirectory: true
      })

      if (result.canceled) return

      const files = result.assets

      if (!files || files.length === 0) {
        console.error('File error, probably too big')
        return
      }

      const newValues: CustomFile[] = value ? [...value] : []

      if (reSelectAll) {
        newValues.splice(0, newValues.length)
      }

      for (const file of files) {
        if (newValues.length < maxFiles) {
          // Check file size
          if (file?.size && file?.size > maxSize) {
            setIsFileTooBig(true)
            console.error(`File is too large. Max size is ${maxSize / 1024 / 1024}MB`)
            continue
          }

          newValues.push({
            fileUrl: file.uri,
            size: file?.size ? file?.size : 0,
            ...file
          })
        }
      }

      onValueChange(newValues.length > 0 ? newValues : null)
      setIsFileTooBig(false)
    } catch (error) {
      console.error('Error picking document', error)
    }
  }

  useEffect(() => {
    if (!value) return
    if (value.length === maxFiles) {
      setIsLOF(true)
      return
    }
    setIsLOF(false)
  }, [value, maxFiles])

  const getPreviewUrl = (index: number) => {
    if (!value) return ''
    const file = value[index]
    return file.fileUrl ?? ''
  }

  return (
    <FileUploaderContext.Provider
      value={{
        getPreviewUrl,
        pickDocument,
        isLOF,
        isFileTooBig,
        removeFileFromSet,
        activeIndex,
        setActiveIndex,
        orientation,
        direction
      }}
    >
      <View
        style={[
          styles.container,
          style,
          value && value.length > 0 && styles.containerWithGap,
          direction === 'rtl' && styles.rtlContainer
        ]}
        {...props}
      >
        {children}
      </View>
    </FileUploaderContext.Provider>
  )
}

export const FileUploaderContent = ({ children, style, ...props }: React.ComponentProps<typeof View>) => {
  const { orientation } = useFileUpload()
  const containerRef = useRef<View>(null)

  return (
    <View style={styles.contentContainer} ref={containerRef} accessibilityLabel='content file holder'>
      <View
        {...props}
        style={[styles.content, orientation === 'horizontal' ? styles.rowContent : styles.columnContent, style]}
      >
        {children}
      </View>
    </View>
  )
}

export const FileUploaderItem = ({
  style,
  index,
  children,
  ...props
}: { index: number } & React.ComponentProps<typeof View>) => {
  const { removeFileFromSet, activeIndex, direction, getPreviewUrl } = useFileUpload()
  const isSelected = index === activeIndex
  const previewUrl = getPreviewUrl(index)

  // Function to handle preview
  const handlePreview = async () => {
    Linking.openURL(previewUrl)
  }

  return (
    <View style={[styles.item, style, isSelected && styles.selectedItem]} {...props}>
      <View style={styles.itemContent}>{children}</View>
      <View style={[styles.itemActions, direction === 'rtl' ? styles.actionsRtl : styles.actionsLtr]}>
        <TouchableOpacity onPress={handlePreview}>
          <Feather name='eye' size={16} color={myTheme.green[700]} style={styles.actionIcon} />
        </TouchableOpacity>
        <FileDownloadButton previewUrl={previewUrl} fileName={previewUrl} index={index} />
        <TouchableOpacity onPress={() => removeFileFromSet(index)}>
          <Feather name='x' size={16} color={myTheme.red[700]} style={styles.actionIcon} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export const FileInput = ({
  style,
  children,
  disabled,
  ...props
}: React.ComponentProps<typeof View> & { disabled?: boolean }) => {
  const { pickDocument, isFileTooBig, isLOF } = useFileUpload()
  const isDisabled = disabled || isLOF

  return (
    <View {...props} style={[styles.fileInputContainer, isDisabled && styles.disabled, style]}>
      <TouchableOpacity
        style={[styles.fileInput, isFileTooBig && styles.inputError, style]}
        onPress={pickDocument}
        disabled={isDisabled}
      >
        {children}
      </TouchableOpacity>
    </View>
  )
}

export const ProductFileUploaderItem = ({
  style,
  index,
  children,
  ...props
}: { index: number } & React.ComponentProps<typeof View>) => {
  const { removeFileFromSet, activeIndex, direction } = useFileUpload()
  const isSelected = index === activeIndex

  return (
    <View style={[styles.productItem, style, isSelected && styles.selectedItem]} {...props}>
      <View style={styles.productItemContent}>{children}</View>
      <TouchableOpacity
        style={[styles.removeButton, direction === 'rtl' ? styles.removeButtonRtl : styles.removeButtonLtr]}
        onPress={() => removeFileFromSet(index)}
      >
        <Feather name='x' size={16} color='white' style={styles.removeIcon} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  containerWithGap: {
    gap: 8
  },
  rtlContainer: {
    direction: 'rtl'
  },
  contentContainer: {
    width: '100%'
  },
  content: {
    borderRadius: 12,
    gap: 4
  },
  rowContent: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  columnContent: {
    flexDirection: 'column'
  },
  item: {
    justifyContent: 'space-between',
    position: 'relative',
    height: '100%',
    padding: 8,
    borderWidth: 2,
    borderColor: myTheme.gray[300]
  },
  selectedItem: {
    backgroundColor: hexToRgba(myTheme.gray[500], 0.1)
  },
  itemContent: {
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: '100%',
    width: '100%'
  },
  itemActions: {
    position: 'absolute',
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  actionsLtr: {
    right: 8
  },
  actionsRtl: {
    left: 8
  },
  actionIcon: {
    fontWeight: 'bold'
  },
  fileInputContainer: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  disabled: {
    opacity: 0.5
  },
  fileInput: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: myTheme.gray[300],
    borderStyle: 'solid'
  },
  inputError: {
    borderColor: myTheme.red[500]
  },
  productItem: {
    position: 'relative',
    backgroundColor: hexToRgba(myTheme.black, 0.05)
  },
  productItemContent: {
    position: 'absolute',
    zIndex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    height: '100%',
    width: '100%'
  },
  removeButton: {
    position: 'absolute',
    zIndex: 20,
    backgroundColor: hexToRgba(myTheme.black, 0.4),
    padding: 4,
    borderRadius: 2,
    top: 8
  },
  removeButtonLtr: {
    right: 8
  },
  removeButtonRtl: {
    left: 8
  },
  removeIcon: {
    width: 16,
    height: 16
  }
})
