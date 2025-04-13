import { Feather } from '@expo/vector-icons'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { PreviewDialog } from '../file-input/PreviewImageDialog'
import { VideoThumbnailServer } from '../file-input/VideoThumbnail'
import ImageWithFallback from '../image/ImageWithFallBack'

import { myTheme } from '@/constants'
import { TServerFile } from '@/types/file'
import { isImageFile, isVideoFile } from '@/utils/media-files'

interface ViewMediaSectionProps {
  mediaFiles: TServerFile[]
}

export default function ViewMediaSection({ mediaFiles }: ViewMediaSectionProps) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)

  const videoFiles = mediaFiles.filter((file: TServerFile) => file.fileUrl && isVideoFile(file.fileUrl))
  const imageFiles = mediaFiles.filter((file: TServerFile) => file.fileUrl && isImageFile(file.fileUrl))

  const displayableFiles = [...videoFiles, ...imageFiles]
  // Get file type based on file URL
  const getFileContentType = (file: TServerFile) => {
    if (!file.fileUrl) return 'text'
    if (isImageFile(file.fileUrl)) return 'image'
    if (isVideoFile(file.fileUrl)) return 'video'
    return 'text'
  }

  // Preview content for dialog
  const getPreviewContent = (file: TServerFile) => {
    const contentType = getFileContentType(file)

    if (contentType === 'image') {
      return file.fileUrl
    } else if (contentType === 'video') {
      return (
        <View style={styles.videoContainer}>
          <video src={file.fileUrl} controls style={styles.video}>
            {t('validation.videoBrowser')}
          </video>
        </View>
      )
    } else {
      return (
        <View style={styles.fileContainer}>
          <Feather name='file' size={48} color={myTheme.mutedForeground} />
          <Text style={styles.fileName} numberOfLines={1}>
            {file.fileUrl && file.fileUrl.split('/').pop()}
          </Text>
        </View>
      )
    }
  }

  return (
    <View style={styles.container}>
      {displayableFiles.map((file) => (
        <>
          <TouchableOpacity onPress={() => setIsVisible(true)}>
            <View style={styles.thumbnailContainer}>
              {isVideoFile(file.fileUrl) ? (
                <VideoThumbnailServer file={file} />
              ) : (
                <ImageWithFallback
                  source={{ uri: file.fileUrl }}
                  alt={`${file.id}`}
                  resizeMode='contain'
                  style={styles.image}
                />
              )}
            </View>
          </TouchableOpacity>
          <PreviewDialog
            key={file.id}
            content={getPreviewContent(file)}
            isVisible={isVisible}
            contentType={getFileContentType(file)}
            onDismiss={() => setIsVisible(false)}
          />
        </>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8 // RN doesn't support gap directly, handled via margins
  },
  thumbnailContainer: {
    width: 128,
    height: 128,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: myTheme.gray[300],
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  videoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  video: {
    maxWidth: '100%',
    maxHeight: '100%'
  },
  fileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 200,
    color: myTheme.foreground
  }
})
