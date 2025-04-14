import { Foundation, MaterialCommunityIcons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
import { RefObject, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native'
import { z } from 'zod'

import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from '.'
import ImageWithFallback from '../image/ImageWithFallBack'

import { myTheme } from '@/constants'
import { uploadFilesApi } from '@/hooks/api/file'
import useHandleServerError from '@/hooks/useHandleServerError'
import { FileStatusEnum } from '@/types/enum'
import { CustomFile, TFile } from '@/types/file'
import { createFiles } from '@/utils/files'

export type TriggerUploadRef = {
  triggers: (() => Promise<void>)[]
}
export const formSchema = z
  .object({
    images: z.array(
      z.object({
        name: z.string(),
        fileUrl: z.string()
      })
    )
  })
  .and(z.any())

type SchemaType = z.infer<typeof formSchema>

type UploadFilesProps = {
  triggerRef: RefObject<TriggerUploadRef>
  dropZoneConfigOptions?: any
  field: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> & {
    value: TFile | TFile[]
  }
  form?: UseFormReturn<SchemaType>
}

type TFieldFile =
  | {
      fieldType: 'single'
      fieldValue: TFile
    }
  | {
      fieldType: 'multiple'
      fieldValue: TFile[]
    }

const UploadFiles = ({ dropZoneConfigOptions, field, triggerRef }: UploadFilesProps) => {
  const [files, setFiles] = useState<CustomFile[]>([])
  const handleServerError = useHandleServerError()

  const dropZoneConfig = {
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxFiles: 1,
    maxSize: 1 * 1024 * 1024,
    ...dropZoneConfigOptions
  }

  const { mutateAsync: uploadFilesFn, isPending: isUploadingFiles } = useMutation({
    mutationKey: [uploadFilesApi.mutationKey],
    mutationFn: uploadFilesApi.fn
  })

  const { fieldType, fieldValue } = useMemo<TFieldFile>(() => {
    if (!Array.isArray(field?.value)) {
      if (dropZoneConfig?.maxFiles && dropZoneConfig?.maxFiles > 1) {
        throw new Error('Field value must be an array')
      }

      return {
        fieldType: 'single',
        fieldValue: field?.value as unknown as TFile
      }
    } else if (Array.isArray(field?.value)) {
      return {
        fieldType: 'multiple',
        fieldValue: field?.value as TFile[]
      }
    }
    throw new Error("Invalid field value. Must be either 'single' or 'multiple'")
  }, [field?.value, dropZoneConfig?.maxFiles])

  useEffect(() => {
    const transferData = async () => {
      try {
        if (fieldType === 'single' && fieldValue) {
          if ((fieldValue === ({} as TFile) && files.length === 0) || (!!fieldValue.fileUrl && files.length === 1)) {
            return
          }
          const constructedFiles = await createFiles([fieldValue])
          setFiles(constructedFiles)
        }
        if (fieldType === 'multiple' && fieldValue) {
          if (fieldValue.length === files.length) {
            return
          }

          const constructedFiles = await createFiles(fieldValue)

          setFiles(constructedFiles)
        }
      } catch (error) {
        handleServerError({
          error
        })
      }
    }
    transferData()
    // eslint-disable-next-line
  }, [fieldValue, fieldType, files])

  const onFileDrop = async (newFiles: CustomFile[] | null) => {
    try {
      if (fieldType === 'single') {
        const file = newFiles ? newFiles[0] : null
        const fileItem: TFile = {
          fileUrl: file?.fileUrl ?? URL.createObjectURL(file as File),
          name: file?.name as string
        }

        if (field.onChange) field.onChange(fileItem as unknown as React.ChangeEvent<HTMLInputElement>)
        return setFiles([file as CustomFile])
      }
      if (fieldType === 'multiple') {
        const deleteFiles: TFile[] = []

        if (newFiles && newFiles.length < files.length) {
          for (let i = 0; i < files.length; i++) {
            if (files[i].id && !newFiles.find((file) => file.id === files[i].id)) {
              const file = Object.defineProperty(files[i], 'status', {
                value: FileStatusEnum.INACTIVE,
                writable: true
              })
              deleteFiles.push(file as TFile)
            }
          }
        }

        const combineFiles = newFiles ? [...newFiles, ...deleteFiles] : [...deleteFiles]

        const fileValues: TFile[] = combineFiles?.map((file) => ({
          id: file.id ?? undefined,
          fileUrl: file.fileUrl ?? URL.createObjectURL(file as File),
          name: file.name as string,
          status: file.status ?? undefined
        })) as TFile[]

        if (field.onChange) field.onChange(fileValues as unknown as React.ChangeEvent<HTMLInputElement>)
        return setFiles(combineFiles as CustomFile[])
      }
    } catch (error) {
      handleServerError({
        error
      })
    }
  }

  const handleUploadFiles = useCallback(async () => {
    try {
      const formData = new FormData()

      files.forEach((file) => {
        if (!!file.fileUrl && file.fileUrl.includes('https://firebasestorage.googleapis.com/')) return

        formData.append('files', file)
      })

      const constructedFiles: TFile[] = await uploadFilesFn(formData).then((res) => {
        const fileItem = res.data

        let fileIndex = 0
        const result = files.map((file) => {
          if (file.fileUrl && file.fileUrl.includes('https://firebasestorage.googleapis.com/')) {
            return {
              id: file.id ?? undefined,
              name: file.name,
              fileUrl: file.fileUrl,
              status: file.status ?? undefined
            }
          }

          return {
            name: file.name,
            fileUrl: fileItem[fileIndex++]
          }
        })
        return result
      })

      if (field.onChange) {
        if (fieldType === 'single') {
          field.onChange(constructedFiles[0] as unknown as React.ChangeEvent<HTMLInputElement>)
        }
        if (fieldType === 'multiple') {
          field.onChange(constructedFiles as unknown as React.ChangeEvent<HTMLInputElement>)
        }
      }
    } catch (error) {
      handleServerError({
        error
      })
    }
  }, [field, fieldType, files, handleServerError, uploadFilesFn])

  useImperativeHandle(triggerRef, () => {
    const triggerFns = triggerRef.current?.triggers
    if (triggerFns) {
      return {
        triggers: [...triggerFns, handleUploadFiles]
      }
    }
    return {
      triggers: [handleUploadFiles]
    }
  }, [handleUploadFiles, triggerRef])
  const handlePreview = async (fileUrl: string) => {
    Linking.openURL(fileUrl)
  }
  return (
    <FileUploader
      value={files}
      onValueChange={onFileDrop}
      dropzoneOptions={dropZoneConfig}
      style={styles.fileUploaderContainer}
    >
      <View style={styles.inputContainer}>
        <FileInput disabled={isUploadingFiles} style={styles.fileInput}>
          <View style={styles.dropArea}>
            <View style={styles.dropAreaContent}>
              <MaterialCommunityIcons
                name='file-image-plus'
                style={styles.icon}
                color={myTheme.mutedForeground}
                size={20}
              />
              <View>
                <View style={styles.textContainer}>
                  <View style={styles.textRow}>
                    <View style={styles.textSpacing}>
                      <View style={styles.text}>
                        <View style={styles.instruction}>
                          <View style={styles.instructionText}>
                            <View style={styles.inline}>
                              <View style={styles.dragDrop}>
                                <View style={styles.dragDropText}>
                                  <View>
                                    <View>
                                      <Text style={styles.countText}>Drag & drop or browse files </Text>
                                      <Text style={styles.bold}>
                                        {`(${
                                          files.filter((file) => file.status !== FileStatusEnum.INACTIVE).length
                                        }/${dropZoneConfig.maxFiles})`}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </FileInput>
      </View>
      <View style={styles.contentContainer}>
        <FileUploaderContent>
          {files && files.length > 0 && (
            <View>
              <FlatList
                data={files}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item: file, index }) =>
                  file.status !== FileStatusEnum.INACTIVE ? (
                    <FileUploaderItem key={index} index={index} style={styles.fileItem}>
                      <View style={styles.fileContent}>
                        <TouchableOpacity
                          style={styles.filePreview}
                          onPress={() => {
                            // Open file preview
                            handlePreview(URL.createObjectURL(file))
                          }}
                        >
                          {file?.type?.includes('image') ? (
                            <ImageWithFallback
                              source={{ uri: file.fileUrl ?? '' }}
                              style={styles.previewImage}
                              resizeMode='contain'
                            />
                          ) : (
                            <Foundation name='paperclip' size={64} color={myTheme.mutedForeground} />
                          )}
                        </TouchableOpacity>
                        <View style={styles.fileInfo}>
                          <View style={styles.fileName}>
                            <Text style={styles.fileNameText}>{file.name}</Text>
                          </View>
                          <View style={styles.fileSize}>
                            <Text style={styles.fileSizeText}>{Math.round((file.size || 0) / 1024)} KB</Text>
                          </View>
                        </View>
                      </View>
                    </FileUploaderItem>
                  ) : null
                }
                style={styles.fileList}
              />
            </View>
          )}
        </FileUploaderContent>
      </View>
    </FileUploader>
  )
}

const styles = StyleSheet.create({
  fileUploaderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  inputContainer: {
    flex: 2,
    aspectRatio: 1
  },
  fileInput: {
    width: '100%',
    height: '100%',
    backgroundColor: myTheme.background
  },
  dropArea: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    borderColor: 'gray'
  },
  dropAreaContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8
  },
  icon: {
    alignSelf: 'center'
  },
  textContainer: {
    flex: 1
  },
  textRow: {
    flexDirection: 'row'
  },
  textSpacing: {
    flex: 1
  },
  text: {
    flex: 1
  },
  instruction: {
    flex: 1
  },
  instructionText: {
    flex: 1
  },
  inline: {
    flex: 1
  },
  dragDrop: {
    flex: 1
  },
  dragDropText: {
    flex: 1
  },
  textForeground: {
    color: myTheme.foreground
  },
  countText: {
    fontSize: 12,
    textAlign: 'center',
    flex: 1
  },
  bold: {
    fontWeight: 'bold'
  },
  contentContainer: {
    flex: 3,
    width: '100%',
    maxHeight: 400
  },
  fileList: {
    flex: 1
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: myTheme.background
  },
  fileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '95%',
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  filePreview: {
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'gray'
  },
  fileInfo: {
    marginLeft: 12,
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden'
  },
  fileName: {
    overflow: 'hidden'
  },
  fileNameText: {
    fontWeight: '500',
    fontSize: 14
  },
  fileSize: {
    marginTop: 2
  },
  fileSizeText: {
    color: myTheme.mutedForeground,
    fontSize: 12,
    fontWeight: 'bold'
  }
})
export default UploadFiles
