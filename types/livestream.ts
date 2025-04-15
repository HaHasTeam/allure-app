import { LiveStreamEnum } from './enum'

export interface ILivestream {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  startTime: string
  endTime: string
  record: string | null
  thumbnail: string
  status: LiveStreamEnum
}
