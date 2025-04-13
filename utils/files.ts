import { FileStatusEnum } from '@/types/enum'
import { CustomFile, TFile } from '@/types/file'

export async function createFiles(files: TFile[] | string[]): Promise<CustomFile[]> {
  if (typeof files[0] === 'string') {
    files = files as string[]
    const constructedFiles = await Promise.all(
      files.map(async (file) => {
        const response = await fetch(file)
        const data = await response.blob()
        const metadata = {
          type: data.type,
          name: file.split('/').pop()
        }
        const newFile = new File([data], file.split('/').pop() ?? 'untitled', metadata)

        Object.defineProperty(newFile, 'fileUrl', {
          value: file,
          writable: true
        })
        Object.defineProperty(newFile, 'status', {
          value: FileStatusEnum.ACTIVE,
          writable: true
        })

        return newFile
      })
    )
    return constructedFiles
  }
  if (files.length && typeof files[0] !== 'string') {
    files = files as TFile[]
    const constructedFiles = await Promise.all(
      files.map(async (file) => {
        const response = file.status !== FileStatusEnum.INACTIVE ? await fetch(file.fileUrl) : new Response(new Blob())
        const data = await response.blob()
        const metadata = {
          type: data.type,
          name: file.name
        }
        const newFile = new File([data], file.name, metadata)

        Object.defineProperty(newFile, 'fileUrl', {
          value: file.fileUrl,
          writable: true
        })
        Object.defineProperty(newFile, 'id', {
          value: file.id,
          writable: true
        })
        Object.defineProperty(newFile, 'status', {
          value: file.status,
          writable: true
        })

        return newFile
      })
    )
    return constructedFiles
  }
  return []
}
