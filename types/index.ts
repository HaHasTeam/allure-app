import { ICartItem } from './cart'
import { RouteConfigType } from './routes'

export enum ActionResponseErrorCodeEnum {
  INTERNAL_SERVER_ERROR = 500,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
}

export interface ActionResponseError {
  code: ActionResponseErrorCodeEnum
  message?: string
}
export type Product = {
  id: string
  title: string
  price: number
}
export interface ActionResponse<T> {
  error?: ActionResponseError
  data?: T
  message: string
}

export type ConfigType = {
  routes: RouteConfigType
}
export type CartItems = ICartItem
export type TEmailDecoded = {
  accountId: string
}
export type TAuth = {
  accessToken: string
  refreshToken: string
}
