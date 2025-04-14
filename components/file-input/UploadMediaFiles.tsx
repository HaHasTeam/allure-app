/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Feather } from '@expo/vector-icons'
import { useEvent } from 'expo'
import { useVideoPlayer, VideoView } from 'expo-video'
import { ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Dimensions, Image, ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native'

import MyText from '../common/MyText'

import { FileInput, FileUploader, FileUploaderContent, ProductFileUploaderItem } from '@/components/file-input'
import { PreviewDialog } from '@/components/file-input/PreviewImageDialog'
import { myTheme } from '@/constants'
import useHandleServerError from '@/hooks/useHandleServerError'
// import { useToast } from '@/hooks/useToast'
// import { uploadFilesApi } from '@/network/apis/file'
// import { createFiles } from '@/utils/files'

type UploadFileModalProps<T extends FieldValues> = {
  header?: ReactNode
  dropZoneConfigOptions?: any
  field: ControllerRenderProps<T>
  renderInputUI?: (isDragActive: boolean, files: File[], maxFiles: number, message?: string) => ReactNode
  renderFileItemUI?: (files: File) => ReactNode
  vertical: boolean
  centerItem?: boolean
  setIsImagesUpload?: React.Dispatch<SetStateAction<boolean>>
  setIsMediaUpload?: React.Dispatch<SetStateAction<boolean>>
  isAcceptImage?: boolean
  isAcceptFile?: boolean
  isFullWidth?: boolean
  isAcceptVideo?: boolean
  maxImages: number
  maxVideos: number
}

const UploadMediaFiles = <T extends FieldValues>({
  dropZoneConfigOptions,
  field,
  header,
  renderInputUI,
  renderFileItemUI,
  vertical = true,
  centerItem = false,
  isAcceptImage = true,
  isAcceptVideo = false,
  isAcceptFile = false,
  maxImages,
  maxVideos,
  setIsImagesUpload,
  setIsMediaUpload,
  isFullWidth = false
}: UploadFileModalProps<T>) => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [files, setFiles] = useState<File[]>([])
  const handleServerError = useHandleServerError()

  // Track file types separately
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [otherFiles, setOtherFiles] = useState<File[]>([])

  const { fieldType, fieldValue } = useMemo<{
    fieldType: 'string' | 'array' | 'object'
    fieldValue: string | string[]
  }>(() => {
    if (typeof field?.value === 'string') {
      if (dropZoneConfigOptions?.maxFiles && dropZoneConfigOptions?.maxFiles > 1) {
        throw new Error(t('validation.arrayRequired'))
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
    throw new Error(t('validation.stringOrArrayRequired'))
  }, [field?.value, t, dropZoneConfigOptions?.maxFiles])

  const isDragActive = false
  const dropZoneConfig = {
    accept: {
      ...(isAcceptImage ? { 'image/*': ['.jpg', '.jpeg', '.png'] } : {}),
      ...(isAcceptVideo ? { 'video/*': ['.mp4', '.wmv', '.mov', '.avi', '.mkv', '.flv'] } : {}), //mp4|mov|avi|mkv|wmv|flv
      ...(isAcceptFile
        ? {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
          }
        : {})
    },
    multiple: true,
    maxFiles: maxImages + maxVideos || 10,
    maxSize: 10 * 1024 * 1024, // 10MB default max size
    ...dropZoneConfigOptions
  }

  // Organize files by type
  const updateFilesByType = (allFiles: File[]) => {
    const images = allFiles.filter((file) => file.type.includes('image'))
    const videos = allFiles.filter((file) => file.type.includes('video'))
    const others = allFiles.filter((file) => !file.type.includes('image') && !file.type.includes('video'))

    setImageFiles(images)
    setVideoFiles(videos)
    setOtherFiles(others)

    return { images, videos, others }
  }

  // Check if file limits are exceeded
  const checkFileLimits = (files: File[]) => {
    const { images, videos } = updateFilesByType(files)

    if (maxImages && images.length > maxImages) {
      handleServerError({
        error: new Error(t('validation.maxImagesExceeded', { count: maxImages }))
      })
      return false
    }

    if (maxVideos && videos.length > maxVideos) {
      handleServerError({
        error: new Error(t('validation.maxVideosExceeded', { count: maxVideos }))
      })
      return false
    }

    return true
  }

  useEffect(() => {
    const transferData = async () => {
      try {
        if (Array.isArray(fieldValue)) {
          if (fieldValue.length === files.length) {
            return
          }

          setFiles(field?.value)
          updateFilesByType(field?.value)
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
      if (setIsMediaUpload) {
        setIsMediaUpload(true)
      } else if (setIsImagesUpload) {
        setIsImagesUpload(true)
      }

      // String type handling (single file)
      if (fieldType === 'string') {
        if (!newFiles?.length && field.onChange) {
          field.onChange('' as unknown as React.ChangeEvent<HTMLInputElement>)
        }
        if (newFiles?.length) {
          field?.onChange?.(newFiles[0] as unknown as React.ChangeEvent<HTMLInputElement>)
        }
        return
      }

      // Array type handling (multiple files)
      if (fieldType === 'array' && field?.value) {
        if (!newFiles) {
          return field.onChange?.([] as unknown as React.ChangeEvent<HTMLInputElement>)
        }

        let updatedFiles: File[] = []

        // Adding new files
        if (newFiles.length > oldFiles.length) {
          const diffedFiles = newFiles.filter((file) => {
            return !oldFiles?.some(
              (oldFile) => oldFile.name === file.name && oldFile.lastModified === file.lastModified
            )
          })

          updatedFiles = [...field.value, ...diffedFiles]

          // Check if file limits are exceeded
          if (!checkFileLimits(updatedFiles)) {
            return // Don't update if limits exceeded
          }

          setFiles(updatedFiles)
          updateFilesByType(updatedFiles)

          field?.onChange?.(updatedFiles as unknown as React.ChangeEvent<HTMLInputElement>)
        }
        // Removing files
        else {
          const deletedIndex = oldFiles.findIndex((oldFile) => {
            return !newFiles.some((file) => file.name === oldFile.name && file.lastModified === oldFile.lastModified)
          })

          if (deletedIndex !== -1) {
            updatedFiles = [...field.value]
            updatedFiles.splice(deletedIndex, 1)

            setFiles(updatedFiles)
            updateFilesByType(updatedFiles)

            field?.onChange?.(updatedFiles as unknown as React.ChangeEvent<HTMLInputElement>)
          }
        }
      }
    } catch (error) {
      handleServerError({
        error
      })
    }
  }

  // Build message about file types and limits
  const getAcceptedFormatsMessage = () => {
    const formats = Object.values(dropZoneConfig.accept).flat().join(', ')

    let message = `${t('validation.fileCountValid', {
      count: dropZoneConfig.maxFiles
    })}. ${t('validation.fileFormat')} ${formats}. ${t('validation.sizeFileValid', {
      size: dropZoneConfig.maxSize / (1024 * 1024)
    })}`

    if (maxImages && maxVideos) {
      message += ` ${t('validation.fileTypeLimits', {
        imageCount: maxImages,
        videoCount: maxVideos
      })}`
    } else if (maxImages) {
      message += ` ${t('validation.maxImages', { count: maxImages })}`
    } else if (maxVideos) {
      message += ` ${t('validation.maxVideos', { count: maxVideos })}`
    }

    return message
  }

  const message = getAcceptedFormatsMessage()

  // Get appropriate icon and preview for file type
  // Get appropriate icon and preview for file type
  const getFilePreview = (file: File) => {
    const player = useVideoPlayer(URL.createObjectURL(file), (player) => {
      player.loop = true
      player.play()
    })

    const { isPlaying } = useEvent(player, 'playingChange', {
      isPlaying: player.playing
    })
    URL.revokeObjectURL(URL.createObjectURL(file))
    if (file.type.includes('image')) {
      return (
        <Image
          source={{ uri: URL.createObjectURL(file) }}
          style={styles.image}
          onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
        />
      )
    } else if (file.type.includes('video')) {
      return (
        <View style={styles.videoContainer}>
          <VideoView player={player} allowsPictureInPicture style={styles.video}>
            {t('validation.videoBrowser')}
          </VideoView>
          <Feather
            name='play-circle'
            size={40}
            color={myTheme.primary} // text-primary
            style={styles.playIcon}
          />
        </View>
      )
    } else {
      return (
        <Feather
          name='file' // Assuming FilesIcon maps to "file" in Feather
          size={48} // w-12 h-12
          color={myTheme.mutedForeground} // text-muted-foreground
        />
      )
    }
  }
  // Get file type for preview dialog
  const getFileContentType = (file: File) => {
    if (file.type.includes('image')) return 'image'
    if (file.type.includes('video')) return 'video'
    return 'text'
  }

  // Preview content for dialog
  const getPreviewContent = (file: File) => {
    const player = useVideoPlayer(URL.createObjectURL(file), (player) => {
      player.loop = true
      player.play()
    })

    const { isPlaying } = useEvent(player, 'playingChange', {
      isPlaying: player.playing
    })
    if (file.type.includes('image')) {
      return URL.createObjectURL(file) // Returns URI for RN Image component
    } else if (file.type.includes('video')) {
      return (
        <View style={styles.defaultContainer}>
          <VideoView style={styles.video} player={player} allowsPictureInPicture>
            {t('validation.videoBrowser')}
          </VideoView>
        </View>
      )
    } else {
      return (
        <View style={styles.defaultContainer}>
          <Feather
            name='file' // Assuming FilesIcon maps to "file" in Feather
            size={48} // w-12 h-12
            color={myTheme.mutedForeground} // text-muted-foreground
          />
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name}
          </Text>
        </View>
      )
    }
  }

  // Additional statistics for UI - but not passing to renderInputUI to match interface
  const fileStats = {
    totalCount: files.length,
    imageCount: imageFiles.length,
    videoCount: videoFiles.length,
    otherCount: otherFiles.length,
    maxImagesReached: maxImages ? imageFiles.length >= maxImages : false,
    maxVideosReached: maxVideos ? videoFiles.length >= maxVideos : false,
    maxFilesReached: files.length >= dropZoneConfig.maxFiles
  }

  return (
    <View>
      {header}
      <View style={[styles.container, isDragActive ? styles.activeDragContainer : styles.inactiveDragContainer]}>
        <FileUploader
          value={files}
          onValueChange={onFileDrop}
          dropzoneOptions={dropZoneConfig}
          style={vertical ? {} : styles.horizontal}
          orientation='horizontal'
        >
          <View style={styles.flexWrap}>
            <FileUploaderContent style={centerItem ? styles.centered : styles.start}>
              {/* Display upload button if not reached max files */}
              {!fileStats.maxFilesReached && (
                <View style={isFullWidth ? styles.fullWidth : {}}>
                  <FileInput>
                    {renderInputUI ? (
                      <View>{renderInputUI(isDragActive, files, dropZoneConfig.maxFiles, message)}</View>
                    ) : (
                      <View style={styles.uploadBox}>
                        <Feather name='upload' style={styles.uploadIcon} />
                        {isDragActive ? (
                          <MyText text={t('createProduct.dropFile')} styleProps={styles.dropFileText} />
                        ) : (
                          <View>
                            <MyText text={t('createProduct.dragAndDrop')} styleProps={styles.dragDropText} />
                            <MyText text={t('createProduct.selectFile')} styleProps={styles.selectFileText} />
                            {!fileStats.maxFilesReached ? (
                              <MyText text={message} styleProps={styles.messageText} />
                            ) : (
                              <MyText text={t('createProduct.reachMaxFiles')} styleProps={styles.messageText} />
                            )}
                            <MyText
                              text={`${t('validation.imageCount', {
                                defaultValue: 'Images'
                              })}: ${fileStats.imageCount}/${maxImages || '∞'}, ${t('validation.videoCount', {
                                defaultValue: 'Videos'
                              })}: ${fileStats.videoCount}/${maxVideos || '∞'}`}
                              styleProps={styles.countsText}
                            />
                          </View>
                        )}
                      </View>
                    )}
                  </FileInput>
                </View>
              )}

              {/* Display files */}
              {files &&
                files.length > 0 &&
                (vertical ? (
                  <ScrollView style={styles.scrollArea}>
                    <View style={styles.filesContainer}>
                      {files.map((file, index) => (
                        <ProductFileUploaderItem key={index} index={index} style={styles.fileItem}>
                          <View style={styles.fullSize}>
                            {renderFileItemUI ? (
                              renderFileItemUI(file)
                            ) : (
                              <TouchableOpacity
                                key={file.name}
                                style={styles.filePreviewContainer}
                                onPress={() => setIsVisible(true)}
                              >
                                {getFilePreview(file)}
                              </TouchableOpacity>
                            )}
                            <PreviewDialog
                              style={styles.previewDialog}
                              content={getPreviewContent(file)}
                              isVisible={isVisible}
                              onDismiss={() => setIsVisible(false)}
                              contentType={getFileContentType(file)}
                            />
                          </View>
                        </ProductFileUploaderItem>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <View style={styles.horizontalFilesContainer}>
                    {files.map((file, index) => (
                      <ProductFileUploaderItem
                        key={index}
                        index={index}
                        style={[styles.fileItemHorizontal, isFullWidth ? styles.fullWidthItem : styles.squareItem]}
                      >
                        {renderFileItemUI ? (
                          renderFileItemUI(file)
                        ) : (
                          <TouchableOpacity
                            key={file.name}
                            style={styles.filePreviewContainer}
                            onPress={() => setIsVisible(true)}
                          >
                            {getFilePreview(file)}
                          </TouchableOpacity>
                        )}
                        <PreviewDialog
                          style={styles.previewDialog}
                          content={getPreviewContent(file)}
                          isVisible={isVisible}
                          onDismiss={() => setIsVisible(false)}
                          contentType={getFileContentType(file)}
                        />
                      </ProductFileUploaderItem>
                    ))}
                  </View>
                ))}
            </FileUploaderContent>
          </View>
        </FileUploader>
      </View>
    </View>
  )
}

export default UploadMediaFiles

// Styles
const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'contain'
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)', // bg-black/5
    borderRadius: 8,
    position: 'relative'
  },
  video: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 8
  },
  playIcon: {
    position: 'absolute',
    pointerEvents: 'none' // pointer-events-none
  },
  defaultContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column' // Default flex direction in RN is column
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500', // font-medium
    maxWidth: 200,
    overflow: 'hidden'
  },
  container: {
    flexDirection: 'row'
  },
  activeDragContainer: {
    borderColor: myTheme.primary,
    backgroundColor: 'rgba(var(--primary), 0.1)'
  },
  inactiveDragContainer: {
    borderColor: myTheme.mutedForeground
  },
  horizontal: {
    flexDirection: 'row'
  },
  flexWrap: {
    width: '100%',
    flexWrap: 'wrap'
  },
  centered: {
    justifyContent: 'center'
  },
  start: {
    justifyContent: 'flex-start'
  },
  fullWidth: {
    width: '100%'
  },
  uploadBox: {
    width: 128,
    height: 128,
    overflow: 'hidden',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    borderColor: myTheme.primary,
    padding: 16
  },
  uploadIcon: {
    width: 48,
    height: 48,
    marginBottom: 16,
    color: myTheme.mutedForeground
  },
  dropFileText: {
    fontSize: 18,
    fontWeight: '500',
    color: myTheme.foreground
  },
  dragDropText: {
    fontSize: 18,
    fontWeight: '500',
    color: myTheme.primary
  },
  selectFileText: {
    marginTop: 8,
    fontSize: 14,
    color: myTheme.mutedForeground
  },
  messageText: {
    marginTop: 8,
    fontSize: 14,
    color: myTheme.primary,
    paddingHorizontal: 32
  },
  countsText: {
    marginTop: 8,
    fontSize: 12,
    color: myTheme.mutedForeground
  },
  scrollArea: {
    height: 160,
    width: '100%',
    borderRadius: 4,
    paddingVertical: 8,
    borderTopWidth: 4,
    borderColor: myTheme.primary
  },
  filesContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16
  },
  fileItem: {
    padding: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8
  },
  fullSize: {
    width: '100%',
    height: '100%'
  },
  previewDialog: {
    maxWidth: Dimensions.get('window').width * 0.8
  },
  filePreviewContainer: {
    width: 128,
    height: 128,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgb(51, 51, 51)', // Approximation for gay-300
    padding: 0,
    position: 'relative'
  },
  horizontalFilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  fileItemHorizontal: {
    padding: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8
  },
  fullWidthItem: {
    width: '100%',
    height: 64
  },
  squareItem: {
    width: 128,
    height: 128
  }
})
