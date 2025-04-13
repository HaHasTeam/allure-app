import { Feather } from '@expo/vector-icons'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from '.'
import { PreviewDialog } from './PreviewImageDialog'
import MyText from '../common/MyText'

import { myTheme } from '@/constants'
import useHandleServerError from '@/hooks/useHandleServerError'
import { hexToRgba } from '@/utils/color'

type UploadFileModalProps<T extends FieldValues> = {
  header?: ReactNode
  dropZoneConfigOptions?: any
  field: ControllerRenderProps<T>
  renderInputUI?: (isDragActive: boolean, files: File[], maxFiles: number, message?: string) => ReactNode
  renderFileItemUI?: (files: File) => ReactNode
  vertical: boolean
}

const UploadFilePreview = <T extends FieldValues>({
  dropZoneConfigOptions,
  field,
  header,
  renderInputUI,
  renderFileItemUI,
  vertical = true
}: UploadFileModalProps<T>) => {
  const [files, setFiles] = useState<File[]>([])
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const handleServerError = useHandleServerError()

  const { fieldType, fieldValue } = useMemo<{
    fieldType: 'string' | 'array' | 'object'
    fieldValue: string | string[]
  }>(() => {
    if (typeof field?.value === 'string') {
      if (dropZoneConfigOptions?.maxFiles && dropZoneConfigOptions?.maxFiles > 1) {
        throw new Error('Field value must be an array')
      }

      return {
        fieldType: 'string',
        fieldValue: field?.value
      }
    } else if (Array.isArray(field?.value)) {
      return {
        fieldType: 'array',
        fieldValue: field?.value
      }
    } else if (typeof field?.value === 'object') {
      return {
        fieldType: 'array',
        fieldValue: field?.value
      }
    }
    throw new Error('Field value must be a string or an array')
  }, [field?.value, dropZoneConfigOptions?.maxFiles])

  const isDragActive = false
  const dropZoneConfig = {
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx']
    },
    multiple: true,
    maxFiles: 10,
    maxSize: 1 * 1024 * 1024,
    ...dropZoneConfigOptions
  }

  useEffect(() => {
    const transferData = async () => {
      try {
        if (Array.isArray(fieldValue)) {
          if (fieldValue.length === files.length) {
            return
          }

          return setFiles(field?.value)
        }
      } catch (error) {
        handleServerError({
          error
        })
      }
    }
    transferData()
    // eslint-disable-next-line
  }, [fieldValue, fieldType, files.length])

  const onFileDrop = async (newFiles: File[] | null) => {
    const oldFiles = files
    try {
      // Check file is string or array
      // If string, convert to file and set to state
      if (fieldType === 'string') {
        // Value must be an array of files
        if (!newFiles?.length && field.onChange) {
          field.onChange('' as unknown as React.ChangeEvent<HTMLInputElement>)
        }
        if (newFiles?.length) {
          // const fileUrls = await convertFileToUrl(newFiles)

          field?.onChange?.(newFiles[0] as unknown as React.ChangeEvent<HTMLInputElement>)
        }
      }

      // If array, set to state
      if (fieldType === 'array' && field?.value) {
        // console.log('!newFiles?.length', newFiles?.length)

        if (!newFiles) return field.onChange?.([] as unknown as React.ChangeEvent<HTMLInputElement>)
        if (newFiles.length > oldFiles.length) {
          const diffedFiles = newFiles.filter((file) => {
            return !oldFiles?.some(
              (oldFile) => oldFile.name === file.name && oldFile.lastModified === file.lastModified
            )
          })
          const updateFiles = [...diffedFiles, ...field.value]
          setFiles(updateFiles)
          // const newDiffedFileUrls = await convertFileToUrl(diffedFiles)
          field?.onChange?.([
            ...(field?.value as string[]),
            ...diffedFiles
          ] as unknown as React.ChangeEvent<HTMLInputElement>)
        } else {
          const deletedIndex = oldFiles.findIndex((oldFile) => {
            return !newFiles.some((file) => file.name === oldFile.name && file.lastModified === oldFile.lastModified)
          })

          if (deletedIndex !== -1) {
            const updatedFiles = [...field.value]
            updatedFiles.splice(deletedIndex, 1)

            setFiles(updatedFiles)
            field?.onChange?.(updatedFiles as unknown as React.ChangeEvent<HTMLInputElement>)
          }
        }
      }
      // const markedFiles = newFiles?.map((file) => {
      //   return new File([file], file.name, { type: file.type, lastModified: file.lastModified })
      // })

      // setFiles(markedFiles || [])
    } catch (error) {
      handleServerError({
        error
      })
    }
  }
  const message = `You can upload up to ${dropZoneConfig.maxFiles} files. Accepted file formats are ${Object.values(
    dropZoneConfig.accept
  )
    .flat()
    .join(', ')}. Each file must be under ${dropZoneConfig.maxSize / (1024 * 1024)}MB.`

  // Preview content for dialog
  const getPreviewContent = (file: File) => {
    if (file.type.includes('image')) {
      return URL.createObjectURL(file) // Returns URI for RN Image component
    } else {
      return (
        <View style={styles.filePreview}>
          <Feather name='file' size={48} color={myTheme.mutedForeground} />
          <MyText text={file.name} styleProps={styles.fileName} />
        </View>
      )
    }
  }

  return (
    <View style={styles.container}>
      {header}
      <View
        style={[
          styles.dropzone,
          isDragActive
            ? {
                backgroundColor: hexToRgba(myTheme.primary, 0.1),
                borderColor: myTheme.primary
              }
            : { borderColor: myTheme.mutedForeground }
        ]}
      >
        <FileUploader
          value={files}
          onValueChange={onFileDrop}
          dropzoneOptions={dropZoneConfig}
          style={vertical ? styles.vertical : styles.horizontal}
        >
          <FileInput>
            {renderInputUI ? (
              renderInputUI(isDragActive, files, dropZoneConfig.maxFiles, message)
            ) : (
              <TouchableOpacity style={[styles.inputContainer, { borderColor: myTheme.primary }]} activeOpacity={0.7}>
                <Feather name='upload' size={48} style={styles.uploadIcon} color={myTheme.mutedForeground} />

                {isDragActive ? (
                  <MyText text='Drop your file here' styleProps={styles.dragActiveText} />
                ) : (
                  <View>
                    <MyText
                      text='Drag & drop your files here'
                      styleProps={[styles.primaryText, { color: myTheme.primary }]}
                    />
                    <MyText
                      text='or click to select files'
                      styleProps={[styles.secondaryText, { color: myTheme.mutedForeground }]}
                    />
                    {files && files.length < dropZoneConfig.maxFiles ? (
                      <MyText text={message} styleProps={[styles.messageText, { color: myTheme.primary }]} />
                    ) : (
                      <MyText
                        text='You have reached the maximum number of files allowed'
                        styleProps={[styles.messageText, { color: myTheme.primary }]}
                      />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            )}
          </FileInput>

          <FileUploaderContent>
            {files && files.length > 0 && (
              <View>
                {vertical ? (
                  <ScrollView style={[styles.scrollArea, { borderTopColor: myTheme.primary }]}>
                    <View style={styles.filesContainer}>
                      {files.map((file, index) => (
                        <FileUploaderItem key={index} index={index} style={styles.fileItem}>
                          {renderFileItemUI ? (
                            renderFileItemUI(file)
                          ) : (
                            <TouchableOpacity
                              key={file.name}
                              style={styles.filePreviewContainer}
                              onPress={() => setIsVisible(true)}
                            >
                              <View style={styles.fileIconContainer}>
                                {file.type?.includes('image') ? (
                                  <Image
                                    source={{ uri: URL.createObjectURL(file) }}
                                    style={styles.thumbnailImage}
                                    resizeMode='cover'
                                  />
                                ) : (
                                  <Feather name='file' size={48} color={myTheme.mutedForeground} />
                                )}
                              </View>
                              <MyText text={file.name} styleProps={styles.fileNamePreview} />
                            </TouchableOpacity>
                          )}
                          <PreviewDialog
                            style={styles.previewDialog}
                            content={getPreviewContent(file)}
                            isVisible={isVisible}
                            onDismiss={() => setIsVisible(false)}
                            contentType={file.type?.includes('image') ? 'image' : undefined}
                          />
                        </FileUploaderItem>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <FlatList
                    horizontal
                    data={files}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item: file, index }) => (
                      <FileUploaderItem key={index} index={index} style={styles.fileItem}>
                        {renderFileItemUI ? (
                          renderFileItemUI(file)
                        ) : (
                          <TouchableOpacity
                            onPress={() => setIsVisible(true)}
                            key={file.name}
                            style={styles.filePreviewContainer}
                          >
                            <View style={styles.fileIconContainer}>
                              {file?.type?.includes('image') ? (
                                <Image
                                  source={{ uri: URL.createObjectURL(file) }}
                                  style={styles.thumbnailImage}
                                  resizeMode='cover'
                                />
                              ) : (
                                <Feather name='file' size={48} color={myTheme.mutedForeground} />
                              )}
                            </View>
                            <MyText text={file.name} styleProps={styles.fileNamePreview} />
                          </TouchableOpacity>
                        )}
                        <PreviewDialog
                          style={styles.previewDialog}
                          content={getPreviewContent(file)}
                          isVisible={isVisible}
                          onDismiss={() => setIsVisible(false)}
                          contentType={file.type?.includes('image') ? 'image' : undefined}
                        />
                      </FileUploaderItem>
                    )}
                    style={styles.horizontalFilesList}
                    showsHorizontalScrollIndicator={false}
                  />
                )}
              </View>
            )}
          </FileUploaderContent>
        </FileUploader>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  previewDialog: {
    maxWidth: Dimensions.get('window').width * 0.8
  },
  container: {
    width: '100%'
  },
  dropzone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12
  },
  vertical: {
    // Default React Native flex direction is column
  },
  horizontal: {
    flexDirection: 'row'
  },
  inputContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  uploadIcon: {
    marginBottom: 16
  },
  dragActiveText: {
    fontSize: 18,
    fontWeight: '500'
  },
  primaryText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center'
  },
  secondaryText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center'
  },
  messageText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32
  },
  scrollArea: {
    height: 120,
    width: '100%',
    borderTopWidth: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical: 8
  },
  filesContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 200
  },
  filePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },
  fileIconContainer: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  thumbnailImage: {
    width: 48,
    height: 48,
    objectFit: 'cover',
    borderRadius: 8,
    borderWidth: 2
  },
  fileNamePreview: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 200,
    marginLeft: 12
  },
  horizontalFilesList: {
    flexDirection: 'row',
    marginTop: 8
  }
})

export default UploadFilePreview
