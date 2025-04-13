import { FileEnum, FileStatusEnum, StatusEnum } from './enum'
import { TMetaData } from './request'

export type TFile = {
  name: string
  fileUrl: string
  id?: string
  status?: FileStatusEnum
}

export type CustomFile = File & {
  fileUrl?: string
  id?: string
  status?: FileStatusEnum
}

export type TServerFile = TMetaData & {
  id: string
  fileUrl: string
  name: null
  status: StatusEnum
  type: FileEnum
}
